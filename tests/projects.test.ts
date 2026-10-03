import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROJECTS, PROJECT_BY_ID, PROJECT_TOPICS, BEGINNER_PROJECTS, stackId, recommendProjects } from '../src/lib/projects';
import { TOPICS } from '../src/lib/content';
import { INVENTORY_ITEMS } from '../src/lib/inventory';
import { EMPTY_PROGRESS, normalizeProgress, mergeProgress, markActivity, resetSnapshot, isProgressPayload } from '../src/lib/syncTypes';
import { actOnProject } from '../src/lib/projectProgress';
import { buildFeed } from '../src/lib/feed';
const day='2026-10-03';
const start=(id:string)=>actOnProject(EMPTY_PROGRESS,id,{type:'resume'},day,1);

test('all 17 graphs retain 168 reachable nodes and 30 branching points; every node reaches an end',()=>{
 let nodes=0,branches=0;
 assert.equal(PROJECTS.length,17);
 for(const p of PROJECTS){
  const seen=new Set<string>();
  const visit=(id:string)=>{if(seen.has(id))return;seen.add(id);const b=p.beats[id];assert.ok(b);if(b.continue)visit(b.continue);for(const c of b.choices??[])visit(c.next);};
  visit(p.startBeat);assert.equal(seen.size,Object.keys(p.beats).length);
  for(const b of Object.values(p.beats)){
   nodes++;if(b.choices)branches++;
   assert.equal(b.id,Object.entries(p.beats).find(([,s])=>s===b)![0]);
   assert.equal([!!b.continue,!!b.choices,!!b.end].filter(Boolean).length,1);
   const reachesEnd=(id:string,seen=new Set<string>()):boolean=>{if(seen.has(id))return false;seen.add(id);const s=p.beats[id];return !!s.end || [s.continue,...(s.choices??[]).map(c=>c.next)].filter(Boolean).some(next=>reachesEnd(next!,new Set(seen)));};
   assert.ok(reachesEnd(b.id),`${p.id}/${b.id} has no terminal path`);
   for(const effect of [...(b.setsStatus??[]),...(b.choices??[]).flatMap(c=>c.setsStatus??[])])assert.ok(INVENTORY_ITEMS.some(i=>i.id===stackId(effect.itemId)));
  }
  for(const gear of [...(p.recommendsIfInterested??[]),...(p.recommendsIfInstalled??[])]) assert.ok(INVENTORY_ITEMS.some(i=>i.id===stackId(gear)));
  assert.ok(PROJECT_TOPICS[p.id].length);for(const t of PROJECT_TOPICS[p.id])assert.ok(TOPICS.some(topic=>topic.id===t));
  assert.equal(new URL(p.sourceGuide).hostname,'labthrift.com');
 }
 assert.equal(nodes,168);assert.equal(branches,30);assert.equal(INVENTORY_ITEMS.length,19);
});

test('branch choice, backtracking, alternate choice and reload keep valid path and unique rewards',()=>{
 const id='photos-backup-pick',project=PROJECT_BY_ID[id];let p=start(id);
 while(!project.beats[p.projects[id].stepId].choices){const next=project.beats[p.projects[id].stepId].continue!;p=actOnProject(p,id,{type:'advance',next},day,2);}
 const branch=project.beats[p.projects[id].stepId];
 p=actOnProject(p,id,{type:'advance',next:branch.choices![0].next},day,3);
 const xp=p.xp,steps=p.projects[id].completedSteps;
 p=actOnProject(p,id,{type:'back'},day,4);
 p=actOnProject(p,id,{type:'advance',next:branch.choices![1].next},day,5);
 assert.equal(p.xp,xp);assert.deepEqual(p.projects[id].completedSteps,steps);
 assert.ok(isProgressPayload(JSON.parse(JSON.stringify(p))));
 assert.equal(p.projects[id].path.at(-1),branch.choices![1].next);
 const invalid=actOnProject(p,id,{type:'advance',next:'bad'},day,6);assert.deepEqual(p,invalid);
 p=actOnProject(p,id,{type:'pause'},day,7);assert.equal(p.projects[id].phase,'paused');
 p=actOnProject(p,id,{type:'resume'},day,8);assert.equal(p.projects[id].stepId,branch.choices![1].next);
});

test('finish is explicit; replay and retries never award twice or install equipment',()=>{
 for(const project of PROJECTS){let p=start(project.id);let n=2;
  while(!project.beats[p.projects[project.id].stepId].end){const b=project.beats[p.projects[project.id].stepId];p=actOnProject(p,project.id,{type:'advance',next:b.continue??b.choices![0].next},day,n++);assert.ok(n<100);}
  assert.equal(p.projects[project.id].completed,false);
  const gear={...p.inventory};p=actOnProject(p,project.id,{type:'finish'},day,n++);assert.deepEqual(p.inventory,gear);
  assert.equal(p.projects[project.id].completed,true);assert.ok(isProgressPayload(p));
  const xp=p.xp;p=actOnProject(p,project.id,{type:'finish'},day,n++);assert.equal(p.xp,xp);
  p=actOnProject(p,project.id,{type:'replay'},day,n++);assert.equal(p.projects[project.id].stepId,project.startBeat);
  p=actOnProject(p,project.id,{type:'skip'},day,n++);assert.equal(p.projects[project.id].skipped,true);assert.equal(p.xp,xp);
 }
});

test('migration, two-device rewards, daily shared bonus, legacy client preservation and reset generation',()=>{
 const {schemaVersion,projects,rewardIds,learningXp,activityDays,dailyBonusDays,generation,resetId,inventoryUpdatedAt,...v1}=EMPTY_PROGRESS;
 void [schemaVersion,projects,rewardIds,learningXp,activityDays,dailyBonusDays,generation,resetId,inventoryUpdatedAt];
 const migrated=normalizeProgress({...v1,xp:120,completedLessons:['one'],quizAnswers:{q:{choice:1,correct:true,lessonId:'one'}},inventory:{nas:'have'}});
 assert.equal(migrated.xp,120);assert.deepEqual(migrated.projects,{});
 let a=start('first-ssh'),b=start('first-backup');
 a=actOnProject(a,'first-ssh',{type:'advance',next:PROJECT_BY_ID['first-ssh'].beats.start.continue!},day,2);
 b=actOnProject(b,'first-backup',{type:'advance',next:PROJECT_BY_ID['first-backup'].beats.start.continue!},day,3);
 const merged=mergeProgress(a,b);assert.equal(merged.xp,70);assert.equal(merged.rewardIds.length,2);assert.deepEqual(mergeProgress(a,b),mergeProgress(b,a));
 assert.equal(mergeProgress(merged,merged).xp,70);assert.equal(markActivity(merged,day).xp,70);
 assert.equal(mergeProgress({...v1,xp:70},merged).xp,70);
 assert.equal(mergeProgress(migrated,{...EMPTY_PROGRESS}).xp,120);
 const fresh=resetSnapshot(merged,'reset');assert.equal(mergeProgress(a,fresh).xp,0);assert.deepEqual(fresh.projects,{});
});

test('cursor/history move together by latest update while completed steps union',()=>{
 let a=start('first-ssh');a=actOnProject(a,'first-ssh',{type:'advance',next:'gloss'},day,2);
 let b=actOnProject(a,'first-ssh',{type:'advance',next:'where'},day,3);b=actOnProject(b,'first-ssh',{type:'back'},day,4);
 const merged=mergeProgress(a,b);assert.equal(merged.projects['first-ssh'].stepId,'gloss');assert.deepEqual(merged.projects['first-ssh'].path,['start','gloss']);assert.equal(merged.projects['first-ssh'].completedSteps.length,2);
});

test('feed cadence, gear spacing, filters, resume, sequence and relevance',()=>{
 const feed=buildFeed(['homelab','linux'],[],{});let lessons=0,projects=0;
 feed.forEach((item,i)=>{if(item.kind==='lesson')lessons++;if(item.kind==='project'){projects++;assert.equal(lessons%4,0);assert.notEqual(feed[i-1]?.kind,'inventory');assert.notEqual(feed[i+1]?.kind,'inventory');}});
 assert.equal(projects,2);assert.deepEqual(feed.filter(i=>i.kind==='project').map(i=>i.project.id),BEGINNER_PROJECTS.slice(0,2));assert.equal(buildFeed([],[],{},{},'projects').length,17);
 assert.ok(buildFeed(['homelab'],[],{},{},'lessons').every(i=>i.kind==='lesson'));
 const p=start('first-ssh');assert.equal(buildFeed(['homelab'],[],{},p.projects)[0].kind,'project');
 assert.equal(recommendProjects(['homelab'],{},{}).filter(p=>BEGINNER_PROJECTS.includes(p.id))[0].id,BEGINNER_PROJECTS[0]);
 assert.ok(recommendProjects(['homelab'],{immich:'planned'},{}).some(p=>p.id==='immich-first-weekend'));
 assert.equal(recommendProjects(['kubernetes'],{},{}).length,0);
 const snapshot=JSON.stringify(feed);actOnProject(p,'first-ssh',{type:'skip'},day,3);assert.equal(JSON.stringify(feed),snapshot);
});

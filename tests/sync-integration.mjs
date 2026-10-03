// Disposable, isolated test identity. Defaults to local; --remote opts into live verification.
import {build} from 'esbuild';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const remote=process.argv.includes('--remote');
const origin=remote?'https://app.labthrift.com':'http://localhost:8804';
const dir=await mkdtemp(join(tmpdir(),'byterush-sync-'));
const id=randomUUID(),token=randomBytes(32).toString('hex'),hash=createHash('sha256').update(token).digest('hex');
const sql=async(statement)=>{
 const file=join(dir,'test.sql');await writeFile(file,statement,{mode:0o600});
 const result=spawnSync('node_modules/.bin/wrangler',['d1','execute','DB',remote?'--remote':'--local','--file',file,'--json'],{encoding:'utf8'});
 if(result.status!==0)throw new Error('D1 fixture operation failed: '+(result.stderr||'no diagnostic'));
};
const request=async(method,body)=>{
 const res=await fetch(origin+'/api/sync',{method,headers:{Cookie:'byterush_session='+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
 assert.equal(res.status,200,`${method} status ${res.status}`);return (await res.json()).progress;
};
try{
 await build({stdin:{contents:"export * from './src/lib/syncTypes';export * from './src/lib/projectProgress';export * from './src/lib/projects';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile:join(dir,'model.mjs'),logLevel:'silent'});
 const {EMPTY_PROGRESS,actOnProject,PROJECTS}=await import(join(dir,'model.mjs'));
 await sql(`INSERT INTO users(id,username,created_at) VALUES('${id}','verify-${id.slice(0,8)}',${Date.now()}); INSERT INTO sessions(token_hash,user_id,created_at,expires_at) VALUES('${hash}','${id}',${Date.now()},${Date.now()+600000});`);
 assert.equal(await request('GET'),null);
 const fixtures=PROJECTS.slice(0,4).map(project=>{
  let p=actOnProject(EMPTY_PROGRESS,project.id,{type:'resume'},'2026-10-03',1);
  const step=project.beats[project.startBeat];
  p=actOnProject(p,project.id,{type:'advance',next:step.continue??step.choices[0].next},'2026-10-03',2);
  return p;
 });
 await Promise.all(fixtures.map(progress=>request('PUT',{progress})));
 let p=await request('GET');assert.equal(Object.keys(p.projects).length,4);assert.equal(p.xp,90);
 await request('PUT',{progress:fixtures[0]});p=await request('GET');assert.equal(p.xp,90);
 const legacy=Object.fromEntries(['xp','cardsRead','completedLessons','streak','bestStreak','lastActiveDay','unlockedAchievements','followedTopics','quizAnswers','inventory'].map(k=>[k,p[k]]));
 p=await request('PUT',{progress:legacy});assert.equal(Object.keys(p.projects).length,4);assert.equal(p.xp,90);
 const reset={id:randomUUID(),generation:p.generation};
 p=await request('DELETE',reset);assert.equal(p.xp,0);assert.deepEqual(p.projects,{});
 await request('PUT',{progress:fixtures[0]});p=await request('DELETE',reset);assert.equal(p.xp,0);assert.equal(p.generation,1);
 console.log(`${remote?'LIVE':'LOCAL'} sync verified: GET/PUT/DELETE, 4 concurrent devices, duplicate rewards, legacy omission, reset retry and stale-device protection.`);
} finally {
 await sql(`DELETE FROM users WHERE id='${id}';`);
 await rm(dir,{recursive:true,force:true});
 console.log('Disposable test identity and local fixture files removed.');
}

import { LESSONS, type Lesson } from './content';
import { gearBoost, INVENTORY_ITEMS, type InventoryItem } from './inventory';
import type { InventoryStatus } from './syncTypes';
import { BEGINNER_PROJECTS, PROJECTS, recommendProjects, resumableProject, type Project, type ProjectProgress } from './projects';
export type FeedFilter = 'all' | 'lessons' | 'projects';
export type FeedItem = {kind:'lesson';lesson:Lesson} | {kind:'inventory';item:InventoryItem} | {kind:'project';project:Project};
const INVENTORY_MAX_PER_VISIT = 3;
const INVENTORY_EVERY = 4;
function lessonFeed(
  followed: string[],
  completed: string[],
  inventory: Record<string, InventoryStatus>
): FeedItem[] {
  const byTopic = followed.map((t) => LESSONS.filter((l) => l.topicId === t));
  const interleaved: Lesson[] = [];
  const maxLen = Math.max(0, ...byTopic.map((a) => a.length));
  for (let i = 0; i < maxLen; i++) {
    for (const arr of byTopic) {
      if (arr[i]) interleaved.push(arr[i]);
    }
  }
  // Stable sort: gear-relevant lessons first, round-robin order preserved
  // within the same relevance score.
  const fresh = interleaved
    .filter((l) => !completed.includes(l.id))
    .map((lesson, i) => ({ lesson, i, boost: gearBoost(lesson.id, inventory) }))
    .sort((a, b) => b.boost - a.boost || a.i - b.i)
    .map((e) => e.lesson);
  const done = interleaved.filter((l) => completed.includes(l.id));
  const lessons = [...fresh, ...done];

  // Weave in the next few unanswered gear questions, one every few lessons.
  const pending = INVENTORY_ITEMS.filter((item) => !(item.id in inventory)).slice(
    0,
    INVENTORY_MAX_PER_VISIT
  );
  const feed: FeedItem[] = [];
  let nextPrompt = 0;
  lessons.forEach((lesson, i) => {
    feed.push({ kind: "lesson", lesson });
    if (
      nextPrompt < pending.length &&
      (i + 1) % INVENTORY_EVERY === 0 &&
      i < fresh.length // don't pad the tail of already-done lessons
    ) {
      feed.push({ kind: "inventory", item: pending[nextPrompt++] });
    }
  });
  return feed;
}


/** Pure session construction; actions never rebuild the mounted list. */
export function buildFeed(followed:string[],completed:string[],inventory:Record<string,InventoryStatus>,projects:Record<string,ProjectProgress>={},filter:FeedFilter='all'):FeedItem[] {
 const resume=resumableProject(projects);
 if(filter==='projects') {
   const ids=[...(resume?[resume.id]:[]),...BEGINNER_PROJECTS,...PROJECTS.map(p=>p.id)];
   return [...new Set(ids)].map(id=>({kind:'project',project:PROJECTS.find(p=>p.id===id)!}));
 }
 const lessons=lessonFeed(followed,completed,inventory);
 if(filter==='lessons') return lessons.filter(i=>i.kind==='lesson');
 const recommendations=recommendProjects(followed,inventory,projects).filter(p=>p.id!==resume?.id).slice(0,2);
 const feed:FeedItem[]=resume?[{kind:'project',project:resume}]:[];
 let count=0, inserted=0;
 const prompts=lessons.filter(i=>i.kind==='inventory');
 for(const item of lessons.filter(i=>i.kind==='lesson')) {
  feed.push(item);count++;
  if(count%4===0 && recommendations[inserted]) feed.push({kind:'project',project:recommendations[inserted++]});
  // Two lessons separate gear prompts from project introductions.
  if(count%4===2 && count>2 && prompts.length) feed.push(prompts.shift()!);
 }
 return feed;
}

"use client";
import { useState, useRef } from 'react';
import Link from 'next/link';
import { topicById } from '@/lib/content';
import { displayStreak, levelForXp, useApp } from '@/lib/store';
import { buildFeed, type FeedFilter } from '@/lib/feed';
import { recommendProjects } from '@/lib/projects';
import { playSwipe } from '@/lib/sounds';
import { LessonView } from './LessonView';
import { InventoryCard } from './InventoryCard';
import { ProjectView } from './ProjectView';
export { buildFeed } from '@/lib/feed';

export function Feed() {
 const topics=useApp(s=>s.followedTopics).slice().sort().join('|');
 return <FeedSession key={topics} />;
}
function FeedSession() {
 const xp=useApp(s=>s.xp), streak=useApp(s=>s.streak), lastDay=useApp(s=>s.lastActiveDay);
 const [filter,setFilter]=useState<FeedFilter>('all');
 const construct=(f:FeedFilter)=>{const s=useApp.getState();return buildFeed(s.followedTopics,s.completedLessons,s.inventory,s.projects,f);};
 const [feed,setFeed]=useState(()=>construct('all'));
 const [active,setActive]=useState(0);
 const scroll=useRef<HTMLDivElement>(null);
 const change=(f:FeedFilter)=>{setFilter(f);setFeed(construct(f));setActive(0);scroll.current?.scrollTo({top:0});};
 const nextProject=()=>{
  const s=useApp.getState();
  const next=recommendProjects(s.followedTopics,s.inventory,s.projects)[0];
  const rebuilt=construct(filter);
  if(next) { const selected={kind:'project' as const,project:next}; setFeed([selected,...rebuilt.filter(i=>i.kind!=='project'||i.project.id!==next.id)]); }
  else setFeed(rebuilt);
  setActive(0);scroll.current?.scrollTo({top:0});
 };
 const nextItem=()=>scroll.current?.scrollBy({top:scroll.current.clientHeight,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 return <div className="relative flex h-full flex-col">
  <header className="z-30 shrink-0 border-b border-white/10 bg-background px-4 pt-3 pb-2">
   <div className="flex items-center justify-between text-sm font-bold"><span>⚡ ByteRush</span><span>🔥 {displayStreak(streak,lastDay)} · Lv {levelForXp(xp)} · {xp} XP</span></div>
   <div className="mt-3 flex gap-2" role="group" aria-label="Feed filter">
    {(['all','lessons','projects'] as const).map(f=><button key={f} onClick={()=>change(f)} aria-pressed={filter===f} className={`min-h-10 flex-1 rounded-full text-sm font-semibold focus-visible:outline-2 ${filter===f?'bg-primary text-primary-foreground':'bg-white/5'}`}>{f[0].toUpperCase()+f.slice(1)}</button>)}
   </div>
  </header>
  <div ref={scroll} onScroll={()=>{const el=scroll.current;if(el){const i=Math.round(el.scrollTop/el.clientHeight);if(i!==active){setActive(i);playSwipe();}}}} className="no-scrollbar min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto">
   {feed.map((item,i)=>item.kind==='project'?<ProjectView key={item.project.id} project={item.project} active={active===i} onSkip={nextItem} onNext={nextProject} />:item.kind==='inventory'?<InventoryCard key={item.item.id} item={item.item}/>:<LessonView key={item.lesson.id} lesson={item.lesson} topic={topicById(item.lesson.topicId)!}/>)}
   <section className="flex h-full snap-start flex-col items-center justify-center gap-4 px-8 text-center">
    <h2 className="text-2xl font-bold">That’s this visit’s feed</h2>
    <p className="text-sm text-muted-foreground">Resume a project, explore all 17, or follow another topic.</p>
    <button onClick={()=>change('projects')} className="min-h-11 rounded-full bg-primary px-5 text-primary-foreground">Explore projects</button>
    <Link href="/topics" className="underline">Follow topics</Link>
   </section>
  </div>
 </div>;
}

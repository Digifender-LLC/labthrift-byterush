"use client";
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/store';
import { initialProjectProgress, type Project } from '@/lib/projects';
import type { ProjectAction } from '@/lib/projectProgress';
import { playTap, playComplete } from '@/lib/sounds';
import { GlossaryText } from './GlossaryText';
import { CodeBlock } from './CodeBlock';
const button='min-h-11 rounded-xl border border-white/20 px-4 py-3 text-left text-sm font-semibold focus-visible:outline-2 focus-visible:outline-sky-300 disabled:opacity-40';
export function ProjectView({project,active,onSkip,onNext}:{project:Project;active:boolean;onSkip:()=>void;onNext:()=>void}) {
 const saved=useApp(s=>s.projects[project.id]);
 const state=saved??initialProjectProgress(project);
 const action=useApp(s=>s.projectAction);
 const [reward,setReward]=useState('');
 const body=useRef<HTMLDivElement>(null);
 const heading=useRef<HTMLHeadingElement>(null);
 const step=project.beats[state.stepId];
 useEffect(()=>{
  if(!active && useApp.getState().projects[project.id]?.phase==='active') action(project.id,{type:'pause'});
 },[active,action,project.id]);
 const act=(a:ProjectAction)=>{
  const before=useApp.getState().xp;
  action(project.id,a);
  const delta=useApp.getState().xp-before;
  setReward(delta?`+${delta} XP · progress saved`:'Progress saved');
  if(a.type==='finish') playComplete();else playTap();
  body.current?.scrollTo({top:0});
  heading.current?.focus({preventScroll:true});
 };
 const running=state.phase==='active';
 const sourceUnavailable=['https://labthrift.com/guides/immich','https://labthrift.com/guides/prism'].includes(project.sourceGuide);
 return <section aria-label={`Project: ${project.title}`} className="relative flex h-full snap-start flex-col bg-gradient-to-br from-indigo-950 via-slate-950 to-black p-5">
  <div className="flex items-center justify-between text-xs text-sky-300"><span>GUIDED PROJECT</span><span>{state.completed?'Walkthrough finished':state.skipped?'Skipped':`${state.completedSteps.length} steps completed`}</span></div>
  <h2 ref={heading} tabIndex={-1} className="mt-3 shrink-0 text-xl font-extrabold outline-none">{project.title}</h2>
  <div ref={body} className="relative mt-4 min-h-0 flex-1 overflow-y-auto pr-1 pb-4">
   {!running ? <>
    <p className="text-base leading-relaxed text-white/85">{project.summary}</p>
    <p className="mt-4 text-sm text-white/55">Read at your pace. Your place is saved on this device, with optional account sync. Completing a walkthrough records learning, not an installation.</p>
    {project.id==='lab-plan-passkeys'&&<p className="mt-3 rounded-lg bg-white/10 p-3 text-sm">These instructions are for the separate Labthrift Plan app and its account.</p>}
    <div className="mt-6 flex flex-col gap-3">
     <button className={`${button} bg-sky-400 text-slate-950`} onClick={()=>act({type:state.phase==='finished'?'replay':'resume'})}>{state.phase==='finished'?'Replay':saved?'Resume':'Start project'}</button>
     <button className={button} onClick={()=>{act({type:'skip'});onSkip();}}>Skip for now</button>
     {state.phase==='finished'&&<button className={button} onClick={onNext}>Next project</button>}
    </div>
   </>:<>
    <p className="mb-3 text-xs text-white/45">Step {state.path.length} · {state.stepId.replaceAll('-',' ')}</p>
    {step.body.split('\n\n').map((text,i)=>text.startsWith('```')?<CodeBlock key={i} code={text.replace(/^```[^\n]*\n|```$/g,'').trim()}/>:<GlossaryText key={i} text={text} className="mb-4 whitespace-pre-line text-base leading-relaxed text-white/90"/>)}
    <div className="mt-4 flex flex-col gap-3">
     {step.choices?.map(choice=><button key={choice.next} className={`${button} bg-white/5`} onClick={()=>act({type:'advance',next:choice.next})}>{choice.label}</button>)}
     {step.continue&&<button className={`${button} bg-sky-400 text-slate-950`} onClick={()=>act({type:'advance',next:step.continue!})}>Continue</button>}
     {step.end&&<><p className="text-sm text-white/60">Finishing records this walkthrough as read. Your gear only changes when you explicitly choose a gear status.</p><button className={`${button} bg-sky-400 text-slate-950`} onClick={()=>act({type:'finish'})}>Finish walkthrough</button></>}
    </div>
   </>}
   <a className="mt-6 block text-xs text-sky-300 underline" href={project.sourceGuide} target="_blank" rel="noreferrer">{sourceUnavailable ? "Source guide · currently unavailable" : "Source guide · Labthrift"}</a>
  </div>
  <div className="shrink-0 border-t border-white/10 pt-3">
   <p role="status" aria-live="polite" className="min-h-5 text-xs text-emerald-300">{reward}</p>
   {running&&<div className="mt-1 flex gap-3"><button className={`${button} flex-1 text-center`} disabled={state.path.length<2} onClick={()=>act({type:'back'})}>Back</button><button className={`${button} flex-1 text-center`} onClick={()=>act({type:'pause'})}>Pause</button></div>}
  </div>
 </section>;
}

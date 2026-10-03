import { PROJECT_BY_ID, initialProjectProgress, stackId } from './projects';
import { markActivity, normalizeProgress, localDay, type ProgressPayload, type InventoryStatus } from './syncTypes';
import type { ProjectStatusEffect } from './projectTypes';
export type ProjectAction = {type:'resume'|'pause'|'skip'|'replay'|'back'|'finish'} | {type:'advance';next:string};
export function actOnProject(raw:ProgressPayload,id:string,action:ProjectAction,day=localDay(),now=Date.now()) {
 let p=normalizeProgress(raw);
 const project=PROJECT_BY_ID[id];
 if(!project) return p;
 const old=p.projects[id] ?? initialProjectProgress(project);
 let s={...old,path:[...old.path],completedSteps:[...old.completedSteps],updatedAt:Math.max(now,old.updatedAt+1)};
 const step=project.beats[s.stepId];
 let effects:ProjectStatusEffect[]=[];
 const completeStep=()=>{
  if(!s.completedSteps.includes(s.stepId)) { s.completedSteps.push(s.stepId); p=markActivity(p,day); }
 };
 switch(action.type) {
  case 'resume': s.phase='active';s.skipped=false;break;
  case 'pause': if(s.phase==='active') s.phase='paused';break;
  case 'skip': s.skipped=true;s.phase='paused';break;
  case 'replay': s={...s,stepId:project.startBeat,path:[project.startBeat],phase:'active',skipped:false};break;
  case 'back': if(s.path.length<2) return p;s.path.pop();s.stepId=s.path.at(-1)!;s.phase='active';break;
  case 'advance': {
   if(s.phase!=='active') return p;
   const choice=step.choices?.find(c=>c.next===action.next);
   if(!action.next||(step.continue!==action.next&&!choice)) return p;
   completeStep();effects=[...(step.setsStatus??[]),...(choice?.setsStatus??[])];
   s.path.push(action.next);s.stepId=action.next;break;
  }
  case 'finish': if(!step.end||s.phase!=='active') return p;completeStep();effects=step.setsStatus??[];s.completed=true;s.phase='finished';break;
 }
 const inventory={...p.inventory}, inventoryUpdatedAt={...p.inventoryUpdatedAt};
 const statuses:Record<ProjectStatusEffect['status'],InventoryStatus>={interested:'planned',installed:'have',skipped:'pass'};
 for(const e of effects){const key=stackId(e.itemId);inventory[key]=statuses[e.status];inventoryUpdatedAt[key]=s.updatedAt;}
 return normalizeProgress({...p,projects:{...p.projects,[id]:s},inventory,inventoryUpdatedAt});
}

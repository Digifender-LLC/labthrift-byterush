// Shared browser/Worker contract. v1 snapshots remain readable during upgrades.
import { PROJECT_BY_ID, validProjectPath } from "./projects";
import type { ProjectProgress } from "./projectTypes";
export type InventoryStatus = "have" | "planned" | "pass";
export interface QuizAnswerRecord { choice: number; correct: boolean; lessonId: string }
export interface PublicUser { id: string; username: string }
export interface ProgressPayload {
 xp: number; cardsRead: number; completedLessons: string[]; streak: number; bestStreak: number;
 lastActiveDay: string | null; unlockedAchievements: string[]; followedTopics: string[];
 quizAnswers: Record<string, QuizAnswerRecord>; inventory: Record<string, InventoryStatus>;
 schemaVersion?: number; generation?: number; resetId?: string;
 learningXp?: number; activityDays?: string[]; dailyBonusDays?: string[];
 projects?: Record<string, ProjectProgress>; rewardIds?: string[];
 inventoryUpdatedAt?: Record<string, number>;
}
export interface NormalizedProgress extends ProgressPayload {
 schemaVersion: 2; generation: number; resetId: string; learningXp: number;
 activityDays: string[]; dailyBonusDays: string[]; projects: Record<string,ProjectProgress>;
 rewardIds: string[]; inventoryUpdatedAt: Record<string,number>;
}
export const EMPTY_PROGRESS: NormalizedProgress = {
 schemaVersion: 2, generation: 0, resetId: "", learningXp: 0, activityDays: [], dailyBonusDays: [],
 projects: {}, rewardIds: [], inventoryUpdatedAt: {}, xp: 0, cardsRead: 0, completedLessons: [], streak: 0, bestStreak: 0,
 lastActiveDay: null, unlockedAchievements: [], followedTopics: [], quizAnswers: {}, inventory: {},
};
const union = (a: string[] = [], b: string[] = []) => [...new Set([...a,...b])].sort();
export function offsetDay(day: string, offset: number) {
 return new Date(Date.parse(day+"T12:00:00Z") + offset*86400000).toISOString().slice(0,10);
}
export function localDay(d = new Date()) {
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function streakStats(days: string[]) {
 let streak = 0, best = 0, prior = "";
 for (const day of days) { streak = prior && offsetDay(prior,1) === day ? streak+1 : 1; best=Math.max(best,streak); prior=day; }
 return { streak, bestStreak: best, lastActiveDay: days.at(-1) ?? null };
}
export function projectRewardIds(projects: Record<string,ProjectProgress>) {
 return [...new Set(Object.entries(projects).flatMap(([id,p])=>[
  ...p.completedSteps.map(step=>`step:${id}:${step}`), ...(p.completed ? [`project:${id}`] : [])
 ]))].sort();
}
export function earnedXp(p: Pick<NormalizedProgress,"projects"|"dailyBonusDays">) {
 return projectRewardIds(p.projects).reduce((n,k)=>n+(k.startsWith("step:")?10:25),0)+50*p.dailyBonusDays.length;
}
export function normalizeProgress(raw: ProgressPayload): NormalizedProgress {
 const legacyDays = raw.lastActiveDay ? Array.from({length:Math.max(1,Math.min(3650,raw.streak))},(_,i)=>offsetDay(raw.lastActiveDay!, -i)) : [];
 const activityDays=union(raw.activityDays ?? legacyDays);
 const projects=raw.projects ?? {};
 const dailyBonusDays=union(raw.dailyBonusDays ?? []).filter(day=>activityDays.includes(day));
 const learningXp=raw.learningXp ?? raw.xp;
 const stats=streakStats(activityDays);
 return {...raw, schemaVersion:2, generation:raw.generation ?? 0, resetId:raw.resetId ?? "", learningXp,
  activityDays,dailyBonusDays,projects,rewardIds:projectRewardIds(projects),inventoryUpdatedAt:raw.inventoryUpdatedAt ?? {},
  xp:learningXp+earnedXp({projects,dailyBonusDays}),...stats,bestStreak:Math.max(raw.bestStreak,stats.bestStreak)};
}
export function markActivity(raw: ProgressPayload, day = localDay()): NormalizedProgress {
 const p=normalizeProgress(raw);
 if(p.activityDays.includes(day)) return p;
 return normalizeProgress({...p,activityDays:union(p.activityDays,[day]),dailyBonusDays:union(p.dailyBonusDays,[day])});
}
export function mergeProgress(rawA: ProgressPayload, rawB: ProgressPayload): NormalizedProgress {
 const a=normalizeProgress(rawA), b=normalizeProgress(rawB);
 // A newer reset generation replaces the older snapshot; stale devices cannot resurrect work.
 if(a.generation !== b.generation) return a.generation > b.generation ? a : b;
 const projects: Record<string,ProjectProgress>={...b.projects};
 for(const [id,p] of Object.entries(a.projects)) {
  const q=projects[id];
  if(!q) { projects[id]=p; continue; }
  const latest=p.updatedAt>q.updatedAt || (p.updatedAt===q.updatedAt && JSON.stringify(p)>JSON.stringify(q)) ? p:q;
  projects[id]={...latest,completedSteps:union(p.completedSteps,q.completedSteps),completed:p.completed||q.completed};
 }
 const inventory={...b.inventory}, inventoryUpdatedAt={...b.inventoryUpdatedAt};
 for(const [id,status] of Object.entries(a.inventory)) {
  const at=a.inventoryUpdatedAt[id]??0, bt=b.inventoryUpdatedAt[id]??0;
  if(!(id in inventory) || at>bt || (at===bt && status>=inventory[id])) { inventory[id]=status; inventoryUpdatedAt[id]=at; }
 }
 // Old clients may echo the total XP they received but omit the new breakdown.
 // Preserve project contributions instead of counting them again as lesson XP.
 const ax=rawA.schemaVersion===2 ? a.learningXp : Math.max(0,a.xp-earnedXp(b));
 const bx=rawB.schemaVersion===2 ? b.learningXp : Math.max(0,b.xp-earnedXp(a));
 return normalizeProgress({...a,
  learningXp:Math.max(ax,bx), projects,inventory,inventoryUpdatedAt,
  activityDays:union(a.activityDays,b.activityDays),dailyBonusDays:union(a.dailyBonusDays,b.dailyBonusDays),
  cardsRead:Math.max(a.cardsRead,b.cardsRead),completedLessons:union(a.completedLessons,b.completedLessons),
  bestStreak:Math.max(a.bestStreak,b.bestStreak),unlockedAchievements:union(a.unlockedAchievements,b.unlockedAchievements),
  followedTopics:union(a.followedTopics,b.followedTopics),quizAnswers:{...b.quizAnswers,...a.quizAnswers},
 });
}
export function resetSnapshot(p: ProgressPayload, resetId: string): NormalizedProgress {
 return {...EMPTY_PROGRESS,generation:(p.generation??0)+1,resetId,
  inventory:{...p.inventory},inventoryUpdatedAt:{...p.inventoryUpdatedAt},followedTopics:[...p.followedTopics]};
}
const record=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const strings=(v:unknown):v is string[]=>Array.isArray(v)&&v.length<=20000&&v.every(x=>typeof x==='string'&&x.length<=200);
const number=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=Number.MAX_SAFE_INTEGER;
const day=(v:unknown)=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v));
export function isProgressPayload(v: unknown): v is ProgressPayload {
 if(!record(v)) return false;
 if(!number(v.xp)||!number(v.cardsRead)||!number(v.streak)||!number(v.bestStreak)||!(v.lastActiveDay===null||day(v.lastActiveDay))) return false;
 if(!['completedLessons','unlockedAchievements','followedTopics'].every(k=>strings(v[k]))) return false;
 if(!record(v.quizAnswers)||!Object.values(v.quizAnswers).every(r=>record(r)&&number(r.choice)&&typeof r.correct==='boolean'&&typeof r.lessonId==='string')) return false;
 if(!record(v.inventory)||!Object.values(v.inventory).every(x=>['have','planned','pass'].includes(String(x)))) return false;
 if(v.schemaVersion!==undefined && v.schemaVersion!==2) return false;
 if(['generation','learningXp'].some(k=>v[k]!==undefined&&!number(v[k]))) return false;
 if(v.resetId!==undefined&&(typeof v.resetId!=='string'||v.resetId.length>100)) return false;
 if(['activityDays','dailyBonusDays'].some(k=>v[k]!==undefined&&(!strings(v[k])||!(v[k] as string[]).every(day)))) return false;
 if(v.inventoryUpdatedAt!==undefined&&(!record(v.inventoryUpdatedAt)||!Object.values(v.inventoryUpdatedAt).every(number))) return false;
 if(v.projects!==undefined) {
  if(!record(v.projects)||Object.keys(v.projects).length>Object.keys(PROJECT_BY_ID).length) return false;
  for(const [id,p] of Object.entries(v.projects)) {
   const project=PROJECT_BY_ID[id];
   if(!project||!record(p)||!strings(p.path)||!validProjectPath(project,p.path)||p.path.at(-1)!==p.stepId) return false;
   if(!['active','paused','finished'].includes(String(p.phase))||typeof p.skipped!=='boolean'||typeof p.completed!=='boolean'||!number(p.updatedAt)) return false;
   if(!strings(p.completedSteps)||!p.completedSteps.every(id=>!!project.beats[id])) return false;
  }
 }
 return true;
}

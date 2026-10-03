import p0 from "../content/projects/12u-vs-10-inch-closet-rack.json";
import p1 from "../content/projects/2-5g-switch.json";
import p2 from "../content/projects/add-local-dns-name.json";
import p3 from "../content/projects/cheap-poe.json";
import p4 from "../content/projects/first-backup.json";
import p5 from "../content/projects/first-file-share.json";
import p6 from "../content/projects/first-ssh.json";
import p7 from "../content/projects/first-weekend.json";
import p8 from "../content/projects/immich-first-weekend.json";
import p9 from "../content/projects/immich-make-it-better.json";
import p10 from "../content/projects/lab-plan-passkeys.json";
import p11 from "../content/projects/local-chat-on-the-pc.json";
import p12 from "../content/projects/photos-backup-pick.json";
import p13 from "../content/projects/prism-intro.json";
import p14 from "../content/projects/start-with-what-you-have.json";
import p15 from "../content/projects/what-os-to-pick.json";
import p16 from "../content/projects/when-house-disk-full.json";
import stackItems from "../content/projects/stack-items.json";
import type { Project, ProjectProgress } from "./projectTypes";
export type { Project, ProjectProgress } from "./projectTypes";
export const PROJECTS: Project[] = [p0,p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16] as Project[];
export const PROJECT_BY_ID = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
export const BEGINNER_PROJECTS = ["start-with-what-you-have", "what-os-to-pick", "first-weekend", "first-ssh", "first-file-share", "first-backup"];
export const PROJECT_TOPICS: Record<string, string[]> = {
 "start-with-what-you-have": ["homelab", "basics"],
 "what-os-to-pick": ["homelab", "linux"],
 "first-weekend": ["homelab", "linux"],
 "first-ssh": ["homelab", "linux", "networking"],
 "first-file-share": ["homelab", "linux"],
 "first-backup": ["homelab", "security"],
 "photos-backup-pick": ["homelab"],
 "immich-first-weekend": ["homelab", "docker"],
 "immich-make-it-better": ["homelab", "docker"],
 "prism-intro": ["homelab"],
 "add-local-dns-name": ["homelab", "networking"],
 "when-house-disk-full": ["homelab", "linux"],
 "12u-vs-10-inch-closet-rack": ["homelab"],
 "cheap-poe": ["homelab", "networking"],
 "2-5g-switch": ["homelab", "networking"],
 "lab-plan-passkeys": ["homelab", "security"],
 "local-chat-on-the-pc": ["homelab", "basics"]
};
export const stackId = (id: string) => id === "pihole" ? "pi-hole" : id;
export function initialProjectProgress(project: Project): ProjectProgress {
 return { stepId: project.startBeat, path: [project.startBeat], phase: "paused", skipped: false, updatedAt: 0, completedSteps: [], completed: false };
}
export function validProjectPath(project: Project, path: string[]): boolean {
 return path.length > 0 && path.length <= 256 && path[0] === project.startBeat && path.every((id,i) => {
  if (!project.beats[id]) return false;
  if (!i) return true;
  const prev = project.beats[path[i-1]];
  return prev.continue === id || !!prev.choices?.some(c => c.next === id);
 });
}
export function resumableProject(progress: Record<string, ProjectProgress>): Project | undefined {
 const id = Object.keys(progress).filter(id => PROJECT_BY_ID[id] && !progress[id].skipped && progress[id].phase !== "finished")
  .sort((a,b) => progress[b].updatedAt-progress[a].updatedAt || a.localeCompare(b))[0];
 return PROJECT_BY_ID[id];
}
export function recommendProjects(followed: string[], inventory: Record<string,string>, progress: Record<string,ProjectProgress>): Project[] {
 return PROJECTS.filter(p => !progress[p.id]?.completed && !progress[p.id]?.skipped)
  .map((p,i) => {
   let score = PROJECT_TOPICS[p.id].some(t => followed.includes(t)) ? 1 : 0;
   const beginnerIndex=BEGINNER_PROJECTS.indexOf(p.id);
   if (beginnerIndex>=0 && score>0) score += 100-beginnerIndex;
   for (const id of p.recommendsIfInterested || []) {
    if (inventory[stackId(id)] === "planned") score += 10;
    if (inventory[stackId(id)] === "have") score += 4;
   }
   for (const id of p.recommendsIfInstalled || []) {
    if (inventory[stackId(id)] === "have") score += 12;
    if (inventory[stackId(id)] === "planned") score += 3;
   }
   for (const item of stackItems) {
    const status=inventory[stackId(item.id)];
    if(status==='planned'||status==='have') for(const topic of item.topics) if(p.topics?.includes(topic)) score+=1;
   }
   // Follow-up walkthroughs only enter the automatic queue when their trigger matches.
   if ((p.recommendsIfInstalled?.length || p.recommendsIfInterested?.length) && score < 3) score = 0;
   return {p,score,i};
  }).filter(x => x.score > 0).sort((a,b)=>b.score-a.score || a.i-b.i).map(x=>x.p);
}

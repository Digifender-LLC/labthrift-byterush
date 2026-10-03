export type ProjectStatusEffect = { itemId: string; status: 'interested' | 'installed' | 'skipped' };
export interface ProjectChoice { label: string; next: string; setsStatus?: ProjectStatusEffect[] }
export interface ProjectStep {
  id: string; body: string; continue?: string; choices?: ProjectChoice[];
  setsStatus?: ProjectStatusEffect[]; end?: boolean; milestone?: boolean;
}
export interface Project {
  id: string; title: string; summary: string; sourceGuide: string; startBeat: string;
  topics?: string[]; recommendsIfInterested?: string[]; recommendsIfInstalled?: string[];
  beats: Record<string, ProjectStep>;
}
export interface ProjectProgress {
  stepId: string;
  path: string[];
  phase: 'active' | 'paused' | 'finished';
  skipped: boolean;
  updatedAt: number;
  completedSteps: string[];
  completed: boolean;
}

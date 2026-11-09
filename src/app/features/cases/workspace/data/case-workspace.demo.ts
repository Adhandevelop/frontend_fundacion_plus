// Presentation-only types for an in-memory demonstration. Not REST DTOs.
export type DemoAudience = 'admin' | 'citizen';
export type DemoManagement = 'Recibido' | 'Asignado' | 'En gestión' | 'Resuelto' | 'Cerrado';
export type DemoModeration = 'Pendiente' | 'Aprobado' | 'Rechazado';
export type DemoVisibility = 'public' | 'citizen' | 'internal';
export interface DemoHistory {
  id: number; title: string; description: string; date: string; visibility: DemoVisibility;
}
export interface DemoEvidence {
  id: number; name: string; size: number; visibility: 'public' | 'private'; origin: 'example' | 'local';
}
export interface DemoMessage {id: number; sender: DemoAudience; text: string; date: string;}
export interface DemoWorkflow {
  management: DemoManagement; moderation: DemoModeration; assignee: string;
  correction: string; result: string; history: DemoHistory[]; evidence: DemoEvidence[]; messages: DemoMessage[];
}
export interface DemoIdentity {code: string; title: string; territory: string; category: string; originalStatus: string;}

export const DEMO_ASSIGNEES = ['Dr. Carlos Mario R.', 'Dra. Liliana Mosquera', 'Ing. Andrés Perea'];
export const DEMO_VISIBILITY: Record<DemoVisibility, string> = {
  public: 'Avance público de ejemplo', citizen: 'Visible para el ciudadano', internal: 'Nota interna del equipo',
};

export function historyForAudience(items: readonly DemoHistory[], audience: DemoAudience): readonly DemoHistory[] {
  return items.filter(item => audience === 'admin' || item.visibility !== 'internal');
}

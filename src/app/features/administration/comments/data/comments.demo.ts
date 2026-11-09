// Presentation-only comments and decisions. No real authors, API DTOs or audit records.
export const COMMENT_STATES = ['pendiente', 'aprobado', 'rechazado', 'oculto'] as const;
export type CommentState = typeof COMMENT_STATES[number];
export const COMMENT_LABELS: Record<CommentState, string> = {pendiente: 'Pendiente', aprobado: 'Aprobado en el ejemplo', rechazado: 'Rechazado en el ejemplo', oculto: 'Oculto en el ejemplo'};
export interface CommentDecisionDemo {id: string; before: CommentState; after: CommentState; reason: string; reviewerLabel: string; date: string;}
export interface CommentDemo {id: string; caseCode: string; authorAlias: string; body: string; date: string; state: CommentState; revision: number; modified: boolean; decisions: readonly CommentDecisionDemo[];}
export interface PublicCommentPreview {id: string; caseCode: string; authorAlias: string; body: string; date: string;}
export const COMMENTS_DEMO: readonly CommentDemo[] = [
  {id: 'comment-demo-1', caseCode: 'PLUS-2025-084', authorAlias: 'Autor ficticio A', body: 'Comentario de ejemplo: solicitamos acompañamiento para documentar el estado de la vía. No corresponde a un testimonio real.', date: '2026-11-01T14:00:00Z', state: 'pendiente', revision: 1, modified: false, decisions: []},
  {id: 'comment-demo-2', caseCode: 'PLUS-2025-084', authorAlias: 'Autor ficticio B', body: 'Comentario aprobado de ejemplo para explorar la representación pública. No acredita visitas, resultados ni hechos institucionales.', date: '2026-11-02T14:00:00Z', state: 'aprobado', revision: 1, modified: false, decisions: []},
  {id: 'comment-demo-3', caseCode: 'PLUS-2025-0719', authorAlias: 'Autor ficticio C', body: 'Comentario de ejemplo sobre una solicitud de salud. Se conserva pendiente para probar filtros y revisión, sin información personal.', date: '2026-11-03T14:00:00Z', state: 'pendiente', revision: 1, modified: false, decisions: []},
  {id: 'comment-demo-4', caseCode: 'PLUS-2025-0601', authorAlias: 'Autor ficticio D', body: 'Este contenido neutro representa un ejemplo oculto. El estado es ficticio y no implica una infracción cometida por alguien real.', date: '2026-11-04T14:00:00Z', state: 'oculto', revision: 1, modified: false, decisions: []},
  {id: 'comment-demo-5', caseCode: 'PLUS-2025-0488', authorAlias: 'Autor ficticio E', body: 'Este contenido neutro representa un ejemplo rechazado para explorar la interfaz. No hay una decisión institucional asociada.', date: '2026-11-05T14:00:00Z', state: 'rechazado', revision: 1, modified: false, decisions: []},
  {id: 'comment-demo-6', caseCode: 'PLUS-2025-084', authorAlias: 'Autor ficticio F', body: 'Segundo comentario pendiente de ejemplo, sin datos personales ni documentos. Permite comprobar la paginación y las decisiones independientes.', date: '2026-11-06T14:00:00Z', state: 'pendiente', revision: 1, modified: false, decisions: []},
];
export interface CommentFilters {query: string; caseCode: string; state: string;}
export function filterComments(rows: readonly CommentDemo[], filters: CommentFilters): readonly CommentDemo[] {
  const normalize = (value: string) => value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return rows.filter(row => normalize(`${row.body} ${row.caseCode} ${row.authorAlias}`).includes(normalize(filters.query)) && (!filters.caseCode || row.caseCode === filters.caseCode) && (!filters.state || row.state === filters.state))
    .sort((a,b) => b.date.localeCompare(a.date));
}
export function commentActions(state: CommentState): readonly CommentState[] {
  if (state === 'pendiente') return ['aprobado','rechazado'];
  if (state === 'aprobado') return ['oculto'];
  return ['pendiente'];
}

// Local presentation state only. Not an audit API contract.
export const AUDIT_ACTION_LABELS = {
  sample: 'Ejemplo inicial', moderation: 'Revisión de publicación', correction: 'Solicitud de corrección',
  assignment: 'Asignación de responsable', progress: 'Avance de seguimiento', result: 'Resolución o cierre',
  contribution: 'Aporte ciudadano', message: 'Mensaje de ejemplo', evidence: 'Visibilidad de evidencia', reset: 'Restablecimiento del ejemplo',
} as const;
export type AuditDemoAction = keyof typeof AUDIT_ACTION_LABELS;
export type AuditDemoActor = 'admin' | 'citizen' | 'system';
export const AUDIT_ACTOR_LABELS: Record<AuditDemoActor, string> = {
  admin: 'Perfil administrativo de ejemplo', citizen: 'Perfil ciudadano de ejemplo', system: 'Muestra del sistema',
};
export interface AuditDemoChange {field: string; before: string; after: string;}
export interface AuditDemoEvent {
  id: string; code: string; action: AuditDemoAction; actor: AuditDemoActor; date: string;
  origin: 'fixture' | 'local'; changes: readonly AuditDemoChange[];
}
export interface AuditDemoFilters {query: string; action: string; actor: string; origin: string; from: string; to: string;}
export const EMPTY_AUDIT_FILTERS: AuditDemoFilters = {query: '', action: '', actor: '', origin: '', from: '', to: ''};

export function filterAuditEvents(events: readonly AuditDemoEvent[], filters: AuditDemoFilters): readonly AuditDemoEvent[] {
  if (filters.from && filters.to && filters.from > filters.to) return [];
  const normalize = (value: string) => value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return events.filter(event => {
    const day = event.date.slice(0, 10);
    return normalize(`${event.code} ${AUDIT_ACTION_LABELS[event.action]} ${AUDIT_ACTOR_LABELS[event.actor]}`).includes(normalize(filters.query)) &&
      (!filters.action || event.action === filters.action) && (!filters.actor || event.actor === filters.actor) &&
      (!filters.origin || event.origin === filters.origin) && (!filters.from || day >= filters.from) && (!filters.to || day <= filters.to);
  });
}

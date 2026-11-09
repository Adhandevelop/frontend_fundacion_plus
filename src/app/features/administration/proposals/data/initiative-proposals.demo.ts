// Presentation fixtures only. No real applicants, consent records or API DTOs.
export const PROPOSAL_STATES = ['pendiente', 'en_revision', 'aprobada', 'rechazada'] as const;
export type ProposalState = typeof PROPOSAL_STATES[number];
export const PROPOSAL_LABELS: Record<ProposalState, string> = {pendiente: 'Pendiente', en_revision: 'En revisión', aprobada: 'Aprobada en el ejemplo', rechazada: 'Rechazada en el ejemplo'};
export interface InitiativeProposalDemo {
  id: string; title: string; description: string; contactName: string; phone: string; territory: string;
  requestedProgramId: string | null; activityType: string; suggestedDate: string; consentExample: boolean;
  createdAt: string; state: ProposalState; response: string; resultProgramId: string | null;
  reviewerLabel: string | null; reviewedAt: string | null; revision: number; modified: boolean;
}
export const PROPOSALS_DEMO: readonly InitiativeProposalDemo[] = [
  {id: 'proposal-demo-1', title: 'Jornada infantil de ejemplo', description: 'Solicitud ficticia para explorar la revisión de actividades comunitarias. No corresponde a una comunidad solicitante real.', contactName: 'Contacto ficticio A', phone: '0000000000', territory: 'Territorio declarado de ejemplo A', requestedProgramId: 'program-dulcemania', activityType: 'Encuentro de ejemplo', suggestedDate: '', consentExample: true, createdAt: '2026-11-01T14:00:00Z', state: 'pendiente', response: '', resultProgramId: null, reviewerLabel: null, reviewedAt: null, revision: 1, modified: false},
  {id: 'proposal-demo-2', title: 'Encuentro de cierre de año de ejemplo', description: 'Ejemplo de solicitud en revisión, pendiente de respuesta. Los datos de contacto no son canales válidos.', contactName: 'Contacto ficticio B', phone: '0000000000', territory: 'Territorio declarado de ejemplo B', requestedProgramId: 'program-navidad', activityType: 'Actividad comunitaria de ejemplo', suggestedDate: '', consentExample: true, createdAt: '2026-11-02T15:00:00Z', state: 'en_revision', response: '', resultProgramId: null, reviewerLabel: 'Perfil de revisión · Demostración', reviewedAt: '2026-11-03T14:00:00Z', revision: 1, modified: false},
  {id: 'proposal-demo-3', title: 'Apoyo escolar de ejemplo', description: 'Solicitud aprobada únicamente para demostrar el estado final y un vínculo de resultado independiente de la iniciativa solicitada.', contactName: 'Contacto ficticio C', phone: '0000000000', territory: 'Territorio declarado de ejemplo C', requestedProgramId: 'program-educacion', activityType: 'Encuentro de ejemplo', suggestedDate: '', consentExample: true, createdAt: '2026-11-03T14:00:00Z', state: 'aprobada', response: 'Respuesta ficticia: ejemplo aprobado para explorar la ficha. No hay ejecución ni comunicación real.', resultProgramId: 'program-educacion', reviewerLabel: 'Perfil de revisión · Demostración', reviewedAt: '2026-11-04T14:00:00Z', revision: 1, modified: false},
  {id: 'proposal-demo-4', title: 'Actividad sin programa específico de ejemplo', description: 'Ejemplo de solicitud rechazada sin vincularla a un programa resultante. No representa una decisión institucional.', contactName: 'Contacto ficticio D', phone: '0000000000', territory: 'Territorio declarado de ejemplo D', requestedProgramId: null, activityType: 'Otra dinámica de ejemplo', suggestedDate: '', consentExample: true, createdAt: '2026-11-04T14:00:00Z', state: 'rechazada', response: 'Respuesta ficticia: el ejemplo no continúa en esta simulación. No se ha notificado a nadie.', resultProgramId: null, reviewerLabel: 'Perfil de revisión · Demostración', reviewedAt: '2026-11-05T14:00:00Z', revision: 1, modified: false},
];
export interface ProposalFilters {query: string; state: string; requestedProgramId: string;}
export function filterProposals(rows: readonly InitiativeProposalDemo[], filters: ProposalFilters): readonly InitiativeProposalDemo[] {
  const normalize = (value: string) => value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return rows.filter(row => normalize(`${row.title} ${row.description} ${row.territory} ${row.contactName}`).includes(normalize(filters.query)) &&
    (!filters.state || row.state === filters.state) && (!filters.requestedProgramId || row.requestedProgramId === filters.requestedProgramId))
    .sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

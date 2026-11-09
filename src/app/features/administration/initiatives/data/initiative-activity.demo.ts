import { validCalendarDate } from './initiative-admin.demo';

export const ACTIVITY_STATES = ['programada', 'realizada', 'cancelada'] as const;
export type ActivityState = typeof ACTIVITY_STATES[number];
export const ACTIVITY_LABELS: Record<ActivityState, string> = {programada: 'Programada', realizada: 'Realizada en el ejemplo', cancelada: 'Cancelada en el ejemplo'};
// Input dates use Bogotá wall time; stored timestamps use UTC. Not an API contract.
export interface ActivityInput {title: string; description: string; start: string; end: string; place: string; state: ActivityState; responsibleId: string; communityId: string; latitude: number | null; longitude: number | null;}
export interface ActivityDemo extends Omit<ActivityInput, 'start' | 'end'> {id: string; programId: string; editionId: string; start: string; end: string | null; modified: boolean;}
export function activityInstant(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || !validCalendarDate(value.slice(0, 10)) || Number(value.slice(11, 13)) > 23 || Number(value.slice(14, 16)) > 59) return null;
  const date = new Date(`${value}-05:00`);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
export function activityLocal(value: string | null): string {return value ? new Date(new Date(value).getTime() - 5 * 60 * 60 * 1000).toISOString().slice(0, 16) : '';}
export function validActivity(value: ActivityInput): boolean {
  const start = activityInstant(value.start); const end = value.end ? activityInstant(value.end) : null;
  const coordinates = value.latitude === null && value.longitude === null || typeof value.latitude === 'number' && typeof value.longitude === 'number' && Number.isFinite(value.latitude) && Number.isFinite(value.longitude) && Math.abs(value.latitude) <= 90 && Math.abs(value.longitude) <= 180;
  return Boolean(value.title.trim() && value.title.length <= 200 && value.place.length <= 200 && ACTIVITY_STATES.includes(value.state) && start && (!value.end || end && end >= start) && coordinates);
}
export function filterActivities(rows: readonly ActivityDemo[], query: string, state: string): readonly ActivityDemo[] {
  const normalize = (value: string) => value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return rows.filter(row => (!state || row.state === state) && normalize(`${row.title} ${row.description} ${row.place}`).includes(normalize(query))).sort((a, b) => a.start.localeCompare(b.start));
}

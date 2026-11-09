import { INITIATIVES_DEMO } from '../../../initiatives/data/initiatives.demo';

// Frontend simulation only, not REST DTOs or validated institutional results.
export const PROGRAM_STATES = ['planificada', 'en_curso', 'finalizada', 'cancelada'] as const;
export type ProgramState = typeof PROGRAM_STATES[number];
export const PUBLICATION_STATES = ['borrador', 'pendiente', 'publicada', 'rechazada'] as const;
export type ProgramPublication = typeof PUBLICATION_STATES[number];
export const PROGRAM_LABELS: Record<ProgramState, string> = {planificada: 'Planificada', en_curso: 'En curso', finalizada: 'Finalizada', cancelada: 'Cancelada'};
export const PUBLICATION_LABELS: Record<ProgramPublication, string> = {borrador: 'Borrador', pendiente: 'En revisión', publicada: 'Publicada en el ejemplo', rechazada: 'Rechazada en el ejemplo'};
export interface ProgramInput {title: string; subtitle: string; slug: string; category: string; summary: string; description: string; state: ProgramState;}
export interface ProgramDemo extends ProgramInput {id: string; publication: ProgramPublication; featured: boolean; rejection: string; image: string; modified: boolean;}
export interface EditionInput {year: number; name: string; season: string; description: string; start: string; end: string; state: ProgramState;}
export interface EditionDemo extends EditionInput {id: string; programId: string; modified: boolean; indicators: readonly IndicatorDemo[]; communityIds: readonly string[];}
export interface IndicatorInput {name: string; value: string; unit: string; measurement: 'estimado' | 'real'; cutoff: string;}
export interface IndicatorDemo extends IndicatorInput {id: string;}
export const PROGRAMS_DEMO: readonly ProgramDemo[] = INITIATIVES_DEMO.map((row, index) => ({
  id: `program-${row.id}`, title: row.title, subtitle: '', slug: row.id, category: row.category,
  summary: row.summary, description: row.summary, state: 'planificada', publication: index === 0 ? 'publicada' : 'borrador',
  featured: index === 0, rejection: '', image: row.image, modified: false,
}));
export const EDITIONS_DEMO: readonly EditionDemo[] = INITIATIVES_DEMO.map(row => ({
  id: `edition-${row.id}-2025`, programId: `program-${row.id}`, year: 2025, name: 'Edición de ejemplo 2025', season: row.period,
  description: 'Ejecución anual de demostración. No contiene indicadores institucionales verificados.', start: '', end: '', state: 'planificada', modified: false, indicators: [], communityIds: [],
}));
export function validCalendarDate(value: string) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validProgram(value: ProgramInput) {
  return Boolean(value.title.trim() && value.title.length <= 200 && value.subtitle.length <= 250 && value.category.trim() && value.category.length <= 80 &&
    value.slug.length <= 220 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug) && PROGRAM_STATES.includes(value.state));
}
export function validEdition(value: EditionInput) {
  return Number.isInteger(value.year) && value.year >= 2000 && value.year <= 2200 && value.name.length <= 150 && value.season.length <= 100 &&
    PROGRAM_STATES.includes(value.state) && validCalendarDate(value.start) && validCalendarDate(value.end) && (!value.start || !value.end || value.end >= value.start);
}
export function validIndicator(value: IndicatorInput) {
  return Boolean(value.name.trim() && value.name.length <= 100 && /^\d{1,12}(?:\.\d{1,2})?$/.test(value.value) && value.unit.length <= 50 &&
    ['estimado', 'real'].includes(value.measurement) && validCalendarDate(value.cutoff));
}
export interface ProgramFilters {query: string; category: string; state: string; publication: string; year: string;}
export function filterPrograms(rows: readonly ProgramDemo[], editions: readonly EditionDemo[], filters: ProgramFilters) {
  const normalize = (text: string) => text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return rows.filter(row => normalize(`${row.title} ${row.slug} ${row.summary}`).includes(normalize(filters.query)) &&
    (!filters.category || row.category === filters.category) && (!filters.state || row.state === filters.state) && (!filters.publication || row.publication === filters.publication) &&
    (!filters.year || editions.some(edition => edition.programId === row.id && String(edition.year) === filters.year)));
}

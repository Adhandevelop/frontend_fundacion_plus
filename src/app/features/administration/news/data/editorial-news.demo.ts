import { NEWS_DEMO } from '../../../news/data/news.demo';

// Local editorial simulation. Not the pending news API contract (AMP-01).
export const EDITORIAL_STATES = ['borrador', 'en_revision', 'publicada', 'rechazada'] as const;
export type EditorialState = typeof EDITORIAL_STATES[number];
export const EDITORIAL_LABELS: Record<EditorialState, string> = {borrador: 'Borrador', en_revision: 'En revisión', publicada: 'Publicada en el ejemplo', rechazada: 'Rechazada en el ejemplo'};
export interface EditorialNewsInput {title: string; slug: string; category: string; summary: string; body: string; imageUrl: string; imageAlt: string;}
export interface EditorialNews extends EditorialNewsInput {id: string; state: EditorialState; featured: boolean; rejection: string; modified: boolean; updatedAt: string | null;}
export const EDITORIAL_CATEGORIES = [...new Set(NEWS_DEMO.map(row => row.category))];
export const EDITORIAL_NEWS: readonly EditorialNews[] = NEWS_DEMO.slice(0, 4).map((row, index) => ({
  id: `news-demo-${index + 1}`, title: row.title, slug: `noticia-ejemplo-${index + 1}`, category: row.category,
  summary: row.summary, body: row.summary, imageUrl: row.image, imageAlt: `Imagen de referencia del diseño: ${row.title}`,
  state: index === 0 ? 'publicada' : index === 1 ? 'en_revision' : 'borrador', featured: index === 0,
  rejection: '', modified: false, updatedAt: null,
}));
export function editorialNewsValid(input: EditorialNewsInput): boolean {
  return Boolean(input.title.trim() && input.title.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) && input.slug.length <= 220 &&
    EDITORIAL_CATEGORIES.includes(input.category) && input.summary.trim() && input.summary.length <= 1000 && input.body.trim() && input.body.length <= 30000 &&
    (!input.imageUrl || /^(https?:\/\/|blob:)/.test(input.imageUrl) && input.imageAlt.trim() && input.imageAlt.length <= 250));
}
export interface EditorialFilters {query: string; category: string; state: string;}
export function filterEditorialNews(rows: readonly EditorialNews[], filters: EditorialFilters): readonly EditorialNews[] {
  const normalize = (text: string) => text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return rows.filter(row => normalize(`${row.title} ${row.slug} ${row.summary}`).includes(normalize(filters.query)) &&
    (!filters.category || row.category === filters.category) && (!filters.state || row.state === filters.state));
}

import { Injectable, signal } from '@angular/core';
import { EDITORIAL_NEWS, EditorialNews, EditorialNewsInput, EditorialState, editorialNewsValid } from '../data/editorial-news.demo';

type SaveResult = {ok: true; id: string} | {ok: false; error: 'invalid' | 'duplicate' | 'missing'};
@Injectable({providedIn: 'root'})
export class EditorialNewsDemoService {
  private sequence = 0;
  private readonly rows = signal<readonly EditorialNews[]>(EDITORIAL_NEWS.map(row => ({...row})));
  readonly news = this.rows.asReadonly();
  find(id: string) {return this.news().find(row => row.id === id) ?? null;}
  save(input: EditorialNewsInput, id?: string): SaveResult {
    if (id !== undefined && !this.find(id)) return {ok: false, error: 'missing'};
    const value = {title: input.title.trim(), slug: input.slug.trim(), category: input.category, summary: input.summary.trim(), body: input.body.trim(), imageUrl: input.imageUrl, imageAlt: input.imageAlt.trim()};
    if (!editorialNewsValid(value)) return {ok: false, error: 'invalid'};
    if (this.news().some(row => row.id !== id && row.slug === value.slug)) return {ok: false, error: 'duplicate'};
    const previous = id ? this.find(id) : null;
    const savedId = id ?? `news-local-${++this.sequence}`;
    const saved: EditorialNews = {...value, id: savedId, state: 'borrador', featured: false, rejection: '', modified: true, updatedAt: new Date().toISOString()};
    this.rows.update(rows => previous ? rows.map(row => row.id === savedId ? saved : row) : [saved, ...rows]);
    if (previous?.imageUrl.startsWith('blob:') && previous.imageUrl !== saved.imageUrl) URL.revokeObjectURL(previous.imageUrl);
    return {ok: true, id: savedId};
  }
  transition(id: string, target: EditorialState, reason = ''): boolean {
    const row = this.find(id); if (!row) return false;
    const allowed = target === 'en_revision' ? ['borrador', 'rechazada'].includes(row.state) :
      target === 'publicada' || target === 'rechazada' ? row.state === 'en_revision' : target === 'borrador' && row.state === 'publicada';
    if (!allowed || !editorialNewsValid(row) || target === 'rechazada' && (reason.trim().length < 10 || reason.length > 2000)) return false;
    this.rows.update(rows => rows.map(item => item.id === id ? {...item, state: target, featured: target === 'publicada' ? item.featured : false, rejection: target === 'rechazada' ? reason.trim() : '', modified: true, updatedAt: new Date().toISOString()} : item));
    return true;
  }
  feature(id: string): boolean {
    const row = this.find(id); if (!row || row.state !== 'publicada') return false;
    this.rows.update(rows => rows.map(item => item.id === id ? {...item, featured: !item.featured, modified: true, updatedAt: new Date().toISOString()} : item)); return true;
  }
}

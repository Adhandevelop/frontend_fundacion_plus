import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { PROGRAMS_DEMO } from '../data/initiative-admin.demo';
import { InitiativeMediaDemo, InitiativeMediaMeta, initiativeFileKind, validMediaMeta } from '../data/initiative-media.demo';
import { InitiativeAdminDemoService } from './initiative-admin-demo.service';

@Injectable({providedIn: 'root'})
export class InitiativeMediaDemoService {
  readonly initiatives = inject(InitiativeAdminDemoService);
  private sequence = 0;
  private readonly rows = signal<readonly InitiativeMediaDemo[]>(PROGRAMS_DEMO.filter(row => row.image).map(row => ({
    id: `media-${row.id}`, programId: row.id, editionId: null, kind: 'imagen', url: row.image, name: 'Imagen de referencia del diseño',
    size: null, cover: true, alt: `Imagen de referencia de ${row.title}`, description: 'Medio de ejemplo del mockup. No acredita una actividad real.', order: 0, origin: 'fixture',
  })));
  readonly media = this.rows.asReadonly();
  constructor() {inject(DestroyRef).onDestroy(() => this.rows().filter(row => row.origin === 'local').forEach(row => URL.revokeObjectURL(row.url)));}
  validScope(programId: string, editionId: string | null) {return Boolean(this.initiatives.program(programId) && (editionId === null || this.initiatives.edition(programId,editionId)));}
  scoped(programId: string, editionId: string | null) {return this.media().filter(row => row.programId === programId && row.editionId === editionId).sort((a,b) => a.order-b.order || a.id.localeCompare(b.id));}
  cover(programId: string, editionId: string | null) {return this.scoped(programId,editionId).find(row => row.cover) ?? null;}
  add(programId: string, editionId: string | null, file: File, meta: InitiativeMediaMeta): boolean {
    const kind = initiativeFileKind(file);
    if (!this.validScope(programId,editionId) || !kind || !validMediaMeta(meta,kind)) return false;
    const row: InitiativeMediaDemo = {id: `media-local-${++this.sequence}`, programId, editionId, kind, name: file.name, size: file.size, url: URL.createObjectURL(file), cover: false, origin: 'local', alt: meta.alt.trim(), description: meta.description.trim(), order: meta.order};
    this.rows.update(rows => [...rows,row]); return true;
  }
  edit(programId: string, editionId: string | null, id: string, meta: InitiativeMediaMeta): boolean {
    const row = this.scoped(programId,editionId).find(item => item.id === id);
    if (!this.validScope(programId,editionId) || !row || !validMediaMeta(meta,row.kind)) return false;
    this.rows.update(rows => rows.map(item => item.id === id ? {...item, alt: meta.alt.trim(), description: meta.description.trim(), order: meta.order} : item)); return true;
  }
  setCover(programId: string, editionId: string | null, id: string): boolean {
    const row = this.scoped(programId,editionId).find(item => item.id === id);
    if (!this.validScope(programId,editionId) || !row || row.kind !== 'imagen') return false;
    this.rows.update(rows => rows.map(item => item.programId === programId && item.editionId === editionId ? {...item,cover: item.id === id} : item)); return true;
  }
  remove(programId: string, editionId: string | null, id: string): boolean {
    const row = this.scoped(programId,editionId).find(item => item.id === id);
    if (!this.validScope(programId,editionId) || !row) return false;
    this.rows.update(rows => rows.filter(item => item.id !== id)); if (row.origin === 'local') URL.revokeObjectURL(row.url); return true;
  }
}

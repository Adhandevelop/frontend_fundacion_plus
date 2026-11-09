import { Injectable, inject, signal } from '@angular/core';
import { TerritoriesDemoService } from '../../territories/services/territories-demo.service';
import { PROGRAMS_DEMO, EDITIONS_DEMO, ProgramDemo, ProgramInput, ProgramPublication, EditionDemo, EditionInput, IndicatorInput, validProgram, validEdition, validIndicator } from '../data/initiative-admin.demo';

type SaveResult = {ok: true; id: string} | {ok: false; error: 'missing' | 'invalid' | 'duplicate'};
@Injectable({providedIn: 'root'})
export class InitiativeAdminDemoService {
  readonly territories = inject(TerritoriesDemoService);
  private sequence = 0;
  private readonly programRows = signal<readonly ProgramDemo[]>(PROGRAMS_DEMO.map(row => ({...row})));
  private readonly editionRows = signal<readonly EditionDemo[]>(EDITIONS_DEMO.map(row => ({...row, indicators: [], communityIds: []})));
  readonly programs = this.programRows.asReadonly();
  readonly editions = this.editionRows.asReadonly();
  program(id: string) {return this.programs().find(row => row.id === id) ?? null;}
  edition(programId: string, id: string) {return this.editions().find(row => row.programId === programId && row.id === id) ?? null;}
  saveProgram(input: ProgramInput, id?: string): SaveResult {
    if (id !== undefined && !this.program(id)) return {ok: false, error: 'missing'};
    const value = {...input, title: input.title.trim(), subtitle: input.subtitle.trim(), slug: input.slug.trim(), category: input.category.trim(), summary: input.summary.trim(), description: input.description.trim()};
    if (!validProgram(value)) return {ok: false, error: 'invalid'};
    if (this.programs().some(row => row.id !== id && row.slug === value.slug)) return {ok: false, error: 'duplicate'};
    const savedId = id ?? `program-local-${++this.sequence}`;
    const row: ProgramDemo = {...value, id: savedId, publication: 'borrador', featured: false, rejection: '', image: id ? this.program(id)!.image : '', modified: true};
    this.programRows.update(rows => id !== undefined ? rows.map(item => item.id === id ? row : item) : [row, ...rows]);
    return {ok: true, id: savedId};
  }
  publish(id: string, target: ProgramPublication, reason: string): boolean {
    const row = this.program(id); if (!row) return false;
    const allowed = target === 'pendiente' ? ['borrador', 'rechazada'].includes(row.publication) :
      target === 'publicada' || target === 'rechazada' ? row.publication === 'pendiente' : target === 'borrador' && row.publication === 'publicada';
    if (!allowed || !validProgram(row) || ['pendiente', 'publicada'].includes(target) && (!row.summary || !row.description) || target === 'rechazada' && (reason.trim().length < 10 || reason.length > 2000)) return false;
    this.programRows.update(rows => rows.map(item => item.id === id ? {...item, publication: target, featured: false, rejection: target === 'rechazada' ? reason.trim() : '', modified: true} : item)); return true;
  }
  feature(id: string) {
    const row = this.program(id); if (!row || row.publication !== 'publicada') return false;
    this.programRows.update(rows => rows.map(item => item.id === id ? {...item, featured: !item.featured, modified: true} : item)); return true;
  }
  saveEdition(programId: string, input: EditionInput, id?: string): SaveResult {
    if (!this.program(programId) || id !== undefined && !this.edition(programId, id)) return {ok: false, error: 'missing'};
    const value = {...input, name: input.name.trim(), season: input.season.trim(), description: input.description.trim()};
    if (!validEdition(value)) return {ok: false, error: 'invalid'};
    if (this.editions().some(row => row.programId === programId && row.id !== id && row.year === value.year)) return {ok: false, error: 'duplicate'};
    const previous = id ? this.edition(programId, id) : null;
    const savedId = id ?? `edition-local-${++this.sequence}`;
    const row: EditionDemo = {...value, id: savedId, programId, indicators: previous?.indicators ?? [], communityIds: previous?.communityIds ?? [], modified: true};
    this.editionRows.update(rows => previous ? rows.map(item => item.id === savedId ? row : item) : [row, ...rows]); return {ok: true, id: savedId};
  }
  saveIndicator(programId: string, editionId: string, input: IndicatorInput, id?: string): boolean {
    const edition = this.edition(programId, editionId);
    const value = {...input, name: input.name.trim(), value: input.value.trim(), unit: input.unit.trim()};
    if (!edition || !validIndicator(value) || id !== undefined && !edition.indicators.some(item => item.id === id)) return false;
    const row = {...value, id: id ?? `indicator-local-${++this.sequence}`};
    this.updateEdition(editionId, current => ({...current, indicators: id ? current.indicators.map(item => item.id === id ? row : item) : [...current.indicators, row]})); return true;
  }
  removeIndicator(programId: string, editionId: string, id: string) {
    const row = this.edition(programId, editionId); if (!row?.indicators.some(item => item.id === id)) return false;
    this.updateEdition(editionId, current => ({...current, indicators: current.indicators.filter(item => item.id !== id)})); return true;
  }
  addCommunity(programId: string, editionId: string, communityId: string) {
    const row = this.edition(programId, editionId);
    if (!row || !this.territories.find(communityId)?.active || row.communityIds.includes(communityId)) return false;
    this.updateEdition(editionId, current => ({...current, communityIds: [...current.communityIds, communityId]})); return true;
  }
  removeCommunity(programId: string, editionId: string, communityId: string) {
    const row = this.edition(programId, editionId); if (!row?.communityIds.includes(communityId)) return false;
    this.updateEdition(editionId, current => ({...current, communityIds: current.communityIds.filter(id => id !== communityId)})); return true;
  }
  private updateEdition(id: string, transform: (row: EditionDemo) => EditionDemo) {this.editionRows.update(rows => rows.map(row => row.id === id ? {...transform(row), modified: true} : row));}
}

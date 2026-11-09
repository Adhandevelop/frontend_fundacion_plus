import { Injectable, inject, signal } from '@angular/core';
import { InitiativeAdminDemoService } from '../../initiatives/services/initiative-admin-demo.service';
import { PROPOSALS_DEMO, InitiativeProposalDemo, ProposalState } from '../data/initiative-proposals.demo';

type ReviewResult = {ok: true} | {ok: false; error: 'missing' | 'conflict' | 'transition' | 'invalid'};
@Injectable({providedIn: 'root'})
export class InitiativeProposalsDemoService {
  readonly initiatives = inject(InitiativeAdminDemoService);
  private readonly rows = signal<readonly InitiativeProposalDemo[]>(PROPOSALS_DEMO.map(row => ({...row})));
  readonly proposals = this.rows.asReadonly();
  find(id: string) {return this.proposals().find(row => row.id === id) ?? null;}
  review(id: string, target: ProposalState, response: string, resultProgramId: string | null, expectedRevision: number): ReviewResult {
    const row = this.find(id); if (!row) return {ok: false, error: 'missing'};
    if (row.revision !== expectedRevision) return {ok: false, error: 'conflict'};
    const allowed = target === 'en_revision' ? row.state === 'pendiente' : ['aprobada', 'rechazada'].includes(target) && row.state === 'en_revision';
    if (!allowed) return {ok: false, error: 'transition'};
    const answer = response.trim();
    if (!row.consentExample || target !== 'en_revision' && (answer.length < 10 || answer.length > 2000) || resultProgramId !== null && (target !== 'aprobada' || !this.initiatives.program(resultProgramId))) return {ok: false, error: 'invalid'};
    this.rows.update(rows => rows.map(item => item.id === id ? {...item, state: target, response: target === 'en_revision' ? '' : answer,
      resultProgramId: target === 'aprobada' ? resultProgramId : null, reviewerLabel: 'Perfil de revisión · Demostración', reviewedAt: new Date().toISOString(), revision: item.revision + 1, modified: true} : item));
    return {ok: true};
  }
}

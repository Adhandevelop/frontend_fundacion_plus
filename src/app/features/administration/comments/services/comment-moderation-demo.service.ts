import { Injectable, signal } from '@angular/core';
import { ADMIN_CASES_DEMO } from '../../data/admin-cases.demo';
import { COMMENTS_DEMO, CommentDemo, CommentState, PublicCommentPreview, commentActions } from '../data/comments.demo';

type ModerateResult = {ok: true} | {ok: false; error: 'missing' | 'conflict' | 'transition' | 'reason'};
@Injectable({providedIn: 'root'})
export class CommentModerationDemoService {
  readonly cases = ADMIN_CASES_DEMO.map(row => ({code: row.code, title: row.title}));
  private sequence = 0;
  private readonly rows = signal<readonly CommentDemo[]>(COMMENTS_DEMO.map(row => ({...row,decisions: []})));
  readonly comments = this.rows.asReadonly();
  find(id: string) {return this.comments().find(row => row.id === id) ?? null;}
  moderate(id: string, target: CommentState, reason: string, expectedRevision: number): ModerateResult {
    const row = this.find(id); if (!row) return {ok: false,error:'missing'};
    if (row.revision !== expectedRevision) return {ok:false,error:'conflict'};
    if (!commentActions(row.state).includes(target)) return {ok:false,error:'transition'};
    const note = reason.trim();
    if (note.length > 2000 || target !== 'aprobado' && note.length < 10) return {ok:false,error:'reason'};
    const decision = {id:`comment-decision-${++this.sequence}`, before:row.state, after:target, reason:note, reviewerLabel:'Perfil moderador · Demostración', date:new Date().toISOString()};
    this.rows.update(rows => rows.map(item => item.id === id ? {...item,state:target,revision:item.revision+1,modified:true,decisions:[decision,...item.decisions]} : item));
    return {ok:true};
  }
  publicPreview(caseCode: string): readonly PublicCommentPreview[] {
    // Only this public dossier exists in the current prototype; not a publication policy for the API.
    if (caseCode !== 'PLUS-2025-084') return [];
    return this.comments().filter(row => row.caseCode === caseCode && row.state === 'aprobado')
      .map(({id,caseCode,authorAlias,body,date}) => ({id,caseCode,authorAlias,body,date}));
  }
}

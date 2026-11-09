import { Injectable, inject, signal } from '@angular/core';
import { InitiativeAdminDemoService } from './initiative-admin-demo.service';
import { UsersDemoService } from '../../users/services/users-demo.service';
import { ActivityDemo, ActivityInput, activityInstant, validActivity } from '../data/initiative-activity.demo';

@Injectable({providedIn: 'root'})
export class InitiativeActivitiesDemoService {
  readonly initiatives = inject(InitiativeAdminDemoService);
  readonly users = inject(UsersDemoService);
  private sequence = 0;
  private readonly rows = signal<readonly ActivityDemo[]>([]);
  readonly activities = this.rows.asReadonly();
  find(programId: string, editionId: string, id: string) {return this.activities().find(row => row.programId === programId && row.editionId === editionId && row.id === id) ?? null;}
  save(programId: string, editionId: string, input: ActivityInput, id?: string): {ok: true; id: string} | {ok: false; error: 'missing' | 'invalid'} {
    const previous = id ? this.find(programId, editionId, id) : null;
    if (!this.initiatives.edition(programId, editionId) || id !== undefined && !previous) return {ok: false, error: 'missing'};
    const value = {...input, title: input.title.trim(), description: input.description.trim(), place: input.place.trim()};
    if (!validActivity(value) || value.responsibleId && (!this.users.find(value.responsibleId) || !this.users.find(value.responsibleId)!.active && previous?.responsibleId !== value.responsibleId) || value.communityId && (!this.initiatives.territories.find(value.communityId) || !this.initiatives.territories.find(value.communityId)!.active && previous?.communityId !== value.communityId)) return {ok: false, error: 'invalid'};
    const savedId = id ?? `activity-local-${++this.sequence}`;
    const row: ActivityDemo = {...value, id: savedId, programId, editionId, start: activityInstant(value.start)!, end: value.end ? activityInstant(value.end) : null, modified: true};
    this.rows.update(rows => previous ? rows.map(item => item.id === savedId ? row : item) : [...rows, row]); return {ok: true, id: savedId};
  }
}

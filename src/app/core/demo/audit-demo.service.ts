import { Injectable, signal } from '@angular/core';
import { AuditDemoAction, AuditDemoActor, AuditDemoChange, AuditDemoEvent } from './audit-demo.model';

@Injectable({providedIn: 'root'})
export class AuditDemoService {
  private sequence = 0;
  private readonly entries = signal<readonly AuditDemoEvent[]>([{
    id: 'sample-1', code: 'PLUS-2025-084', action: 'sample', actor: 'system', date: '2025-02-14T14:00:00Z',
    origin: 'fixture', changes: [],
  }]);
  readonly events = this.entries.asReadonly();
  record(code: string, action: AuditDemoAction, actor: AuditDemoActor, changes: readonly AuditDemoChange[] = []) {
    this.entries.update(events => [{id: `local-${++this.sequence}`, code, action, actor, date: new Date().toISOString(),
      origin: 'local', changes: changes.map(change => ({...change}))}, ...events]);
  }
}

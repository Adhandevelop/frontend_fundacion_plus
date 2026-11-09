import { computed, inject, Injectable, signal } from '@angular/core';
import { CASES_DEMO } from '../data/cases.demo';
import { CaseWorkspaceDemoService } from '../../cases/workspace/services/case-workspace-demo.service';
import { historyForAudience } from '../../cases/workspace/data/case-workspace.demo';

export interface CitizenNotificationDemo {
  id: string; code: string; title: string; description: string; date: string;
  kind: 'case' | 'message' | 'correction'; read: boolean;
}
export interface CitizenProfileDemo {
  name: string; email: string; phone: string; department: string; municipality: string;
  community: string; caseUpdates: boolean; messageAlerts: boolean; bulletin: boolean; photoUrl: string | null;
}
export const INITIAL_CITIZEN_PROFILE_DEMO: CitizenProfileDemo = {
  name: 'María Elena · Ejemplo', email: 'ciudadana@example.invalid', phone: '',
  department: 'Chocó', municipality: 'Riosucio', community: 'El Porvenir',
  caseUpdates: true, messageAlerts: true, bulletin: false, photoUrl: null,
};

@Injectable({providedIn: 'root'})
export class CitizenAreaDemoService {
  private readonly cases = inject(CaseWorkspaceDemoService);
  private readonly seen = signal<ReadonlySet<string>>(new Set());
  readonly profile = signal<CitizenProfileDemo>({...INITIAL_CITIZEN_PROFILE_DEMO});
  readonly conversations = computed(() => CASES_DEMO.map(record => {
    const messages = this.cases.workflow(record.code).messages;
    return {...record, messages, latest: messages.at(-1), unread: messages.filter(message => message.sender === 'admin' && !this.seen().has(this.messageKey(record.code, message.id))).length};
  }).sort((a, b) => (b.latest?.date ?? '').localeCompare(a.latest?.date ?? '')));
  readonly unreadMessages = computed(() => this.conversations().reduce((total, item) => total + item.unread, 0));
  readonly notifications = computed<readonly CitizenNotificationDemo[]>(() => {
    const items: CitizenNotificationDemo[] = [];
    for (const record of CASES_DEMO) {
      const workflow = this.cases.workflow(record.code);
      for (const event of historyForAudience(workflow.history, 'citizen')) {
        const id = `${record.code}:history:${event.id}`;
        items.push({id, code: record.code, title: event.title, description: event.description, date: event.date, kind: 'case', read: this.seen().has(id)});
      }
      for (const message of workflow.messages.filter(item => item.sender === 'admin')) {
        const id = this.messageKey(record.code, message.id);
        items.push({id, code: record.code, title: 'Mensaje del equipo de ejemplo', description: message.text, date: message.date, kind: 'message', read: this.seen().has(id)});
      }
      if (workflow.correction && !workflow.history.some(item => item.title === 'Solicitud de corrección de ejemplo')) {
        const id = `${record.code}:correction:initial`;
        items.push({id, code: record.code, title: 'Información complementaria solicitada', description: workflow.correction, date: '2025-02-14T16:00:00Z', kind: 'correction', read: this.seen().has(id)});
      }
    }
    return items.sort((a, b) => b.date.localeCompare(a.date));
  });
  readonly unreadNotifications = computed(() => this.notifications().filter(item => !item.read).length);
  markRead(id: string) {this.mark([id]);}
  markConversationRead(code: string) {
    this.mark(this.cases.workflow(code).messages.filter(item => item.sender === 'admin').map(item => this.messageKey(code, item.id)));
  }
  markAllNotificationsRead() {this.mark(this.notifications().map(item => item.id));}
  saveProfile(value: CitizenProfileDemo) {
    const previous = this.profile().photoUrl;
    if (previous && previous !== value.photoUrl) URL.revokeObjectURL(previous);
    this.profile.set({...value});
  }
  resetProfile() {this.saveProfile({...INITIAL_CITIZEN_PROFILE_DEMO});}
  private messageKey(code: string, id: number) {return `${code}:message:${id}`;}
  private mark(ids: readonly string[]) {
    this.seen.update(current => {
      const next = new Set([...current, ...ids]);
      return next.size === current.size ? current : next;
    });
  }
}

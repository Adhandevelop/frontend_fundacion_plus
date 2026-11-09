import { Injectable, inject, signal } from '@angular/core';
import { AuditDemoService } from '../../../../core/demo/audit-demo.service';
import { ADMIN_CASES_DEMO } from '../../../administration/data/admin-cases.demo';
import { CASES_DEMO } from '../../../citizen/data/cases.demo';
import { DemoAudience, DemoEvidence, DemoHistory, DemoIdentity, DemoManagement, DemoModeration, DemoVisibility, DemoWorkflow } from '../data/case-workspace.demo';

@Injectable({providedIn: 'root'})
export class CaseWorkspaceDemoService {
  private readonly audit = inject(AuditDemoService);
  private readonly changes = signal<Record<string, DemoWorkflow>>({});
  private sequence = 100;
  modified(code: string) {return Boolean(this.changes()[code]);}
  identity(audience: DemoAudience, code: string): DemoIdentity | null {
    if (audience === 'citizen') {
      const row = CASES_DEMO.find(item => item.code === code);
      return row ? {code, title: row.title, territory: row.territory, category: row.kind, originalStatus: row.status} : null;
    }
    const row = ADMIN_CASES_DEMO.find(item => item.code === code);
    return row ? {code, title: row.title, territory: row.territory, category: row.category, originalStatus: row.status} : null;
  }
  workflow(code: string): DemoWorkflow {
    return this.changes()[code] ?? this.initial(code);
  }
  moderate(code: string, state: DemoModeration, reason: string, correction = false) {
    const before = this.workflow(code).moderation;
    this.update(code, current => ({...current, moderation: state, correction: correction ? reason : '', history: [this.event(correction ? 'Solicitud de corrección de ejemplo' : `Publicación: ${state}`, reason, correction || state === 'Rechazado' ? 'citizen' : 'internal'), ...current.history]}));
    this.audit.record(code, correction ? 'correction' : 'moderation', 'admin', [{field: 'Publicación simulada', before, after: state}]);
  }
  assign(code: string, assignee: string, reason: string) {
    const before = this.workflow(code);
    this.update(code, current => ({...current, assignee, management: current.management === 'Recibido' ? 'Asignado' : current.management, history: [this.event('Responsable actualizado en la demostración', `${assignee}. ${reason}`, 'citizen'), ...current.history]}));
    this.audit.record(code, 'assignment', 'admin', [{field: 'Responsable de ejemplo', before: before.assignee, after: assignee}, {field: 'Gestión simulada', before: before.management, after: this.workflow(code).management}]);
  }
  advance(code: string, title: string, description: string, visibility: DemoVisibility, management: DemoManagement) {
    const before = this.workflow(code).management;
    this.update(code, current => ({...current, management, history: [this.event(title, description, visibility), ...current.history]}));
    this.audit.record(code, 'progress', 'admin', [{field: 'Gestión simulada', before, after: management}, {field: 'Visibilidad del avance', before: 'Sin avance nuevo', after: visibility === 'internal' ? 'Interna' : visibility === 'citizen' ? 'Ciudadano y equipo' : 'Pública en la simulación'}]);
  }
  finish(code: string, management: 'Resuelto' | 'Cerrado', result: string) {
    const before = this.workflow(code).management;
    this.update(code, current => ({...current, management, result, history: [this.event(`Caso ${management.toLowerCase()} en la demostración`, result, 'citizen'), ...current.history]}));
    this.audit.record(code, 'result', 'admin', [{field: 'Gestión simulada', before, after: management}]);
  }
  contribute(code: string, description: string, files: readonly File[]) {
    this.update(code, current => ({...current,
      history: [this.event('Información complementaria de ejemplo', description, 'citizen'), ...current.history],
      evidence: [...current.evidence, ...files.map(file => ({id: this.id(), name: file.name, size: file.size, visibility: 'private' as const, origin: 'local' as const}))],
    }));
    this.audit.record(code, 'contribution', 'citizen', [{field: 'Anexos incorporados al ejemplo', before: 'Sin aporte nuevo', after: String(files.length)}]);
  }
  message(code: string, sender: DemoAudience, text: string) {
    this.update(code, current => ({...current, messages: [...current.messages, {id: this.id(), sender, text, date: this.date()}]}));
    this.audit.record(code, 'message', sender);
  }
  evidenceVisibility(code: string, id: number) {
    const before = this.workflow(code).evidence.find(item => item.id === id);
    if (!before) return;
    this.update(code, current => ({...current, evidence: current.evidence.map(item => item.id === id ? {...item, visibility: item.visibility === 'public' ? 'private' : 'public'} : item), history: [this.event('Visibilidad de evidencia modificada en la demostración', 'La ficha pública real no se modifica.', 'internal'), ...current.history]}));
    this.audit.record(code, 'evidence', 'admin', [{field: 'Visibilidad de evidencia', before: before.visibility === 'public' ? 'Pública en la simulación' : 'Reservada', after: before.visibility === 'public' ? 'Reservada' : 'Pública en la simulación'}]);
  }
  reset(code: string, actor: DemoAudience = 'admin') {
    if (!this.modified(code)) return;
    this.changes.update(all => {const next = {...all}; delete next[code]; return next;});
    this.audit.record(code, 'reset', actor, [{field: 'Simulación del expediente', before: 'Con cambios temporales', after: 'Ejemplo inicial restaurado'}]);
  }
  private update(code: string, transform: (current: DemoWorkflow) => DemoWorkflow) {
    this.changes.update(all => ({...all, [code]: transform(all[code] ?? this.initial(code))}));
  }
  private initial(code: string): DemoWorkflow {
    const row = ADMIN_CASES_DEMO.find(item => item.code === code);
    const management: DemoManagement = /Resuelto/.test(row?.status ?? '') ? 'Resuelto' : /Pendiente|Revisión|Requiere/.test(row?.status ?? '') ? 'Recibido' : 'En gestión';
    const evidence: DemoEvidence[] = code === 'PLUS-2025-084' ? [
      {id: 1, name: 'Fotografía de terreno — ejemplo.jpg', size: 2400000, visibility: 'public', origin: 'example'},
      {id: 2, name: 'Acta comunitaria — ejemplo.pdf', size: 1800000, visibility: 'private', origin: 'example'},
    ] : [];
    return {management, moderation: 'Pendiente', assignee: row?.assignee ?? 'Sin Asignar',
      correction: /Requiere/.test(row?.status ?? '') ? 'Ejemplo: amplía la descripción del hecho e indica la fecha de observación.' : '',
      result: management === 'Resuelto' ? 'Resultado de ejemplo pendiente de documentación real.' : '',
      evidence, history: [
        {id: 1, title: 'Radicación de ejemplo', description: 'Registro incluido en los diseños. Sin constancia de envío real.', date: '2025-02-14T14:00:00Z', visibility: 'citizen'},
        {id: 2, title: 'Nota interna de ejemplo', description: 'Revisar la documentación antes de decidir su publicación.', date: '2025-02-14T15:00:00Z', visibility: 'internal'},
      ], messages: [{id: 1, sender: 'admin', text: 'Conversación de ejemplo: aquí podrás consultar las respuestas del equipo sobre este caso.', date: '2025-02-14T15:00:00Z'}]};
  }
  private event(title: string, description: string, visibility: DemoVisibility): DemoHistory {
    return {id: this.id(), title, description, visibility, date: this.date()};
  }
  private id() {return ++this.sequence;}
  private date() {return new Date().toISOString();}
}

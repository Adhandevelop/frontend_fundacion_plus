import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DEMO_ASSIGNEES, DemoManagement, DemoVisibility, DemoWorkflow } from '../data/case-workspace.demo';
import { CaseWorkspaceDemoService } from '../services/case-workspace-demo.service';

@Component({selector: 'plus-case-demo-management', standalone: true, imports: [ReactiveFormsModule], templateUrl: './case-management.component.html'})
export class CaseManagementComponent {
  readonly code = input.required<string>();
  readonly workflow = input.required<DemoWorkflow>();
  readonly assignees = DEMO_ASSIGNEES;
  readonly action = signal<'review' | 'assign' | 'advance' | 'finish'>('review');
  readonly status = signal('');
  private readonly store = inject(CaseWorkspaceDemoService);
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly review = this.builder.group({decision: ['approve'], reason: ['', Validators.maxLength(2000)]});
  readonly assignment = this.builder.group({person: ['', Validators.required], reason: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(2000)]]});
  readonly advance = this.builder.group({title: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)]], description: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(2000)]], visibility: ['citizen'], state: ['En gestión']});
  readonly finish = this.builder.group({state: ['Resuelto'], result: ['', [Validators.required, Validators.pattern(/\S/), Validators.minLength(20), Validators.maxLength(2000)]]});
  moderate() {
    this.review.markAllAsTouched(); const {decision, reason} = this.review.getRawValue();
    if (this.review.invalid || decision !== 'approve' && reason.trim().length < 10) {this.status.set('Explica el rechazo o la corrección con al menos 10 caracteres.'); return;}
    this.store.moderate(this.code(), decision === 'approve' ? 'Aprobado' : decision === 'reject' ? 'Rechazado' : 'Pendiente', reason.trim() || 'Aprobación de publicación en la demostración.', decision === 'correct');
    this.status.set('Revisión aplicada solo al ejemplo. El estado de gestión no cambió.'); this.review.reset();
  }
  assign() {
    this.assignment.markAllAsTouched();
    if (this.assignment.invalid || this.finalized()) {this.status.set('Selecciona un responsable y explica la asignación. Los casos finalizados no se reasignan en esta demostración.'); return;}
    const value = this.assignment.getRawValue(); this.store.assign(this.code(), value.person, value.reason.trim()); this.assignment.reset(); this.status.set('Responsable actualizado en memoria.');
  }
  addAdvance() {
    this.advance.markAllAsTouched();
    if (this.advance.invalid || this.finalized()) {this.status.set('Completa título y descripción. Los casos finalizados no admiten avances en esta demostración.'); return;}
    const value = this.advance.getRawValue(); this.store.advance(this.code(), value.title.trim(), value.description.trim(), value.visibility as DemoVisibility, value.state as DemoManagement); this.advance.reset(); this.status.set('Avance añadido al historial de ejemplo con la visibilidad seleccionada.');
  }
  close() {
    this.finish.markAllAsTouched();
    if (this.finish.invalid || this.workflow().management === 'Cerrado') {this.status.set('Describe el resultado con entre 20 y 2000 caracteres. El ejemplo cerrado no admite otro cierre.'); return;}
    const value = this.finish.getRawValue(); this.store.finish(this.code(), value.state as 'Resuelto' | 'Cerrado', value.result.trim()); this.finish.reset(); this.status.set('Resultado registrado únicamente en la demostración. La publicación no cambió.');
  }
  finalized() {return ['Resuelto', 'Cerrado'].includes(this.workflow().management);}
}

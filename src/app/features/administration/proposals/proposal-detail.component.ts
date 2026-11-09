import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InitiativeProposalsDemoService } from './services/initiative-proposals-demo.service';
import { PROPOSAL_LABELS, ProposalState } from './data/initiative-proposals.demo';

@Component({selector: 'plus-proposal-detail', standalone: true, imports: [RouterLink, DatePipe, ReactiveFormsModule], templateUrl: './proposal-detail.component.html'})
export class ProposalDetailComponent {
  readonly store = inject(InitiativeProposalsDemoService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  readonly id = computed(() => this.params().get('id') ?? ''); readonly row = computed(() => this.store.find(this.id()));
  readonly labels = PROPOSAL_LABELS; readonly status = signal(''); readonly pending = signal<ProposalState | null>(null);
  private revisionAtOpen = 0;
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly form = this.builder.group({response: ['', Validators.maxLength(2000)], resultProgramId: ['']});
  constructor() {effect(() => {this.id(); this.pending.set(null); this.form.reset(); this.status.set('');}, {allowSignalWrites:true});}
  begin(target: ProposalState) {const row = this.row(); if (!row) return; this.revisionAtOpen = row.revision; this.pending.set(target); this.form.reset(); this.status.set('');}
  confirm() {
    const target = this.pending(); if (!target) return; this.form.markAllAsTouched(); const {response,resultProgramId} = this.form.getRawValue();
    if (this.form.invalid || target !== 'en_revision' && response.trim().length < 10) {this.status.set('Escribe una respuesta de entre 10 y 2000 caracteres para aprobar o rechazar.'); return;}
    const result = this.store.review(this.id(),target,response,target === 'aprobada' && resultProgramId ? resultProgramId : null,this.revisionAtOpen);
    if (!result.ok) {this.status.set(result.error === 'conflict' ? 'La solicitud cambió desde que abriste esta acción. Cancela y vuelve a revisar el estado.' : 'No se pudo aplicar esta revisión. Revisa estado, respuesta y programa seleccionado.'); return;}
    this.pending.set(null); this.form.reset(); this.status.set('Revisión guardada solo en memoria. No se envió ninguna respuesta ni se creó o publicó una iniciativa.');
  }
}

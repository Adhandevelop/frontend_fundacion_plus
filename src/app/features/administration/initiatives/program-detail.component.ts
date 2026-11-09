import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InitiativeAdminDemoService } from './services/initiative-admin-demo.service';
import { PROGRAM_LABELS, PUBLICATION_LABELS, ProgramPublication } from './data/initiative-admin.demo';
import { InitiativeMediaDemoService } from './services/initiative-media-demo.service';

@Component({selector: 'plus-program-detail', standalone: true, imports: [RouterLink, ReactiveFormsModule], templateUrl: './program-detail.component.html'})
export class ProgramDetailComponent {
  readonly store = inject(InitiativeAdminDemoService);
  readonly media = inject(InitiativeMediaDemoService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  private readonly query = toSignal(this.route.queryParamMap, {initialValue: this.route.snapshot.queryParamMap});
  readonly id = computed(() => this.params().get('id') ?? ''); readonly record = computed(() => this.store.program(this.id()));
  readonly editions = computed(() => this.store.editions().filter(row => row.programId === this.id()).sort((a,b) => b.year-a.year));
  readonly labels = PROGRAM_LABELS; readonly publicationLabels = PUBLICATION_LABELS;
  readonly pending = signal<ProgramPublication | null>(null); readonly status = signal('');
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly review = this.builder.group({reason: ['', Validators.maxLength(2000)]});
  constructor() {effect(() => {this.id(); const result = this.query().get('resultado'); this.pending.set(null); this.review.reset(); this.status.set(result === 'guardado' ? 'Programa guardado como borrador temporal.' : '');}, {allowSignalWrites: true});}
  confirm() {const target = this.pending(); if (!target) return; this.review.markAllAsTouched(); if (this.review.invalid || !this.store.publish(this.id(),target,this.review.controls.reason.value)) {this.status.set('Revisa el estado y las descripciones. Para rechazo, indica un motivo de entre 10 y 2000 caracteres.'); return;} this.pending.set(null); this.review.reset(); this.status.set('Publicación actualizada solo en el ejemplo. El portal público no cambió.');}
  feature() {this.status.set(this.store.feature(this.id()) ? 'Destacado de ejemplo actualizado.' : 'Solo un programa publicado puede destacarse.');}
}

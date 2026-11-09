import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InitiativeAdminDemoService } from './services/initiative-admin-demo.service';
import { PROGRAM_LABELS, PROGRAM_STATES, ProgramState } from './data/initiative-admin.demo';

@Component({selector: 'plus-edition-editor', standalone: true, imports: [RouterLink, ReactiveFormsModule], templateUrl: './edition-editor.component.html'})
export class EditionEditorComponent {
  private readonly store = inject(InitiativeAdminDemoService);
  private readonly route = inject(ActivatedRoute); private readonly router = inject(Router);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  readonly programId = computed(() => this.params().get('programId') ?? '');
  readonly id = computed(() => this.params().get('editionId'));
  readonly program = computed(() => this.store.program(this.programId()));
  readonly record = computed(() => this.id() ? this.store.edition(this.programId(), this.id()!) : null);
  readonly missing = computed(() => !this.program() || this.id() !== null && !this.record());
  readonly states = PROGRAM_STATES; readonly labels = PROGRAM_LABELS; readonly status = signal('');
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly form = this.builder.group({year: [2026, [Validators.required, Validators.min(2000), Validators.max(2200), Validators.pattern(/^\d+$/)]], name: ['', Validators.maxLength(150)], season: ['', Validators.maxLength(100)], description: [''], start: [''], end: [''], state: this.builder.control<ProgramState>('planificada', Validators.required)});
  constructor() {effect(() => {const row = this.record(); this.form.reset({year: row?.year ?? 2026, name: row?.name ?? '', season: row?.season ?? '', description: row?.description ?? '', start: row?.start ?? '', end: row?.end ?? '', state: row?.state ?? 'planificada'}); this.status.set('');}, {allowSignalWrites: true});}
  save() {
    this.form.markAllAsTouched(); if (this.form.invalid || this.missing()) {this.status.set('Revisa el programa, año y límites de los campos.'); return;}
    const result = this.store.saveEdition(this.programId(), this.form.getRawValue(), this.id() ?? undefined);
    if (!result.ok) {this.status.set(result.error === 'duplicate' ? 'Este programa ya tiene una edición para ese año.' : 'Revisa las fechas: deben ser válidas y la final no puede ser anterior a la inicial.'); return;}
    void this.router.navigate(['/admin/iniciativas',this.programId(),'ediciones',result.id], {queryParams: {resultado: 'guardado'}});
  }
}

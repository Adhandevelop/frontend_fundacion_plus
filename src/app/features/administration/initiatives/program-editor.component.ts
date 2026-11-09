import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InitiativeAdminDemoService } from './services/initiative-admin-demo.service';
import { PROGRAM_LABELS, PROGRAM_STATES, ProgramState } from './data/initiative-admin.demo';

@Component({selector: 'plus-program-editor', standalone: true, imports: [RouterLink, ReactiveFormsModule], templateUrl: './program-editor.component.html'})
export class ProgramEditorComponent {
  private readonly store = inject(InitiativeAdminDemoService);
  private readonly route = inject(ActivatedRoute); private readonly router = inject(Router);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  readonly id = computed(() => this.params().get('id')); readonly record = computed(() => this.id() ? this.store.program(this.id()!) : null);
  readonly missing = computed(() => this.id() !== null && !this.record());
  readonly states = PROGRAM_STATES; readonly labels = PROGRAM_LABELS; readonly status = signal('');
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly form = this.builder.group({title: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]], subtitle: ['', Validators.maxLength(250)], slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), Validators.maxLength(220)]], category: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(80)]], summary: [''], description: [''], state: this.builder.control<ProgramState>('planificada', Validators.required)});
  constructor() {effect(() => {const row = this.record(); this.form.reset({title: row?.title ?? '', subtitle: row?.subtitle ?? '', slug: row?.slug ?? '', category: row?.category ?? '', summary: row?.summary ?? '', description: row?.description ?? '', state: row?.state ?? 'planificada'}); this.status.set('');}, {allowSignalWrites: true});}
  slug() {this.form.controls.slug.setValue(this.form.controls.title.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,220).replace(/-$/,'')); this.form.controls.slug.markAsDirty();}
  save() {this.form.markAllAsTouched(); if (this.form.invalid || this.missing()) {this.status.set('Revisa título, slug, categoría y límites de los campos.'); return;} const result = this.store.saveProgram(this.form.getRawValue(), this.id() ?? undefined); if (!result.ok) {this.status.set(result.error === 'duplicate' ? 'Ese slug ya existe en los programas de ejemplo.' : 'No se pudo guardar este programa.'); return;} void this.router.navigate(['/admin/iniciativas',result.id], {queryParams: {resultado: 'guardado'}});}
}

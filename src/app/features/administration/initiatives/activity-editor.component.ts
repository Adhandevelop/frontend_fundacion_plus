import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InitiativeActivitiesDemoService } from './services/initiative-activities-demo.service';
import { ACTIVITY_LABELS, ACTIVITY_STATES, ActivityState, activityLocal } from './data/initiative-activity.demo';

@Component({selector: 'plus-activity-editor', standalone: true, imports: [RouterLink, ReactiveFormsModule], templateUrl: './activity-editor.component.html'})
export class ActivityEditorComponent {
  readonly store = inject(InitiativeActivitiesDemoService);
  private readonly route = inject(ActivatedRoute); private readonly router = inject(Router);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  readonly programId = computed(() => this.params().get('programId') ?? ''); readonly editionId = computed(() => this.params().get('editionId') ?? ''); readonly id = computed(() => this.params().get('activityId'));
  readonly edition = computed(() => this.store.initiatives.edition(this.programId(),this.editionId()));
  readonly record = computed(() => this.id() ? this.store.find(this.programId(),this.editionId(),this.id()!) : null);
  readonly missing = computed(() => !this.edition() || this.id() !== null && !this.record());
  readonly users = computed(() => this.store.users.users().filter(row => row.active || row.id === this.record()?.responsibleId));
  readonly communities = computed(() => this.store.initiatives.territories.communities().filter(row => row.active || row.id === this.record()?.communityId));
  readonly labels = ACTIVITY_LABELS; readonly states = ACTIVITY_STATES; readonly status = signal('');
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly form = this.builder.group({title: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]], description: [''], start: ['', Validators.required], end: [''], place: ['', Validators.maxLength(200)], state: this.builder.control<ActivityState>('programada', Validators.required), responsibleId: [''], communityId: [''], latitude: this.builder.control<number | null>(null, [Validators.min(-90), Validators.max(90)]), longitude: this.builder.control<number | null>(null, [Validators.min(-180), Validators.max(180)])});
  constructor() {effect(() => {const row = this.record(); this.form.reset({title: row?.title ?? '', description: row?.description ?? '', start: activityLocal(row?.start ?? null), end: activityLocal(row?.end ?? null), place: row?.place ?? '', state: row?.state ?? 'programada', responsibleId: row?.responsibleId ?? '', communityId: row?.communityId ?? '', latitude: row?.latitude ?? null, longitude: row?.longitude ?? null}); this.status.set('');}, {allowSignalWrites: true});}
  save() {this.form.markAllAsTouched(); if (this.form.invalid || this.missing()) {this.status.set('Revisa título, fecha inicial, límites y coordenadas.'); return;} const result = this.store.save(this.programId(),this.editionId(),this.form.getRawValue(),this.id() ?? undefined); if (!result.ok) {this.status.set('Revisa fechas válidas y ordenadas, ambas coordenadas o ninguna, responsable y comunidad disponibles.'); return;} void this.router.navigate(['/admin/iniciativas',this.programId(),'ediciones',this.editionId(),'actividades',result.id], {queryParams: {resultado: 'guardado'}});}
}

import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InitiativeAdminDemoService } from './services/initiative-admin-demo.service';
import { IndicatorDemo, PROGRAM_LABELS } from './data/initiative-admin.demo';
import { communityTerritory } from '../territories/data/territories.demo';
import { InitiativeMediaDemoService } from './services/initiative-media-demo.service';

@Component({selector: 'plus-edition-detail', standalone: true, imports: [RouterLink, ReactiveFormsModule], templateUrl: './edition-detail.component.html'})
export class EditionDetailComponent {
  readonly store = inject(InitiativeAdminDemoService);
  readonly media = inject(InitiativeMediaDemoService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  private readonly query = toSignal(this.route.queryParamMap, {initialValue: this.route.snapshot.queryParamMap});
  readonly programId = computed(() => this.params().get('programId') ?? ''); readonly id = computed(() => this.params().get('editionId') ?? '');
  readonly program = computed(() => this.store.program(this.programId())); readonly record = computed(() => this.store.edition(this.programId(),this.id()));
  readonly labels = PROGRAM_LABELS; readonly territory = communityTerritory;
  readonly status = signal(''); readonly editing = signal<string | undefined>(undefined);
  readonly removing = signal<{kind: 'indicator' | 'community'; id: string} | null>(null);
  readonly availableCommunities = computed(() => this.store.territories.communities().filter(row => row.active && !this.record()?.communityIds.includes(row.id)));
  readonly coverage = computed(() => (this.record()?.communityIds ?? []).map(id => this.store.territories.find(id)).filter(row => row !== null));
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly indicator = this.builder.group({name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]], value: ['0', [Validators.required, Validators.pattern(/^\d{1,12}(?:\.\d{1,2})?$/)]], unit: ['', Validators.maxLength(50)], measurement: this.builder.control<'estimado' | 'real'>('estimado', Validators.required), cutoff: ['']});
  readonly community = this.builder.group({id: ['', Validators.required]});
  constructor() {effect(() => {this.id(); this.programId(); const result = this.query().get('resultado'); this.indicator.reset(); this.community.reset(); this.editing.set(undefined); this.removing.set(null); this.status.set(result === 'guardado' ? 'Edición guardada en memoria. Sin publicación real.' : '');}, {allowSignalWrites: true});}
  editIndicator(row: IndicatorDemo) {this.editing.set(row.id); this.indicator.reset(row); this.status.set('Indicador cargado en el formulario de edición.');}
  cancelIndicator() {this.editing.set(undefined); this.indicator.reset();}
  saveIndicator() {this.indicator.markAllAsTouched(); if (this.indicator.invalid || !this.store.saveIndicator(this.programId(),this.id(),this.indicator.getRawValue(),this.editing())) {this.status.set('Revisa nombre, valor no negativo con hasta dos decimales, unidad y fecha válida.'); return;} this.cancelIndicator(); this.status.set('Indicador guardado solo en esta edición de ejemplo.');}
  addCommunity() {this.community.markAllAsTouched(); if (this.community.invalid || !this.store.addCommunity(this.programId(),this.id(),this.community.controls.id.value)) {this.status.set('Selecciona una comunidad activa que todavía no esté vinculada.'); return;} this.community.reset(); this.status.set('Cobertura de ejemplo actualizada. No se modificaron casos ni perfiles.');}
  remove() {const target = this.removing(); if (!target) return; const ok = target.kind === 'indicator' ? this.store.removeIndicator(this.programId(),this.id(),target.id) : this.store.removeCommunity(this.programId(),this.id(),target.id); if (ok && this.editing() === target.id) this.cancelIndicator(); this.removing.set(null); this.status.set(ok ? 'Elemento retirado de esta edición de ejemplo.' : 'No se encontró el elemento en esta edición.');}
}

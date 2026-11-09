import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TerritoriesDemoService } from './services/territories-demo.service';
import { communityTerritory } from './data/territories.demo';

@Component({selector: 'plus-community-detail', standalone: true, imports: [RouterLink], templateUrl: './community-detail.component.html'})
export class CommunityDetailComponent {
  readonly store = inject(TerritoriesDemoService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  private readonly query = toSignal(this.route.queryParamMap, {initialValue: this.route.snapshot.queryParamMap});
  readonly id = computed(() => this.params().get('id') ?? '');
  readonly record = computed(() => this.store.find(this.id()));
  readonly territory = communityTerritory;
  readonly confirming = signal(false);
  readonly status = signal('');
  constructor() {effect(() => {this.id(); const result = this.query().get('resultado'); this.confirming.set(false); this.status.set(result === 'creado' ? 'Comunidad de ejemplo creada en memoria.' : result === 'editado' ? 'Cambios del ejemplo guardados en memoria.' : '');}, {allowSignalWrites: true});}
  changeState() {const row = this.record(); if (!row) return; this.store.setActive(row.id, !row.active); this.confirming.set(false); this.status.set('Estado del ejemplo actualizado. No se alteraron casos, perfiles ni catálogos reales.');}
}

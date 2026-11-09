import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TerritoriesDemoService } from './services/territories-demo.service';
import { COMMUNITY_TYPES, DEPARTMENTS_DEMO, MUNICIPALITIES_DEMO, EMPTY_COMMUNITY_FILTERS, CommunityFilters, communityTerritory, filterCommunities } from './data/territories.demo';

@Component({selector: 'plus-admin-communities', standalone: true, imports: [RouterLink], templateUrl: './communities-list.component.html'})
export class CommunitiesListComponent {
  readonly store = inject(TerritoriesDemoService);
  readonly departments = DEPARTMENTS_DEMO;
  readonly types = COMMUNITY_TYPES;
  readonly territory = communityTerritory;
  readonly filters = signal<CommunityFilters>({...EMPTY_COMMUNITY_FILTERS});
  readonly municipalities = computed(() => MUNICIPALITIES_DEMO.filter(item => !this.filters().departmentId || item.departmentId === this.filters().departmentId));
  readonly filtered = computed(() => filterCommunities(this.store.communities(), this.filters()));
  readonly page = signal(1);
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 5)));
  readonly visible = computed(() => this.filtered().slice((this.page() - 1) * 5, this.page() * 5));
  readonly metrics = computed(() => [{label: 'Comunidades de la selección', value: this.filtered().length}, {label: 'Activas en el ejemplo', value: this.filtered().filter(row => row.active).length}, {label: 'Municipios representados', value: new Set(this.filtered().map(row => row.municipalityId)).size}]);
  change(key: keyof CommunityFilters, value: string) {this.filters.update(current => ({...current, [key]: value, ...(key === 'departmentId' ? {municipalityId: ''} : {})})); this.page.set(1);}
  reset() {this.filters.set({...EMPTY_COMMUNITY_FILTERS}); this.page.set(1);}
  navigate(delta: number) {this.page.update(page => Math.max(1, Math.min(this.pages(), page + delta)));}
}

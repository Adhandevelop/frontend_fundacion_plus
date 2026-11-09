import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InitiativeAdminDemoService } from './services/initiative-admin-demo.service';
import { PROGRAM_LABELS, PROGRAM_STATES, PUBLICATION_LABELS, PUBLICATION_STATES, ProgramFilters, filterPrograms } from './data/initiative-admin.demo';

@Component({selector: 'plus-admin-programs', standalone: true, imports: [RouterLink], templateUrl: './program-list.component.html'})
export class ProgramListComponent {
  readonly store = inject(InitiativeAdminDemoService);
  readonly states = PROGRAM_STATES; readonly publications = PUBLICATION_STATES;
  readonly stateLabels = PROGRAM_LABELS; readonly publicationLabels = PUBLICATION_LABELS;
  readonly filters = signal<ProgramFilters>({query: '', category: '', state: '', publication: '', year: ''});
  readonly categories = computed(() => [...new Set(this.store.programs().map(row => row.category))].sort());
  readonly years = computed(() => [...new Set(this.store.editions().map(row => row.year))].sort((a, b) => b - a));
  readonly filtered = computed(() => filterPrograms(this.store.programs(), this.store.editions(), this.filters()));
  readonly page = signal(1);
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 5)));
  readonly visible = computed(() => this.filtered().slice((this.page() - 1) * 5, this.page() * 5));
  readonly reviewCount = computed(() => this.filtered().filter(row => row.publication === 'pendiente').length);
  change(key: keyof ProgramFilters, value: string) {this.filters.update(current => ({...current, [key]: value})); this.page.set(1);}
  reset() {this.filters.set({query: '', category: '', state: '', publication: '', year: ''}); this.page.set(1);}
  navigate(delta: number) {this.page.update(page => Math.max(1, Math.min(this.pages(), page + delta)));}
  editionCount(id: string) {return this.store.editions().filter(row => row.programId === id).length;}
}

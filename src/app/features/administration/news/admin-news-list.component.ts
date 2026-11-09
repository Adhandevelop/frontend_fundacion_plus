import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EDITORIAL_CATEGORIES, EDITORIAL_LABELS, EDITORIAL_STATES, EditorialFilters, filterEditorialNews } from './data/editorial-news.demo';
import { EditorialNewsDemoService } from './services/editorial-news-demo.service';

@Component({selector: 'plus-admin-news', standalone: true, imports: [RouterLink], templateUrl: './admin-news-list.component.html'})
export class AdminNewsListComponent {
  readonly store = inject(EditorialNewsDemoService);
  readonly labels = EDITORIAL_LABELS;
  readonly states = EDITORIAL_STATES;
  readonly categories = EDITORIAL_CATEGORIES;
  readonly filters = signal<EditorialFilters>({query: '', category: '', state: ''});
  readonly filtered = computed(() => filterEditorialNews(this.store.news(), this.filters()));
  readonly page = signal(1);
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 5)));
  readonly visible = computed(() => this.filtered().slice((this.page() - 1) * 5, this.page() * 5));
  readonly metrics = computed(() => [{label: 'Noticias de la selección', value: this.filtered().length}, {label: 'En revisión', value: this.filtered().filter(row => row.state === 'en_revision').length}, {label: 'Publicadas en el ejemplo', value: this.filtered().filter(row => row.state === 'publicada').length}]);
  change(key: keyof EditorialFilters, value: string) {this.filters.update(current => ({...current, [key]: value})); this.page.set(1);}
  reset() {this.filters.set({query: '', category: '', state: ''}); this.page.set(1);}
  navigate(delta: number) {this.page.update(page => Math.max(1, Math.min(this.pages(), page + delta)));}
}

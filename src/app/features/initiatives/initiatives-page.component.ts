import { Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { InitiativesHeroComponent } from './components/hero/hero.component';
import { FeaturedInitiativeComponent } from './components/featured/featured.component';
import { InitiativeParticipationComponent } from './components/participation/participation.component';
import { InitiativeCardComponent } from './components/card/initiative-card.component';
import { INITIATIVES_DEMO, InitiativeDemo } from './data/initiatives.demo';

@Component({
  selector: 'plus-initiatives-page', standalone: true,
  imports: [InitiativesHeroComponent, FeaturedInitiativeComponent, InitiativeParticipationComponent, InitiativeCardComponent],
  templateUrl: './initiatives-page.component.html', styleUrl: './initiatives-page.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class InitiativesPageComponent {
  readonly featured = INITIATIVES_DEMO[0];
  readonly query = signal('');
  readonly category = signal('');
  readonly year = signal('2025');
  readonly selected = signal<InitiativeDemo | null>(null);
  readonly filtered = computed(() => INITIATIVES_DEMO.filter(item =>
    (!this.category() || this.category() === item.category) && (!this.year() || this.year() === item.year) &&
    this.normalize(`${item.title} ${item.summary} ${item.category} ${item.period}`).includes(this.normalize(this.query().trim()))));
  readonly featuredVisible = computed(() => this.filtered().some(item => item.featured));
  readonly others = computed(() => this.filtered().filter(item => !item.featured));
  changeCategory(value: string) {this.category.set(value); this.selected.set(null);}
  openGallery(item: InitiativeDemo) {
    this.selected.set(item);
    setTimeout(() => {
      document.getElementById('initiative-gallery')?.scrollIntoView({block: 'start'});
      document.getElementById('initiative-gallery-title')?.focus({preventScroll: true});
    });
  }
  private normalize(value: string) {return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');}
}

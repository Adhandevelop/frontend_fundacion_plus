import { Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { NewsCardComponent } from './components/card/news-card.component';
import { FeaturedComponent } from './components/featured/featured.component';
import { CommunityComponent } from './components/community/community.component';
import { NEWS_DEMO, NewsDemo } from './data/news.demo';

@Component({
  selector: 'plus-news-page', standalone: true,
  imports: [NewsCardComponent, FeaturedComponent, CommunityComponent],
  templateUrl: './news-page.component.html', styleUrl: '../../shared/styles/editorial-pages.css',
  encapsulation: ViewEncapsulation.None,
})
export class NewsPageComponent {
  readonly query = signal('');
  readonly category = signal('');
  readonly order = signal('recent');
  readonly page = signal(1);
  readonly pageSize = 6;
  readonly selected = signal<NewsDemo | null>(null);
  readonly categories = ['', ...new Set(NEWS_DEMO.map(article => article.category))];
  readonly filtered = computed(() => NEWS_DEMO.filter(article => !article.featured && this.matches(article))
    .sort((a, b) => this.order() === 'old' ? b.order - a.order : a.order - b.order));
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  readonly visible = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize));
  readonly showFeatured = computed(() => this.matches(NEWS_DEMO[0]));
  changeQuery(value: string) {this.query.set(value); this.page.set(1); this.selected.set(null);}
  changeCategory(value: string) {this.category.set(value); this.page.set(1); this.selected.set(null);}
  navigate(delta: number) {this.page.update(value => Math.min(this.pages(), Math.max(1, value + delta)));}
  openArticle(article: NewsDemo) {
    this.selected.set(article);
    setTimeout(() => {
      document.getElementById('news-preview')?.scrollIntoView({block: 'start'});
      document.getElementById('news-preview-title')?.focus({preventScroll: true});
    });
  }
  private matches(article: NewsDemo) {
    return (!this.category() || article.category === this.category()) &&
      this.normalize(`${article.title} ${article.summary} ${article.category}`).includes(this.normalize(this.query().trim()));
  }
  private normalize(value: string) {return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');}
}

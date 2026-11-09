import { Component, input, output } from '@angular/core';
import { NewsDemo } from '../../data/news.demo';

@Component({selector: 'plus-news-card', standalone: true, templateUrl: './news-card.component.html'})
export class NewsCardComponent {
  readonly article = input.required<NewsDemo>();
  readonly open = output<NewsDemo>();
}

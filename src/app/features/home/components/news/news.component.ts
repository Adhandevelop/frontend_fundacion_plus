import {Component, DestroyRef, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RouterLink} from '@angular/router';
import {NewsApiService} from '../../../news/news-api.service';
import {NewsDemo} from '../../../news/data/news.demo';

@Component({selector:'plus-news',standalone:true,imports:[RouterLink],templateUrl:'./news.component.html'})
export class NewsComponent {
 private readonly api=inject(NewsApiService);private readonly destroy=inject(DestroyRef);
 readonly articles=signal<NewsDemo[]>([]);readonly loading=signal(true);readonly unavailable=signal(false);
 constructor(){this.api.list().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{this.articles.set(value.slice(0,3));this.loading.set(false);},error:()=>{this.unavailable.set(true);this.loading.set(false);}});}
}

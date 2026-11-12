import { Component, computed, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { NewsCardComponent } from './components/card/news-card.component';
import { FeaturedComponent } from './components/featured/featured.component';
import { CommunityComponent } from './components/community/community.component';
import { NEWS_DEMO, NewsDemo } from './data/news.demo';
import { NewsApiService } from './news-api.service';
import { apiErrorMessage } from '../../core/api/api-error';

@Component({selector:'plus-news-page',standalone:true,imports:[NewsCardComponent,FeaturedComponent,CommunityComponent],templateUrl:'./news-page.component.html',styleUrl:'../../shared/styles/editorial-pages.css',encapsulation:ViewEncapsulation.None})
export class NewsPageComponent {
 private readonly api=inject(NewsApiService);private readonly destroy=inject(DestroyRef);
 readonly query=signal('');readonly category=signal('');readonly order=signal('recent');readonly page=signal(1);readonly pageSize=6;
 readonly selected=signal<NewsDemo|null>(null);readonly articles=signal<readonly NewsDemo[]>([]);readonly categoryValues=signal<string[]>([]);readonly loading=signal(true);readonly detailLoading=signal(false);readonly error=signal('');readonly fallback=signal(false);
 readonly categories=computed(()=>['',...this.categoryValues()]);
 readonly featured=computed(()=>this.articles().find(article=>article.featured)??this.articles()[0]??null);
 readonly filtered=computed(()=>this.articles().filter(article=>article.id!==this.featured()?.id&&this.matches(article)).sort((a,b)=>{const first=Date.parse(a.publishedAt??'')||a.order,second=Date.parse(b.publishedAt??'')||b.order;return this.order()==='old'?first-second:second-first;}));
 readonly pages=computed(()=>Math.max(1,Math.ceil(this.filtered().length/this.pageSize)));
 readonly visible=computed(()=>this.filtered().slice((this.page()-1)*this.pageSize,this.page()*this.pageSize));
 readonly showFeatured=computed(()=>{const value=this.featured();return !!value&&this.matches(value);});
 constructor(){forkJoin({articles:this.api.list(),categories:this.api.categories()}).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:({articles,categories})=>{if(articles.length){this.articles.set(articles);this.categoryValues.set(categories.length?categories:[...new Set(articles.map(item=>item.category))]);}else this.useFallback();this.loading.set(false);},error:error=>{this.error.set(apiErrorMessage(error));this.useFallback();this.loading.set(false);}});}
 changeQuery(value:string){this.query.set(value);this.page.set(1);this.selected.set(null);}
 changeCategory(value:string){this.category.set(value);this.page.set(1);this.selected.set(null);}
 navigate(delta:number){this.page.update(value=>Math.min(this.pages(),Math.max(1,value+delta)));}
 openArticle(article:NewsDemo){if(article.demo||!article.slug){this.selected.set(article);this.focusPreview();return;}this.detailLoading.set(true);this.error.set('');this.api.detail(article.slug).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{this.selected.set(value);this.detailLoading.set(false);this.focusPreview();},error:error=>{this.detailLoading.set(false);this.error.set(apiErrorMessage(error));}});}
 private useFallback(){const values=NEWS_DEMO.map(article=>({...article,demo:true}));this.articles.set(values);this.categoryValues.set([...new Set(values.map(article=>article.category))]);this.fallback.set(true);}
 private focusPreview(){setTimeout(()=>{document.getElementById('news-preview')?.scrollIntoView({block:'start'});document.getElementById('news-preview-title')?.focus({preventScroll:true});});}
 private matches(article:NewsDemo){return(!this.category()||article.category===this.category())&&this.normalize(`${article.title} ${article.summary} ${article.category}`).includes(this.normalize(this.query().trim()));}
 private normalize(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
}

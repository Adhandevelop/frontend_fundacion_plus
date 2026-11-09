import { Component, output } from '@angular/core';
import { NEWS_DEMO, NewsDemo } from '../../data/news.demo';
@Component({selector:'plus-news-featured',standalone:true,templateUrl:'./featured.component.html'})
export class FeaturedComponent {readonly featured=NEWS_DEMO[0];readonly open=output<NewsDemo>();openArticle(article:NewsDemo,event:Event){event.preventDefault();this.open.emit(article);}}

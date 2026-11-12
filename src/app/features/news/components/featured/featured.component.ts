import { Component, input, output } from '@angular/core';
import { NewsDemo } from '../../data/news.demo';
@Component({selector:'plus-news-featured',standalone:true,templateUrl:'./featured.component.html'})
export class FeaturedComponent {readonly featured=input.required<NewsDemo>();readonly open=output<NewsDemo>();openArticle(article:NewsDemo,event:Event){event.preventDefault();this.open.emit(article);}}

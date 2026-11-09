import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommentModerationDemoService } from './services/comment-moderation-demo.service';
import { COMMENT_LABELS, COMMENT_STATES, CommentFilters, filterComments } from './data/comments.demo';

@Component({selector:'plus-comments-list',standalone:true,imports:[RouterLink,DatePipe],templateUrl:'./comments-list.component.html'})
export class CommentsListComponent {
  readonly store = inject(CommentModerationDemoService);
  private readonly route = inject(ActivatedRoute);
  readonly labels = COMMENT_LABELS; readonly states = COMMENT_STATES;
  readonly filters = signal<CommentFilters>({query:'',caseCode:'',state:''});
  readonly filtered = computed(() => filterComments(this.store.comments(),this.filters()));
  readonly page = signal(1); readonly pages = computed(() => Math.max(1,Math.ceil(this.filtered().length/5)));
  readonly visible = computed(() => this.filtered().slice((this.page()-1)*5,this.page()*5));
  readonly metrics = computed(() => [{label:'Comentarios de la selección',value:this.filtered().length},{label:'Pendientes',value:this.filtered().filter(row => row.state === 'pendiente').length},{label:'Aprobados en el ejemplo',value:this.filtered().filter(row => row.state === 'aprobado').length}]);
  constructor() {this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => this.change('caseCode',params.get('caso') ?? ''));}
  change(key: keyof CommentFilters,value:string) {this.filters.update(current => ({...current,[key]:value}));this.page.set(1);}
  reset() {this.filters.set({query:'',caseCode:'',state:''});this.page.set(1);}
  navigate(delta:number) {this.page.update(page => Math.max(1,Math.min(this.pages(),page+delta)));}
}

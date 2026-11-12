import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminNewsApiService, AdminNewsArticle, NEWS_STATE_LABELS, NewsState } from './services/admin-news-api.service';

@Component({selector:'plus-admin-news',standalone:true,imports:[RouterLink,DatePipe],templateUrl:'./admin-news-list.component.html'})
export class AdminNewsListComponent {
 private readonly api=inject(AdminNewsApiService);private readonly destroy=inject(DestroyRef);readonly labels=NEWS_STATE_LABELS;readonly states=Object.keys(NEWS_STATE_LABELS) as NewsState[];
 readonly rows=signal<AdminNewsArticle[]>([]);readonly count=signal(0);readonly page=signal(1);readonly pageSize=10;readonly pages=computed(()=>Math.max(1,Math.ceil(this.count()/this.pageSize)));readonly state=signal('');readonly query=signal('');readonly loading=signal(false);readonly error=signal('');
 readonly visible=computed(()=>{const term=this.normalize(this.query());return term?this.rows().filter(row=>this.normalize(`${row.title} ${row.slug} ${row.summary}`).includes(term)):this.rows();});
 constructor(){this.load();}
 load(page=1){this.loading.set(true);this.error.set('');this.api.list(this.state(),page,this.pageSize).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>{this.rows.set(value.results);this.count.set(value.count);this.page.set(page);},error:error=>this.error.set(apiErrorMessage(error))});}
 changeState(value:string){this.state.set(value);this.load(1);}
 navigate(delta:number){this.load(Math.max(1,Math.min(this.pages(),this.page()+delta)));}
 private normalize(value:string){return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
}

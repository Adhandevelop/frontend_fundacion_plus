import { Component, computed, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { InitiativesHeroComponent } from './components/hero/hero.component';
import { FeaturedInitiativeComponent } from './components/featured/featured.component';
import { InitiativeParticipationComponent } from './components/participation/participation.component';
import { InitiativeCardComponent } from './components/card/initiative-card.component';
import { INITIATIVES_DEMO, InitiativeDemo } from './data/initiatives.demo';
import { InitiativesApiService } from './initiatives-api.service';
import { apiErrorMessage } from '../../core/api/api-error';

@Component({selector:'plus-initiatives-page',standalone:true,imports:[DatePipe,InitiativesHeroComponent,FeaturedInitiativeComponent,InitiativeParticipationComponent,InitiativeCardComponent],templateUrl:'./initiatives-page.component.html',styleUrl:'./initiatives-page.component.css',encapsulation:ViewEncapsulation.None})
export class InitiativesPageComponent {
 private readonly api=inject(InitiativesApiService);private readonly destroy=inject(DestroyRef);
 readonly initiatives=signal<readonly InitiativeDemo[]>([]);readonly categories=signal<string[]>([]);readonly query=signal('');readonly category=signal('');readonly year=signal('');readonly selected=signal<InitiativeDemo|null>(null);readonly loading=signal(true);readonly detailLoading=signal(false);readonly fallback=signal(false);readonly error=signal('');
 readonly years=computed(()=>[...new Set(this.initiatives().flatMap(item=>item.years?.length?item.years:item.year?[item.year]:[]))].sort((a,b)=>b.localeCompare(a)));
 readonly filtered=computed(()=>this.initiatives().filter(item=>(!this.category()||this.category()===item.category)&&(!this.year()||item.years?.includes(this.year())||item.year===this.year())&&this.normalize(`${item.title} ${item.summary} ${item.category} ${item.period}`).includes(this.normalize(this.query().trim()))));
 readonly featured=computed(()=>this.filtered().find(item=>item.featured)??this.filtered()[0]??null);readonly others=computed(()=>this.filtered().filter(item=>item.id!==this.featured()?.id));
 constructor(){forkJoin({initiatives:this.api.list(),categories:this.api.categories()}).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{if(value.initiatives.length){this.initiatives.set(value.initiatives);this.categories.set(value.categories.length?value.categories:[...new Set(value.initiatives.map(item=>item.category))]);}else this.useFallback();this.loading.set(false);},error:error=>{this.error.set(apiErrorMessage(error));this.useFallback();this.loading.set(false);}});}
 changeCategory(value:string){this.category.set(value);this.selected.set(null);}
 openGallery(item:InitiativeDemo){if(item.demo||!item.slug){this.selected.set(item);this.focus();return;}this.detailLoading.set(true);this.error.set('');this.api.detail(item.slug).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{this.selected.set(value);this.detailLoading.set(false);this.focus();},error:error=>{this.detailLoading.set(false);this.error.set(apiErrorMessage(error));}});}
 private useFallback(){const values=INITIATIVES_DEMO.map(item=>({...item,demo:true,years:[item.year]}));this.initiatives.set(values);this.categories.set([...new Set(values.map(item=>item.category))]);this.fallback.set(true);}
 private focus(){setTimeout(()=>{document.getElementById('initiative-gallery')?.scrollIntoView({block:'start'});document.getElementById('initiative-gallery-title')?.focus({preventScroll:true});});}
 private normalize(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
}

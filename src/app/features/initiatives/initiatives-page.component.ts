import { Component, computed, DestroyRef, effect, inject, signal, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { InitiativesHeroComponent } from './components/hero/hero.component';
import { FeaturedInitiativeComponent } from './components/featured/featured.component';
import { InitiativeParticipationComponent } from './components/participation/participation.component';
import { InitiativeCardComponent } from './components/card/initiative-card.component';
import { InitiativeDemo } from './data/initiatives.demo';
import { InitiativesApiService } from './initiatives-api.service';
import { apiErrorMessage } from '../../core/api/api-error';
import {ActivatedRoute, Router} from '@angular/router';

@Component({selector:'plus-initiatives-page',standalone:true,imports:[DatePipe,InitiativesHeroComponent,FeaturedInitiativeComponent,InitiativeParticipationComponent,InitiativeCardComponent],templateUrl:'./initiatives-page.component.html',styleUrl:'./initiatives-page.component.css',encapsulation:ViewEncapsulation.None})
export class InitiativesPageComponent {
 private readonly api=inject(InitiativesApiService);private readonly destroy=inject(DestroyRef);private readonly route=inject(ActivatedRoute);private readonly router=inject(Router);
 readonly initiatives=signal<readonly InitiativeDemo[]>([]);readonly categories=signal<string[]>([]);readonly query=signal('');readonly category=signal('');readonly year=signal('');readonly selected=signal<InitiativeDemo|null>(null);readonly loading=signal(true);readonly detailLoading=signal(false);readonly error=signal('');
 private readonly routedDetailLoaded=signal(false);
 readonly years=computed(()=>[...new Set(this.initiatives().flatMap(item=>item.years?.length?item.years:item.year?[item.year]:[]))].sort((a,b)=>b.localeCompare(a)));
 readonly filtered=computed(()=>this.initiatives().filter(item=>(!this.category()||this.category()===item.category)&&(!this.year()||item.years?.includes(this.year())||item.year===this.year())&&this.normalize(`${item.title} ${item.summary} ${item.category} ${item.period}`).includes(this.normalize(this.query().trim()))));
 readonly featured=computed(()=>this.filtered().find(item=>item.featured)??this.filtered()[0]??null);readonly others=computed(()=>this.filtered().filter(item=>item.id!==this.featured()?.id));
 constructor(){forkJoin({initiatives:this.api.list(),categories:this.api.categories()}).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{this.initiatives.set(value.initiatives);this.categories.set(value.categories.length?value.categories:[...new Set(value.initiatives.map(item=>item.category))]);this.loading.set(false);},error:error=>{this.error.set(apiErrorMessage(error));this.loading.set(false);}});this.route.paramMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params=>{const slug=params.get('slug');if(slug)this.loadDetail(slug);else{this.routedDetailLoaded.set(false);this.selected.set(null);}});effect(()=>{if(this.routedDetailLoaded()&&!this.selected()&&this.route.snapshot.paramMap.has('slug'))this.router.navigate(['/iniciativas']);});}
 changeCategory(value:string){this.category.set(value);this.selected.set(null);}
 openGallery(item:InitiativeDemo){if(item.slug)this.router.navigate(['/iniciativas',item.slug]);}
 closeDetail(){if(this.route.snapshot.paramMap.has('slug'))this.router.navigate(['/iniciativas']);else this.selected.set(null);}
 private loadDetail(slug:string){this.detailLoading.set(true);this.error.set('');this.api.detail(slug).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{this.selected.set(value);this.routedDetailLoaded.set(true);this.detailLoading.set(false);this.focus();},error:error=>{this.detailLoading.set(false);this.error.set(apiErrorMessage(error));}});}
 private focus(){setTimeout(()=>{document.getElementById('initiative-gallery')?.scrollIntoView({block:'start'});document.getElementById('initiative-gallery-title')?.focus({preventScroll:true});});}
 private normalize(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
}

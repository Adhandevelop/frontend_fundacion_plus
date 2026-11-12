import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminInitiative, AdminInitiativesApiService } from '../initiatives/services/admin-initiatives-api.service';
import { AdminProposal, AdminProposalsApiService, PROPOSAL_LABELS, PROPOSAL_STATES } from './services/admin-proposals-api.service';

@Component({selector:'plus-proposals-list',standalone:true,imports:[RouterLink,DatePipe],templateUrl:'./proposals-list.component.html'})
export class ProposalsListComponent {
 private readonly api=inject(AdminProposalsApiService);private readonly initiativesApi=inject(AdminInitiativesApiService);private readonly destroy=inject(DestroyRef);readonly states=PROPOSAL_STATES;readonly labels=PROPOSAL_LABELS;
 readonly rows=signal<AdminProposal[]>([]);readonly initiatives=signal<AdminInitiative[]>([]);readonly count=signal(0);readonly page=signal(1);readonly pageSize=10;readonly pages=computed(()=>Math.max(1,Math.ceil(this.count()/this.pageSize)));readonly filters=signal({query:'',state:'',initiativeId:inject(ActivatedRoute).snapshot.queryParamMap.get('programa')??''});readonly loading=signal(false);readonly error=signal('');
 constructor(){this.load();this.initiativesApi.list('',1,100).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>this.initiatives.set(value.results),error:()=>{}});}
 load(){this.loading.set(true);this.error.set('');this.api.list(this.filters(),this.page(),this.pageSize).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>{this.rows.set(value.results);this.count.set(value.count);},error:error=>this.error.set(apiErrorMessage(error))});}
 change(key:'query'|'state'|'initiativeId',value:string){this.filters.update(current=>({...current,[key]:value}));this.page.set(1);this.load();}
 reset(){this.filters.set({query:'',state:'',initiativeId:''});this.page.set(1);this.load();}
 navigate(delta:number){this.page.update(value=>Math.max(1,Math.min(this.pages(),value+delta)));this.load();}
 initiativeName(id:string|null,fallback=''){return fallback||this.initiatives().find(item=>item.id===id)?.title||'Sin iniciativa específica';}
}

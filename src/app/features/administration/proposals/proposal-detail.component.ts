import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminInitiative, AdminInitiativesApiService } from '../initiatives/services/admin-initiatives-api.service';
import { AdminProposal, AdminProposalsApiService, PROPOSAL_LABELS, ProposalState } from './services/admin-proposals-api.service';

@Component({selector:'plus-proposal-detail',standalone:true,imports:[RouterLink,DatePipe,ReactiveFormsModule],templateUrl:'./proposal-detail.component.html'})
export class ProposalDetailComponent {
 private readonly api=inject(AdminProposalsApiService);private readonly initiativesApi=inject(AdminInitiativesApiService);private readonly destroy=inject(DestroyRef);private readonly builder=inject(FormBuilder).nonNullable;readonly id=inject(ActivatedRoute).snapshot.paramMap.get('id')??'';readonly labels=PROPOSAL_LABELS;
 readonly row=signal<AdminProposal|null>(null);readonly initiatives=signal<AdminInitiative[]>([]);readonly loading=signal(true);readonly saving=signal(false);readonly pending=signal<ProposalState|null>(null);readonly status=signal('');readonly form=this.builder.group({response:['',Validators.maxLength(2000)],resultInitiativeId:['']});
 get proposal(){return this.row()!;}
 constructor(){this.load();this.initiativesApi.list('',1,100).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>this.initiatives.set(value.results),error:()=>{}});}
 load(){this.loading.set(true);this.api.detail(this.id).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>this.row.set(value),error:error=>this.status.set(apiErrorMessage(error))});}
 begin(target:ProposalState){this.pending.set(target);this.form.reset({response:'',resultInitiativeId:''});this.status.set('');}
 confirm(){const target=this.pending();if(!target||this.saving())return;const value=this.form.getRawValue();this.form.markAllAsTouched();if(this.form.invalid||(target!=='en_revision'&&value.response.trim().length<10)){this.status.set('Escribe una respuesta de entre 10 y 2000 caracteres para aprobar o rechazar.');return;}this.saving.set(true);this.api.review(this.id,target,value.response,value.resultInitiativeId||null).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.saving.set(false))).subscribe({next:row=>{this.row.set(row);this.pending.set(null);this.status.set('Revisión guardada en PLUS.');},error:error=>this.status.set(apiErrorMessage(error))});}
 initiativeName(id:string|null,fallback=''){return fallback||this.initiatives().find(item=>item.id===id)?.title||'Sin iniciativa específica';}
}

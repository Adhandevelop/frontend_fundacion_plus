import {DatePipe} from '@angular/common';
import { Component, computed, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {catchError, forkJoin, Observable, of, switchMap} from 'rxjs';
import {apiErrorMessage} from '../../core/api/api-error';
import {PublicCaseApiService, PublicCaseComment, PublicCaseDetail, PublicCaseEvidence, PublicCaseStatusHistory, PublicCaseUpdate} from './public-case-api.service';
import {AuthService} from '../../core/auth/auth.service';
import {CitizenCasesApiService} from '../citizen/services/citizen-cases-api.service';

@Component({
 selector:'plus-public-case', standalone:true,
 imports:[RouterLink,DatePipe,ReactiveFormsModule],
 templateUrl:'./public-case.component.html', styleUrl:'./public-case.component.css',
 encapsulation:ViewEncapsulation.None,
})
export class PublicCaseComponent {
 private readonly route=inject(ActivatedRoute);
 private readonly api=inject(PublicCaseApiService);
 private readonly destroy=inject(DestroyRef);
 readonly auth=inject(AuthService);
 readonly context=(this.route.snapshot.data['caseContext']??'public') as 'public'|'citizen';
 readonly mapRoute=this.context==='citizen'?'/ciudadano/mapa':'/mapa';
 private readonly citizenCases=inject(CitizenCasesApiService);
 private readonly builder=inject(FormBuilder).nonNullable;
 readonly shareMessage=signal('');
 readonly caseData=signal<PublicCaseDetail|null>(null);
 readonly loading=signal(true);
 readonly error=signal('');
 readonly following=signal(false);
 readonly followBusy=signal(false);
 readonly followLoading=signal(false);
 readonly followMessage=signal('');
 readonly updates=signal<PublicCaseUpdate[]>([]);
 readonly statusHistory=signal<PublicCaseStatusHistory[]>([]);
 readonly evidence=signal<PublicCaseEvidence[]>([]);
 readonly comments=signal<PublicCaseComment[]>([]);
 readonly relatedLoading=signal(false);
 readonly relatedMessage=signal('');
 readonly commentBusy=signal(false);
 readonly commentMessage=signal('');
 readonly commentForm=this.builder.group({contenido:['',[Validators.required,Validators.minLength(20),Validators.maxLength(2000)]]});
 readonly canFollow=this.auth.canCitizen;
 readonly loginReturn=computed(()=>`/casos/${this.caseData()?.codigo??''}`);
 constructor(){this.route.paramMap.pipe(switchMap(params=>{this.loading.set(true);this.error.set('');this.caseData.set(null);this.following.set(false);return this.api.detail(params.get('radicado')??'');}),takeUntilDestroyed(this.destroy)).subscribe({next:value=>{this.caseData.set(value);this.loading.set(false);this.loadRelated(value.id_caso);this.loadFollowing(value.id_caso);},error:error=>{this.error.set(apiErrorMessage(error));this.loading.set(false);}});}
 private loadRelated(id:string){this.relatedLoading.set(true);this.relatedMessage.set('');forkJoin({history:this.api.history(id).pipe(catchError(()=>of(null))),evidence:this.api.evidence(id).pipe(catchError(()=>of([]))),comments:this.api.comments(id).pipe(catchError(()=>of([])))}).pipe(takeUntilDestroyed(this.destroy)).subscribe(value=>{if(this.caseData()?.id_caso!==id)return;this.updates.set(value.history?.seguimientos??[]);this.statusHistory.set(value.history?.historial_estados??[]);this.evidence.set(value.evidence);this.comments.set(value.comments);this.relatedLoading.set(false);if(!value.history)this.relatedMessage.set('Una parte del historial público no está disponible en este momento.');});}
 private loadFollowing(id:string){if(!this.auth.hasSession())return;this.followLoading.set(true);this.auth.ensureUser().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:()=>{if(!this.canFollow()){this.followLoading.set(false);return;}this.citizenCases.following(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{if(this.caseData()?.id_caso===id)this.following.set(value.following);this.followLoading.set(false);},error:error=>{this.followLoading.set(false);this.followMessage.set(apiErrorMessage(error));}});},error:()=>{this.followLoading.set(false);}});}
 toggleFollow(){const id=this.caseData()?.id_caso;if(!id||this.followBusy())return;this.followBusy.set(true);this.followMessage.set('');const request:Observable<unknown>=this.following()?this.citizenCases.unfollow(id):this.citizenCases.follow(id);request.pipe(takeUntilDestroyed(this.destroy)).subscribe({next:()=>{this.following.update(value=>!value);this.followBusy.set(false);this.followMessage.set(this.following()?'Ahora sigues este caso.':'Dejaste de seguir este caso.');},error:error=>{this.followBusy.set(false);this.followMessage.set(apiErrorMessage(error));}});}
 submitComment(){const id=this.caseData()?.id_caso;if(!id||this.commentBusy())return;if(this.commentForm.invalid){this.commentForm.markAllAsTouched();this.commentMessage.set('Escribe un comentario de 20 a 2000 caracteres.');return;}this.commentBusy.set(true);this.commentMessage.set('');this.api.comment(id,this.commentForm.controls.contenido.value.trim()).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:()=>{this.commentBusy.set(false);this.commentForm.reset();this.commentMessage.set('Comentario enviado. Se publicará cuando termine la moderación.');},error:error=>{this.commentBusy.set(false);this.commentMessage.set(apiErrorMessage(error));}});}
 async copyLink() {
  try { await navigator.clipboard.writeText(location.href); this.shareMessage.set('Enlace copiado.'); }
  catch { this.shareMessage.set('Puedes copiar el enlace desde la barra de direcciones del navegador.'); }
 }
}

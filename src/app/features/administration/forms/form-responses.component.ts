import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsDemoService } from '../../../shared/dynamic-forms/forms-demo.service';
import { AnswerDetailComponent } from '../../../shared/dynamic-forms/answer-detail.component';
@Component({selector:'plus-form-responses',standalone:true,imports:[DatePipe,RouterLink,AnswerDetailComponent],template:`
<div class="p-4 sm:p-6 max-w-6xl mx-auto space-y-6"><a routerLink="/admin/formularios" class="underline text-body-sm">Volver a formularios</a><header><p class="text-label-sm uppercase">Respuestas · Demostración</p><h1 class="text-headline-md mt-2">{{form()?.title || 'Formulario no disponible'}}</h1><p class="text-body-sm mt-2">Contenido ficticio o introducido en esta pestaña. No son respuestas institucionales.</p></header>
@if(form()){@if(responseId()){@if(selected();as response){<a [routerLink]="['/admin/formularios',formId(),'respuestas']" class="admin-button">Volver a respuestas</a><plus-answer-detail [submission]="response"/>}@else{<p role="alert">Respuesta no disponible para este formulario.</p>}}@else{<section class="admin-panel border rounded-xl overflow-hidden"><div class="overflow-x-auto"><table class="w-full min-w-[650px] text-left text-body-sm"><caption class="p-5 text-left">{{responses().length}} respuestas de ejemplo</caption><thead class="bg-slate-400/10"><tr><th scope="col" class="p-4">Persona</th><th scope="col" class="p-4">Fecha · Bogotá</th><th scope="col" class="p-4">Vinculación simulada</th><th scope="col" class="p-4">Detalle</th></tr></thead><tbody>@for(row of responses();track row.id){<tr class="border-t border-slate-400/30"><td class="p-4">{{row.identity.names}} {{row.identity.surnames}}</td><td class="p-4">{{row.date | date:'dd/MM/yyyy HH:mm':'-0500'}}</td><td class="p-4">{{row.activation==='pendiente_demo'?'Pendiente de activación':'Sesión ciudadana'}}</td><td class="p-4"><a [routerLink]="['/admin/formularios',formId(),'respuestas',row.id]" class="underline">Consultar</a></td></tr>}@empty{<tr><td colspan="4" class="p-10 text-center">Este formulario todavía no tiene respuestas de demostración.</td></tr>}</tbody></table></div></section>}}
</div>`})
export class FormResponsesComponent {
 private readonly store=inject(FormsDemoService);readonly formId=signal('');readonly responseId=signal('');
 readonly form=computed(()=>this.store.adminForm(this.formId()));readonly responses=computed(()=>this.store.adminResponses(this.formId()));readonly selected=computed(()=>this.responses().find(row=>row.id===this.responseId())??null);
 constructor(){inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(params=>{this.formId.set(params.get('id')??'');this.responseId.set(params.get('responseId')??'');});}
}

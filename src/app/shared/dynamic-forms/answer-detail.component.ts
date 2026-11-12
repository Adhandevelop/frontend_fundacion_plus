import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminSubmissionDetail, CitizenSubmissionDetail, SubmissionAnswer } from './forms-api.service';
@Component({selector:'plus-answer-detail',standalone:true,imports:[DatePipe],host:{class:'block min-w-0'},template:`
<article class="plus-form-panel space-y-5"><header><p class="text-label-sm">Enviado {{detail.submittedAt | date:'dd/MM/yyyy HH:mm':'-0500'}} Bogotá · versión {{detail.version}}</p><h2 class="text-title-md mt-2">{{title()}}</h2>@if(isAdmin()){<p class="text-body-sm mt-2">Estado de vinculación: {{admin().linkState}}</p>}</header>
@if(isAdmin()){<section class="space-y-2 text-body-sm"><h3 class="text-title-sm">Datos declarados</h3><p>{{admin().identity.names}} {{admin().identity.surnames}}</p><p class="break-all">{{admin().identity.email}} · {{admin().identity.phone||'Sin teléfono'}}</p>@if(admin().identity.document){<p>{{admin().identity.documentType}} {{admin().identity.document}}</p>}<p>IP: {{admin().ip||'No registrada'}}</p>@if(admin().legalAcceptance){<p>Política {{admin().legalAcceptance?.version}} aceptada {{admin().legalAcceptance?.acceptedAt | date:'dd/MM/yyyy HH:mm':'-0500'}}</p>}</section>}
<dl class="space-y-4">@for(answer of detail.answers;track answer.id){<div class="border-t border-slate-400/30 pt-4"><dt class="font-semibold text-body-sm">{{answer.label}}</dt><dd class="mt-2 text-body-sm whitespace-pre-wrap break-words">{{display(answer)}}</dd></div>}@empty{<p>No hay respuestas registradas.</p>}</dl><p class="text-label-sm">Las preguntas y respuestas corresponden a la versión histórica indicada.</p></article>`})
export class AnswerDetailComponent {
 @Input({required:true}) detail!:AdminSubmissionDetail|CitizenSubmissionDetail;
 isAdmin():this is {detail:AdminSubmissionDetail}{return 'identity'in this.detail;}
 admin(){return this.detail as AdminSubmissionDetail;}
 title(){return 'form' in this.detail?this.detail.form.title:this.detail.formTitle;}
 display(answer:SubmissionAnswer){const value=answer.value;if(Array.isArray(value))return value.join(', ')||'Sin respuesta';if(typeof value==='boolean')return value?'Sí':'No';return value===null||value===''?'Sin respuesta':String(value);}
}

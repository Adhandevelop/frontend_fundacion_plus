import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsDemoService } from '../../../shared/dynamic-forms/forms-demo.service';
import { AnswerDetailComponent } from '../../../shared/dynamic-forms/answer-detail.component';
@Component({selector:'plus-citizen-forms',standalone:true,imports:[RouterLink,DatePipe,AnswerDetailComponent],template:`
<div class="space-y-6"><header><h1 class="text-headline-lg">Mis formularios</h1><p class="text-body-sm mt-3">Demostración con respuestas ficticias y envíos temporales de tu sesión. No acredita trámites reales.</p></header>
@if(id()){@if(selected();as response){<a routerLink="/ciudadano/formularios" class="cit-button inline-flex">Volver a Mis formularios</a><plus-answer-detail [submission]="response"/>}@else{<p role="alert" class="cit-panel border rounded-xl p-6">La respuesta no está disponible en tu demostración.</p>}}
@else{<div class="space-y-4">@for(response of responses();track response.id){<article class="cit-panel border rounded-xl p-5 space-y-3"><h2 class="text-title-md">{{response.form.title}}</h2><p class="text-body-sm">{{response.date | date:'dd/MM/yyyy HH:mm':'-0500'}} Bogotá · Envío de ejemplo</p><a [routerLink]="['/ciudadano/formularios',response.id]" class="underline text-body-sm">Consultar mis respuestas</a></article>}@empty{<p class="cit-panel border rounded-xl p-6">No hay envíos de ejemplo disponibles.</p>}</div><a routerLink="/formularios/solicitud-comunitaria-demo" class="cit-button inline-flex">Explorar formulario público de ejemplo</a>}
</div>`})
export class CitizenFormsComponent {
 private readonly store=inject(FormsDemoService);readonly id=signal('');readonly responses=computed(()=>this.store.citizenResponses());readonly selected=computed(()=>this.responses().find(row=>row.id===this.id())??null);
 constructor(){inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(params=>this.id.set(params.get('id')??''));}
}

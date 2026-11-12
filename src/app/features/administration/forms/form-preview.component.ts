import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { FormsApiService } from '../../../shared/dynamic-forms/forms-api.service';
import { DynamicForm } from '../../../shared/dynamic-forms/forms.models';
import { FormRunnerComponent } from '../../../shared/dynamic-forms/form-runner.component';
@Component({selector:'plus-form-preview',standalone:true,imports:[RouterLink,FormRunnerComponent],template:`
<div class="p-4 sm:p-6 max-w-4xl mx-auto space-y-6"><a routerLink="/admin/formularios" class="underline text-body-sm">Volver a formularios</a><p class="border border-amber-500 bg-amber-400/10 p-4 rounded-xl text-body-sm">Vista previa administrativa. Completarla no guarda respuestas ni crea cuentas.</p>@if(loading()){<p role="status">Cargando vista previa…</p>}@else{@if(form();as schema){<header><h1 class="text-headline-md">{{schema.title}}</h1><p class="text-body-sm mt-3 whitespace-pre-wrap">{{schema.description}}</p></header>@if(schema.questions.length){<section class="plus-form-panel"><plus-form-runner [schema]="schema" [preview]="true"/></section>}@else{<p role="status" class="admin-panel border rounded-xl p-5">Este formulario todavía no tiene preguntas en borrador ni una versión publicada.</p>}}@else{<p role="alert" class="plus-form-errors">{{error()}}</p>}}</div>`})
export class FormPreviewComponent {
 private readonly api=inject(FormsApiService);private readonly destroy=inject(DestroyRef);readonly form=signal<DynamicForm|null>(null);readonly loading=signal(true);readonly error=signal('');
 constructor(){inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(this.destroy),switchMap(params=>this.api.adminDetail(params.get('id')??'')),switchMap(value=>value.form.questions.length?of(value.form):value.form.publishedVersion>0?this.api.adminVersion(value.form.id,value.form.publishedVersion,value.form.slug):of(value.form))).subscribe({next:value=>{this.form.set(value);this.loading.set(false);},error:error=>{this.error.set(apiErrorMessage(error));this.loading.set(false);}});}
}

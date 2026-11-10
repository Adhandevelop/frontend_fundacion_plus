import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsDemoService } from '../../../shared/dynamic-forms/forms-demo.service';
import { DemoForm } from '../../../shared/dynamic-forms/forms-demo.models';
import { FormRunnerComponent } from '../../../shared/dynamic-forms/form-runner.component';
@Component({selector:'plus-form-preview',standalone:true,imports:[RouterLink,FormRunnerComponent],template:`
<div class="p-4 sm:p-6 max-w-4xl mx-auto space-y-6"><a routerLink="/admin/formularios" class="underline text-body-sm">Volver a formularios</a><p class="border border-amber-500 bg-amber-400/10 p-4 rounded-xl text-body-sm">Vista previa administrativa. Completarla no guarda respuestas, crea cuentas ni envía correos.</p>@if(form();as schema){<header><h1 class="text-headline-md">{{schema.title}}</h1><p class="text-body-sm mt-3 whitespace-pre-wrap">{{schema.description}}</p></header><section class="plus-form-panel"><plus-form-runner [schema]="schema" [preview]="true"/></section>}@else{<h1 class="text-headline-md">Formulario no disponible en la demostración</h1>}</div>`})
export class FormPreviewComponent {
 private readonly store=inject(FormsDemoService);readonly form=signal<DemoForm|null>(null);
 constructor(){inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(params=>this.form.set(this.store.adminForm(params.get('id')??'')));}
}

import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsDemoService } from '../../shared/dynamic-forms/forms-demo.service';
import { DemoSubmission, DemoSubmissionInput } from '../../shared/dynamic-forms/forms-demo.models';
import { FormRunnerComponent } from '../../shared/dynamic-forms/form-runner.component';
import { AuthService } from '../../core/auth/auth.service';
import { focusFormTarget } from '../../shared/forms/form-error-summary.component';
import { finalize } from 'rxjs';
@Component({selector:'plus-public-form',standalone:true,imports:[RouterLink,FormRunnerComponent],template:`
<div class="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6"><p class="border border-amber-500 bg-amber-400/10 rounded-xl p-4 text-body-sm">Formulario de demostración. Usa datos ficticios: no se crean cuentas ni se envían correos. Los datos temporales se pierden al recargar.</p>
@if(schema();as form){@if(receipt();as result){<section id="demo-form-receipt" tabindex="-1" class="plus-form-panel space-y-4"><h1 class="text-headline-md">Envío de ejemplo completado</h1><p class="text-body-sm">{{form.title}}</p><p class="text-body-sm">Referencia local: <span class="break-all">{{result.id}}</span></p><p class="text-body-sm">{{result.owner?'La respuesta se vinculó temporalmente a tu sesión ciudadana de esta demostración.':'La activación de una cuenta queda representada como pendiente. No se ha creado una cuenta ni enviado un enlace.'}}</p><p class="text-body-sm">En el servicio real, una persona sin cuenta recibirá un enlace de un solo uso para activar su acceso y establecer su contraseña. No se enviarán contraseñas por correo.</p>@if(auth.canCitizen()){<a routerLink="/ciudadano/formularios" class="plus-form-primary">Consultar Mis formularios de ejemplo</a>}@else{<a routerLink="/login" class="underline text-body-sm">Acceder con una cuenta existente</a>}</section>}
@else if(form.state==='cerrado'){<section class="plus-form-panel space-y-3"><h1 class="text-headline-md">Formulario cerrado</h1><p>{{form.title}}</p><p class="text-body-sm">La demostración ya no admite respuestas para este formulario.</p></section>}
@else{<header><h1 class="text-headline-lg">{{form.title}}</h1><p class="mt-3 text-body-sm whitespace-pre-wrap">{{form.description}}</p></header>@if(checkingSession()){<p role="status">Comprobando la sesión existente…</p>}@else{<section class="plus-form-panel"><plus-form-runner [schema]="form" (submitted)="send($event)"/></section>}}}
@else{<section class="plus-form-panel space-y-3"><h1 class="text-headline-md">Formulario no disponible</h1><p class="text-body-sm">El enlace no existe, corresponde a un borrador o sus datos temporales se perdieron al recargar.</p><a routerLink="/" class="underline">Volver al inicio</a></section>}<p role="status">{{error()}}</p></div>`})
export class PublicFormComponent {
 private readonly store=inject(FormsDemoService);readonly auth=inject(AuthService);readonly slug=signal('');readonly receipt=signal<DemoSubmission|null>(null);readonly error=signal('');
 readonly schema=computed(()=>this.store.publicForm(this.slug()));
 readonly checkingSession=signal(true);
 constructor(){const destroy=inject(DestroyRef);this.auth.ensureUser().pipe(takeUntilDestroyed(destroy),finalize(()=>this.checkingSession.set(false))).subscribe({error:()=>this.error.set('No se pudo verificar la sesión existente. La demostración no vinculará el envío por el correo escrito.')});inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(destroy)).subscribe(params=>{this.slug.set(params.get('slug')??'');this.receipt.set(null);this.error.set('');});}
 send(input:DemoSubmissionInput){if(this.receipt())return;const result=this.store.submit(this.slug(),input);if(!result){this.error.set('No se pudo completar la simulación. Revisa si el formulario está cerrado.');return;}this.receipt.set(result);focusFormTarget('demo-form-receipt');}
}

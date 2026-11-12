import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable, of } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminInitiative, AdminInitiativesApiService, INITIATIVE_STATE_LABELS, InitiativeState } from './services/admin-initiatives-api.service';

@Component({selector:'plus-program-editor',standalone:true,imports:[RouterLink,ReactiveFormsModule],templateUrl:'./program-editor.component.html'})
export class ProgramEditorComponent {
 private readonly api=inject(AdminInitiativesApiService);private readonly route=inject(ActivatedRoute);private readonly router=inject(Router);private readonly destroy=inject(DestroyRef);private readonly builder=inject(FormBuilder).nonNullable;
 readonly id=signal(this.route.snapshot.paramMap.get('id'));readonly states=Object.keys(INITIATIVE_STATE_LABELS) as InitiativeState[];readonly labels=INITIATIVE_STATE_LABELS;readonly loading=signal(true);readonly saving=signal(false);readonly missing=signal(false);readonly status=signal('');readonly slug=signal('');
 readonly form=this.builder.group({title:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(200)]],subtitle:['',Validators.maxLength(250)],category:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(80)]],summary:[''],description:[''],state:this.builder.control<InitiativeState>('planificada',Validators.required)});
 constructor(){const id=this.id();const request:Observable<AdminInitiative|null>=id?this.api.detail(id):of(null);request.pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:row=>{if(row){this.slug.set(row.slug);this.form.setValue({title:row.title,subtitle:row.subtitle,category:row.category,summary:row.summary,description:row.description,state:row.state});}},error:error=>{this.missing.set(!!id);this.status.set(apiErrorMessage(error));}});}
 save(){this.form.markAllAsTouched();if(this.form.invalid||this.saving()||this.missing())return;this.saving.set(true);this.status.set('');const value=this.form.getRawValue(),request=this.id()?this.api.update(this.id()!,value):this.api.create(value);request.pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.saving.set(false))).subscribe({next:row=>void this.router.navigate(['/admin/iniciativas',row.id],{queryParams:{resultado:'guardado'}}),error:error=>this.status.set(apiErrorMessage(error))});}
}

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminInitiative, AdminInitiativesApiService, INITIATIVE_STATE_LABELS, InitiativeState } from './services/admin-initiatives-api.service';

@Component({selector:'plus-edition-editor',standalone:true,imports:[RouterLink,ReactiveFormsModule],templateUrl:'./edition-editor.component.html'})
export class EditionEditorComponent {
 private readonly api=inject(AdminInitiativesApiService);private readonly destroy=inject(DestroyRef);private readonly route=inject(ActivatedRoute);private readonly router=inject(Router);private readonly builder=inject(FormBuilder).nonNullable;
 readonly programId=this.route.snapshot.paramMap.get('programId')??'';readonly id=this.route.snapshot.paramMap.get('editionId');readonly program=signal<AdminInitiative|null>(null);readonly loading=signal(true);readonly saving=signal(false);readonly missing=signal(false);readonly status=signal('');readonly states=Object.keys(INITIATIVE_STATE_LABELS) as InitiativeState[];readonly labels=INITIATIVE_STATE_LABELS;
 readonly form=this.builder.group({year:[new Date().getFullYear(),[Validators.required,Validators.min(2000),Validators.max(2200),Validators.pattern(/^\d+$/)]],name:['',Validators.maxLength(150)],season:['',Validators.maxLength(100)],description:[''],start:[''],end:[''],state:this.builder.control<InitiativeState>('planificada',Validators.required)});
 constructor(){this.api.detail(this.programId).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:program=>{this.program.set(program);if(this.id){const row=program.editions.find(item=>item.id===this.id);if(!row){this.missing.set(true);return;}this.form.setValue({year:row.year,name:row.name,season:row.season,description:row.description,start:row.start,end:row.end,state:row.state});}},error:error=>{this.missing.set(true);this.status.set(apiErrorMessage(error));}});}
 save(){this.form.markAllAsTouched();const value=this.form.getRawValue();if(this.form.invalid||this.saving()||this.missing())return;if(value.start&&value.end&&value.end<value.start){this.status.set('La fecha final no puede ser anterior a la fecha inicial.');return;}this.saving.set(true);this.status.set('');const request=this.id?this.api.updateEdition(this.id,this.programId,value):this.api.createEdition(this.programId,value);request.pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.saving.set(false))).subscribe({next:()=>void this.router.navigate(['/admin/iniciativas',this.programId],{queryParams:{resultado:'edicion-guardada'}}),error:error=>this.status.set(apiErrorMessage(error))});}
}

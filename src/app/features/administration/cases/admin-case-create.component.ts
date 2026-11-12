import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { AccountApiService, Community, Department, Municipality } from '../../../core/api/account-api.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { CitizenCasesApiService } from '../../citizen/services/citizen-cases-api.service';
import { CaseState, CaseType } from '../../citizen/services/citizen-cases.models';
import { AdminCasesApiService } from './admin-cases-api.service';

@Component({selector:'plus-admin-case-create',standalone:true,imports:[ReactiveFormsModule,RouterLink],templateUrl:'./admin-case-create.component.html'})
export class AdminCaseCreateComponent {
  private readonly api=inject(AdminCasesApiService);private readonly catalogs=inject(CitizenCasesApiService);private readonly account=inject(AccountApiService);private readonly router=inject(Router);private readonly destroy=inject(DestroyRef);
  readonly types=signal<CaseType[]>([]);readonly states=signal<CaseState[]>([]);readonly departments=signal<Department[]>([]);readonly municipalities=signal<Municipality[]>([]);readonly communities=signal<Community[]>([]);
  readonly loading=signal(true);readonly saving=signal(false);readonly error=signal('');
  readonly form=inject(FormBuilder).nonNullable.group({title:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(200)]],description:['',[Validators.required,Validators.pattern(/\S/)]],type:['',Validators.required],state:['',Validators.required],priority:'media',department:['',Validators.required],municipality:['',Validators.required],community:['',Validators.required],address:['',Validators.maxLength(500)],families:[0,[Validators.min(0)]],months:[0,[Validators.min(0)]],publication:'pendiente'});
  constructor(){forkJoin({types:this.catalogs.types(),states:this.catalogs.states(),departments:this.account.departments()}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>{this.types.set(value.types.filter(item=>item.activo));this.states.set(value.states);this.departments.set(value.departments);const pending=value.states.find(item=>item.nombre==='pendiente');if(pending)this.form.controls.state.setValue(pending.id_estado);},error:error=>this.error.set(apiErrorMessage(error))});}
  departmentChanged(){this.form.patchValue({municipality:'',community:''});this.municipalities.set([]);this.communities.set([]);const id=this.form.controls.department.value;if(!id)return;this.account.municipalities(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>this.municipalities.set(value),error:error=>this.error.set(apiErrorMessage(error))});}
  municipalityChanged(){this.form.controls.community.setValue('');this.communities.set([]);const id=this.form.controls.municipality.value;if(!id)return;this.account.communities(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>this.communities.set(value),error:error=>this.error.set(apiErrorMessage(error))});}
  save(){this.form.markAllAsTouched();if(this.form.invalid||this.saving())return;const value=this.form.getRawValue();this.saving.set(true);this.error.set('');this.api.create({titulo:value.title.trim(),descripcion:value.description.trim(),tipo_caso:value.type,comunidad:value.community,estado:value.state,prioridad:value.priority,estado_publicacion:value.publication,direccion_referencia:value.address.trim()||null,familias_afectadas:value.families,meses_afectacion:value.months}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.saving.set(false))).subscribe({next:row=>this.router.navigate(['/admin/casos',row.id_caso]),error:error=>this.error.set(apiErrorMessage(error))});}
}

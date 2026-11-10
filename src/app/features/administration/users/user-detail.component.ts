import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminRole, AdminUser, AdminUsersApiService, ROLE_CODES, USER_STATES, UserAction } from './admin-users-api.service';

interface UserReview {id:string; name:string; previous:string; action:UserAction; target:string}
@Component({selector:'plus-admin-user-detail',standalone:true,imports:[RouterLink,DatePipe,ReactiveFormsModule],templateUrl:'./user-detail.component.html'})
export class UserDetailComponent {
  readonly api=inject(AdminUsersApiService);
  private readonly destroy=inject(DestroyRef);
  private request?:Subscription;private revision=0;
  readonly id=signal('');readonly user=signal<AdminUser|null>(null);readonly roles=signal<AdminRole[]>([]);
  readonly canEdit=computed(()=>!!this.user() && this.api.canEdit(this.user()!.id_usuario));
  readonly assignable=computed(()=>this.roles().filter(role=>role.assignable && ROLE_CODES.some(code=>code===role.nombre)));
  readonly states=USER_STATES;
  readonly loading=signal(true);readonly saving=signal(false);readonly uncertain=signal(false);readonly error=signal('');readonly status=signal('');
  readonly review=signal<UserReview|null>(null);
  readonly form=inject(FormBuilder).nonNullable.group({role:'',state:'',reason:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(2000)]]});
  constructor(){inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params=>{
    this.id.set(params.get('id')??'');this.user.set(null);this.saving.set(false);this.uncertain.set(false);this.status.set('');this.load();
  });}
  load(){
    if(this.saving())return;
    const revision=++this.revision;this.request?.unsubscribe();this.review.set(null);this.loading.set(true);this.error.set('');
    this.request=forkJoin({user:this.api.get(this.id()),roles:this.api.roles()}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.loading.set(false);})).subscribe({
      next:value=>{if(revision===this.revision){this.user.set(value.user);this.roles.set(value.roles);this.uncertain.set(false);this.form.reset({role:value.user.id_rol,state:value.user.estado,reason:''});}},
      error:error=>{if(revision===this.revision)this.error.set(apiErrorMessage(error));},
    });
  }
  prepare(kind:'role'|'status'){
    const user=this.user();
    if(!user || !this.canEdit() || this.loading() || this.error() || this.saving() || this.uncertain() || this.review())return;
    this.form.controls.reason.markAsTouched();const value=this.form.getRawValue();
    if(this.form.controls.reason.invalid){this.status.set('Escribe un motivo con contenido, de hasta 2000 caracteres.');return;}
    let action:UserAction,target:string,previous:string;
    if(kind==='role'){
      const role=this.assignable().find(item=>item.id_rol===value.role);
      if(!role || role.id_rol===user.id_rol){this.status.set('Selecciona un rol asignable diferente del actual.');return;}
      action={kind:'role',id_rol:role.id_rol,motivo:value.reason.trim()};target=role.nombre;previous=user.primary_role;
    }else{
      const state=this.states.find(item=>item===value.state);
      if(!state || state===user.estado){this.status.set('Selecciona un estado diferente del actual.');return;}
      action={kind:'status',estado:state,motivo:value.reason.trim()};target=state;previous=user.estado;
    }
    this.status.set('');this.review.set({id:user.id_usuario,name:`${user.nombres} ${user.apellidos}`,action,target,previous});
    if(typeof document!=='undefined')setTimeout(()=>document.getElementById('user-action-review')?.focus(),0);
  }
  confirm(){
    const decision=this.review();
    if(!decision || !this.canEdit() || this.user()?.id_usuario!==decision.id || this.saving() || this.uncertain() || this.loading() || this.error())return;
    const revision=this.revision;this.saving.set(true);this.status.set('');
    this.api.action(decision.id,{...decision.action}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.saving.set(false);})).subscribe({
      next:()=>{if(revision===this.revision){this.saving.set(false);this.status.set('Cambio guardado.');this.load();}},
      error:error=>{if(revision!==this.revision)return;this.review.set(null);const uncertain=error instanceof HttpErrorResponse && (error.status===0 || error.status>=500);this.uncertain.set(uncertain);this.status.set(uncertain?'No se pudo confirmar el resultado. Actualiza y revisa el estado y el rol antes de otra acción.':apiErrorMessage(error));},
    });
  }
}

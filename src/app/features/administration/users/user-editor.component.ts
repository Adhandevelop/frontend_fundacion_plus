import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, forkJoin, of, Subscription } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { FormErrorSummaryComponent, FormIssue, focusFormTarget } from '../../../shared/forms/form-error-summary.component';
import { AdminRole, AdminUser, AdminUsersApiService, ROLE_CODES, UserContact, UserCreate } from './admin-users-api.service';

interface UserEditorReview {id:string|null; contact:UserContact; roleId:string; roleName:string}
@Component({selector:'plus-admin-user-editor',standalone:true,imports:[RouterLink,ReactiveFormsModule,FormErrorSummaryComponent],templateUrl:'./user-editor.component.html'})
export class UserEditorComponent {
  readonly api=inject(AdminUsersApiService);
  private readonly destroy=inject(DestroyRef);private readonly router=inject(Router);
  private request?:Subscription;private revision=0;private reviewedPassword='';
  readonly id=signal<string|null>(null);readonly user=signal<AdminUser|null>(null);readonly roles=signal<AdminRole[]>([]);
  readonly assignable=computed(()=>this.roles().filter(role=>role.assignable && ROLE_CODES.some(code=>code===role.nombre)));
  readonly allowed=computed(()=>this.api.canManage() && (!this.id() || this.api.canEdit(this.id()!)));
  readonly loading=signal(true);readonly saving=signal(false);readonly uncertain=signal(false);readonly completed=signal(false);
  readonly error=signal('');readonly message=signal('');readonly review=signal<UserEditorReview|null>(null);
  readonly submitted=signal(false);
  readonly form=inject(FormBuilder).nonNullable.group({
    nombres:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(100)]],
    apellidos:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(100)]],
    correo:['',[Validators.required,Validators.email,Validators.maxLength(150)]],telefono:['',Validators.maxLength(20)],
    id_rol:'',password:'',passwordConfirm:'',
  });
  constructor(){
    this.destroy.onDestroy(()=>{this.reviewedPassword='';this.form.controls.password.reset();this.form.controls.passwordConfirm.reset();});
    inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params=>{
      this.id.set(params.get('id'));this.user.set(null);this.saving.set(false);this.uncertain.set(false);this.completed.set(false);this.message.set('');this.clearSecret();this.load();
    });
  }
  private clearSecret(){this.reviewedPassword='';this.form.controls.password.reset();this.form.controls.passwordConfirm.reset();}
  load(){
    if(this.saving() || this.uncertain() || this.completed())return;
    const revision=++this.revision;this.request?.unsubscribe();this.review.set(null);this.submitted.set(false);this.clearSecret();this.loading.set(true);this.error.set('');
    const id=this.id();
    this.request=forkJoin({user:id?this.api.get(id):of(null),roles:this.api.roles()}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.loading.set(false);})).subscribe({
      next:value=>{if(revision!==this.revision)return;this.user.set(value.user);this.roles.set(value.roles);const user=value.user;
        this.form.reset({nombres:user?.nombres??'',apellidos:user?.apellidos??'',correo:user?.correo??'',telefono:user?.telefono??'',id_rol:'',password:'',passwordConfirm:''});},
      error:error=>{if(revision===this.revision)this.error.set(apiErrorMessage(error));},
    });
  }
  save(){
    if(!this.allowed() || this.loading() || this.error() || this.saving() || this.uncertain() || this.completed() || this.review())return;
    this.submitted.set(true);this.form.markAllAsTouched();const value=this.form.getRawValue();
    const role=this.assignable().find(role=>role.id_rol===value.id_rol);
    if(this.validationIssues().length || (this.id() && !this.user())){this.message.set('');focusFormTarget('user-editor-errors');return;}
    this.reviewedPassword=this.id()?'':value.password;
    this.review.set({id:this.id(),contact:{nombres:value.nombres.trim(),apellidos:value.apellidos.trim(),correo:value.correo.trim().toLowerCase(),telefono:value.telefono.trim()},roleId:role?.id_rol??'',roleName:role?.nombre??''});
    this.message.set('');
    if(typeof document!=='undefined')setTimeout(()=>document.getElementById('user-editor-review')?.focus(),0);
  }
  validationIssues():FormIssue[]{
    const controls=this.form.controls,value=this.form.getRawValue();
    const result:FormIssue[]=[];
    if(controls.nombres.invalid)result.push({field:'nombres',label:'Nombres',message:'Escribe los nombres, de hasta 100 caracteres.'});
    if(controls.apellidos.invalid)result.push({field:'apellidos',label:'Apellidos',message:'Escribe los apellidos, de hasta 100 caracteres.'});
    if(controls.correo.invalid)result.push({field:'correo',label:'Correo',message:'Introduce un correo válido, de hasta 150 caracteres.'});
    if(controls.telefono.invalid)result.push({field:'telefono',label:'Teléfono',message:'El teléfono puede tener hasta 20 caracteres.'});
    if(!this.id()){
      if(!this.assignable().some(role=>role.id_rol===value.id_rol))result.push({field:'id_rol',label:'Rol único',message:'Selecciona un rol disponible para asignar.'});
      if(value.password.length<8)result.push({field:'password',label:'Contraseña inicial',message:'Introduce al menos 8 caracteres.'});
      if(!value.passwordConfirm || value.password!==value.passwordConfirm)result.push({field:'passwordConfirm',label:'Confirmación de contraseña',message:'Repite la misma contraseña inicial.'});
    }
    return result;
  }
  fieldError(field:keyof typeof this.form.controls){return (this.submitted() || this.form.controls[field].touched)?this.validationIssues().find(issue=>issue.field===field)?.message??'':'';}
  cancel(){if(!this.saving()){this.review.set(null);this.submitted.set(false);this.clearSecret();focusFormTarget('user-editor-submit');}}
  confirm(){
    const decision=this.review();
    if(!decision || !this.allowed() || decision.id!==this.id() || this.saving() || this.loading() || this.error() || this.uncertain() || this.completed())return;
    if(!decision.id && (!this.assignable().some(role=>role.id_rol===decision.roleId) || this.reviewedPassword.length<8))return;
    const revision=this.revision;this.saving.set(true);this.message.set('');
    const create:UserCreate={...decision.contact,id_rol:decision.roleId,password:this.reviewedPassword,estado:'activo'};
    const operation=decision.id?this.api.update(decision.id,{...decision.contact}):this.api.create(create);
    operation.pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.saving.set(false);})).subscribe({
      next:value=>{if(revision!==this.revision)return;this.user.set(value);this.completed.set(true);this.review.set(null);this.clearSecret();this.form.markAsPristine();this.message.set('Cuenta guardada. Puedes consultar su ficha.');void this.router.navigate(['/admin/usuarios',value.id_usuario]).catch(()=>false);},
      error:error=>{if(revision!==this.revision)return;this.review.set(null);this.clearSecret();const uncertain=error instanceof HttpErrorResponse && (error.status===0 || error.status>=500);this.uncertain.set(uncertain);this.message.set(uncertain?'No se pudo confirmar el resultado. Consulta el directorio antes de volver a guardar: la operación pudo completarse.':apiErrorMessage(error));},
    });
  }
}

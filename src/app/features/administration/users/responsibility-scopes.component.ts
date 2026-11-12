import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminUser } from './admin-users-api.service';
import { AdminCommunity } from '../territories/admin-territories-api.service';
import { CaseType } from '../../citizen/services/citizen-cases.models';
import { AdminScopesApiService, ResponsibilityScope, ScopePage } from './admin-scopes-api.service';

@Component({selector:'plus-responsibility-scopes',standalone:true,imports:[ReactiveFormsModule,DatePipe],templateUrl:'./responsibility-scopes.component.html'})
export class ResponsibilityScopesComponent {
  private readonly api=inject(AdminScopesApiService);private readonly destroy=inject(DestroyRef);
  readonly data=signal<ScopePage|null>(null);readonly users=signal<AdminUser[]>([]);readonly communities=signal<AdminCommunity[]>([]);readonly types=signal<CaseType[]>([]);
  readonly page=signal(1);readonly loading=signal(true);readonly saving=signal(false);readonly error=signal('');readonly status=signal('');
  readonly form=inject(FormBuilder).nonNullable.group({usuario:['',Validators.required],comunidad:'',tipo_caso:'',activo:true});
  constructor(){this.loadCatalogs();this.load();}
  pages(){return Math.max(1,Math.ceil((this.data()?.count??0)/20));}
  load(){this.loading.set(true);this.error.set('');this.api.list(this.page()).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>this.data.set(value),error:error=>this.error.set(apiErrorMessage(error))});}
  loadCatalogs(){forkJoin({users:this.api.users(),communities:this.api.communities(),types:this.api.caseTypes()}).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{this.users.set(value.users);this.communities.set(value.communities);this.types.set(value.types.filter(item=>item.activo));},error:error=>this.status.set(`No se pudieron cargar todos los selectores. ${apiErrorMessage(error)}`)});}
  navigate(delta:number){const next=this.page()+delta;if(next<1||next>this.pages()||this.loading())return;this.page.set(next);this.load();}
  save(){if(this.form.invalid||this.saving())return;const value=this.form.getRawValue();if(!value.comunidad&&!value.tipo_caso){this.status.set('Selecciona al menos una comunidad o un tipo de caso para definir el ámbito.');return;}this.saving.set(true);this.status.set('');this.api.create({usuario:value.usuario,comunidad:value.comunidad||null,tipo_caso:value.tipo_caso||null,activo:value.activo}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.saving.set(false))).subscribe({next:()=>{this.status.set('Ámbito asignado.');this.form.reset({usuario:'',comunidad:'',tipo_caso:'',activo:true});this.page.set(1);this.load();},error:error=>this.status.set(apiErrorMessage(error))});}
  toggle(row:ResponsibilityScope){if(this.saving())return;this.saving.set(true);this.status.set('');this.api.update(row.id_asignacion||row.id,{activo:!row.activo}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.saving.set(false))).subscribe({next:()=>{this.status.set(row.activo?'Ámbito desactivado.':'Ámbito activado.');this.load();},error:error=>this.status.set(apiErrorMessage(error))});}
  userName(id:string){const value=this.users().find(item=>item.id_usuario===id);return value?`${value.nombres} ${value.apellidos}`:id;}
}

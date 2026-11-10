import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, Subscription } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminRole, AdminUsersApiService, USER_STATES, UserFilters, UserPage } from './admin-users-api.service';

@Component({selector:'plus-admin-users',standalone:true,imports:[RouterLink,ReactiveFormsModule],templateUrl:'./users-list.component.html'})
export class UsersListComponent {
  readonly api = inject(AdminUsersApiService);
  private readonly destroy = inject(DestroyRef);
  private request?: Subscription;
  private revision = 0;
  readonly roles = signal<AdminRole[]>([]); readonly roleError = signal('');
  readonly states = USER_STATES;
  readonly form = inject(FormBuilder).nonNullable.group({search:'',id_rol:'',estado:''});
  readonly applied = signal<UserFilters>({search:'',id_rol:'',estado:''});
  readonly data = signal<UserPage | null>(null); readonly loading = signal(true); readonly error = signal('');
  readonly page = signal(1); readonly pageSize = 10;
  readonly pages = computed(() => Math.max(1,Math.ceil((this.data()?.count ?? 0)/this.pageSize)));
  constructor() {this.load();this.loadRoles();}
  loadRoles() {this.roleError.set('');this.api.roles().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:rows=>this.roles.set(rows),error:error=>this.roleError.set(apiErrorMessage(error))});}
  load() {
    const revision=++this.revision;this.request?.unsubscribe();this.loading.set(true);this.error.set('');
    this.request=this.api.list(this.applied(),this.page(),this.pageSize).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.loading.set(false);})).subscribe({
      next:value=>{if(revision===this.revision)this.data.set(value);},error:error=>{
        if(revision!==this.revision)return;
        if(error instanceof HttpErrorResponse && error.status===404 && this.page()>1){this.page.set(1);this.load();return;}
        this.error.set(apiErrorMessage(error));
      },
    });
  }
  apply(){const value=this.form.getRawValue();this.applied.set({...value,search:value.search.trim()});this.page.set(1);this.form.markAsPristine();this.load();}
  reset(){this.form.reset({search:'',id_rol:'',estado:''});this.apply();}
  navigate(delta:number){if(!this.loading()){this.page.update(value=>Math.max(1,Math.min(this.pages(),value+delta)));this.load();}}
}

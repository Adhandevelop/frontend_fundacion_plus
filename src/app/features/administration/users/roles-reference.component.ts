import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminRole, AdminUsersApiService } from './admin-users-api.service';

@Component({selector:'plus-roles-reference',standalone:true,imports:[RouterLink],template:`
  <div class="p-4 sm:p-6 max-w-5xl mx-auto space-y-6"><a routerLink="/admin/usuarios" class="text-body-sm underline">Volver a usuarios</a><header class="space-y-3"><p class="text-label-sm uppercase tracking-wider">Catálogo de acceso</p><h1 class="text-headline-md">Roles registrados</h1><p class="text-body-sm">Cada cuenta tiene un rol único. La autorización de cada operación la aplica el backend.</p></header>
  @if(loading()){<p role="status">Consultando roles…</p>}
  @else if(error()){<section role="alert" class="admin-panel border rounded-xl p-5 space-y-3"><p>{{error()}}</p><button type="button" class="admin-button" (click)="load()">Reintentar</button></section>}
  @else {<section class="grid sm:grid-cols-2 gap-4">@for(role of roles();track role.id_rol){<article class="admin-panel border rounded-xl border-t-4 border-t-yellow-400 p-5 space-y-3"><h2 class="text-title-md">{{role.nombre}}</h2><p class="text-body-sm">{{role.descripcion || 'Sin descripción adicional.'}}</p><p class="text-label-sm">{{role.assignable?'Asignable según el catálogo para tu cuenta.':'No asignable según el catálogo para tu cuenta.'}}</p></article>}@empty{<p role="status">No hay roles registrados.</p>}</section>}
  </div>`})
export class RolesReferenceComponent {
  private readonly api=inject(AdminUsersApiService);private readonly destroy=inject(DestroyRef);
  readonly roles=signal<AdminRole[]>([]);readonly loading=signal(true);readonly error=signal('');
  constructor(){this.load();}
  load(){if(!this.loading())this.loading.set(true);this.error.set('');this.api.roles().pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:rows=>this.roles.set(rows),error:error=>this.error.set(apiErrorMessage(error))});}
}

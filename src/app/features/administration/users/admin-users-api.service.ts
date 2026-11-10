import { computed, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api.config';
import { AuthService } from '../../../core/auth/auth.service';
import { canAccessAdminSection } from '../../../core/auth/admin-access.policy';

export const USER_STATES = ['activo', 'suspendido', 'inactivo'] as const;
export type UserState = typeof USER_STATES[number];
export const ROLE_CODES = ['administrador', 'moderador', 'representante', 'ciudadano'] as const;
export interface AdminRole {id_rol: string; nombre: string; descripcion: string | null; assignable: boolean}
export interface AdminUser {
  id_usuario: string; id_rol: string; nombres: string; apellidos: string; correo: string;
  telefono: string | null; estado: UserState; primary_role: string; fecha_registro: string; fecha_actualizacion: string;
}
export interface UserPage {count: number; results: AdminUser[]}
export interface UserFilters {search: string; id_rol: string; estado: string}
export interface UserContact {nombres: string; apellidos: string; correo: string; telefono: string}
export interface UserCreate extends UserContact {id_rol: string; password: string; estado: 'activo'}
export type UserAction = {kind: 'role'; id_rol: string; motivo: string} | {kind: 'status'; estado: UserState; motivo: string};

@Injectable({providedIn: 'root'})
export class AdminUsersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private readonly auth = inject(AuthService);
  readonly canManage = computed(() => canAccessAdminSection(this.auth.user(), 'users'));
  canEdit(id: string) {return this.canManage() && id !== this.auth.user()?.id_usuario;}
  list(filters: UserFilters, page: number, pageSize: number) {return this.http.get<UserPage>(`${this.base}/admin/users/`, {params: {...filters, page, page_size: pageSize}});}
  get(id: string) {return this.http.get<AdminUser>(`${this.base}/admin/users/${encodeURIComponent(id)}/`);}
  roles() {
    return this.http.get<AdminRole[] | {count: number; results: AdminRole[]}>(`${this.base}/admin/roles/`, {params: {page_size: 100}}).pipe(map(value => {
      if (Array.isArray(value)) return value;
      if (value.count > value.results.length) throw new Error('El catálogo de roles está incompleto.');
      return value.results;
    }));
  }
  create(payload: UserCreate) {return this.http.post<AdminUser>(`${this.base}/admin/users/`, payload);}
  update(id: string, payload: UserContact) {return this.http.patch<AdminUser>(`${this.base}/admin/users/${encodeURIComponent(id)}/`, payload);}
  action(id: string, action: UserAction) {
    const url = `${this.base}/admin/users/${encodeURIComponent(id)}/`;
    return action.kind === 'role'
      ? this.http.put<unknown>(url + 'role/', {id_rol: action.id_rol, motivo: action.motivo})
      : this.http.patch<unknown>(url + 'status/', {estado: action.estado, motivo: action.motivo});
  }
}

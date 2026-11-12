import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api.config';
import { AdminUser } from './admin-users-api.service';
import { AdminCommunity } from '../territories/admin-territories-api.service';
import { CaseType } from '../../citizen/services/citizen-cases.models';

export interface ResponsibilityScope {
  id: string;
  id_asignacion: string;
  usuario: string;
  comunidad: string | null;
  comunidad_nombre: string;
  tipo_caso: string | null;
  tipo_caso_nombre: string;
  fecha_asignacion: string;
  activo: boolean;
}
export interface ScopePage {count:number;next:string|null;previous:string|null;results:ResponsibilityScope[]}
export interface ScopeWrite {usuario:string;comunidad:string|null;tipo_caso:string|null;activo:boolean}
interface Page<T>{count:number;next?:string|null;previous?:string|null;results:T[]}

@Injectable({providedIn:'root'})
export class AdminScopesApiService {
  private readonly http=inject(HttpClient);private readonly base=inject(API_BASE_URL);
  list(page:number,pageSize=20){return this.http.get<ScopePage>(`${this.base}/admin/scope-assignments/`,{params:{page,page_size:pageSize}});}
  create(payload:ScopeWrite){return this.http.post<ResponsibilityScope>(`${this.base}/admin/scope-assignments/`,payload);}
  update(id:string,payload:Partial<ScopeWrite>){return this.http.patch<ResponsibilityScope>(`${this.base}/admin/scope-assignments/${encodeURIComponent(id)}/`,payload);}
  users(){return this.http.get<Page<AdminUser>|AdminUser[]>(`${this.base}/admin/users/`,{params:{estado:'activo',page_size:100}}).pipe(map(value=>Array.isArray(value)?value:value.results));}
  communities(){return this.http.get<Page<AdminCommunity>|AdminCommunity[]>(`${this.base}/admin/communities/`,{params:{activo:'true',page_size:100}}).pipe(map(value=>Array.isArray(value)?value:value.results));}
  caseTypes(){return this.http.get<CaseType[]>(`${this.base}/catalogs/case-types/`);}
}

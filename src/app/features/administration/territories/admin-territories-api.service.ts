import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/api/api.config';
import { Department } from '../../../core/api/account-api.service';

export const COMMUNITY_TYPES = ['barrio', 'vereda', 'corregimiento', 'comuna', 'sector', 'otro'] as const;
export type CommunityType = typeof COMMUNITY_TYPES[number];
export interface TerritoryMunicipality {
  id_municipio: string; id_departamento: string; departamento_nombre: string; nombre: string; codigo_dane: string;
}
export interface AdminCommunity {
  id_comunidad: string; id_municipio: string; municipio_nombre: string;
  nombre: string; tipo: CommunityType; tipo_display: string; descripcion: string | null; activo: boolean;
  ubicacion: unknown;
}
export interface CommunityPage {count: number; results: AdminCommunity[]}
export interface CommunityFilters {municipio: string; tipo: string; activo: string}
export interface CommunityWrite {id_municipio: string; nombre: string; tipo: CommunityType; descripcion: string}

@Injectable({providedIn: 'root'})
export class AdminTerritoriesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  departments() {return this.http.get<Department[]>(`${this.base}/catalogs/departments/`);}
  municipalities() {return this.http.get<TerritoryMunicipality[]>(`${this.base}/catalogs/municipalities/`);}
  list(filters: CommunityFilters, page: number, pageSize: number) {
    return this.http.get<CommunityPage>(`${this.base}/admin/communities/`, {params: {...filters, page, page_size: pageSize}});
  }
  get(id: string) {return this.http.get<AdminCommunity>(`${this.base}/admin/communities/${encodeURIComponent(id)}/`);}
  create(payload: CommunityWrite) {return this.http.post<AdminCommunity>(`${this.base}/admin/communities/`, payload);}
  update(id: string, payload: CommunityWrite) {return this.http.patch<AdminCommunity>(`${this.base}/admin/communities/${encodeURIComponent(id)}/`, payload);}
  setActive(id: string, activo: boolean) {return this.http.patch<AdminCommunity>(`${this.base}/admin/communities/${encodeURIComponent(id)}/`, {activo});}
}

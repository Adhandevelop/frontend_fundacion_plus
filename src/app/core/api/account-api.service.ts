import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { AccountUser, UpdateAccountRequest, UserPreferences, UserProfile } from '../auth/auth.models';
import { AuthService } from '../auth/auth.service';

export interface Department {id_departamento: string; nombre: string}
export interface Municipality {id_municipio: string; id_departamento: string; nombre: string}
export interface Community {id_comunidad: string; id_municipio: string; nombre: string}
type Collection<T> = T[] | {count: number; next: string | null; previous: string | null; results: T[]};
function items<T>(value: Collection<T>): T[] {return Array.isArray(value) ? value : value.results;}

@Injectable({providedIn: 'root'})
export class AccountApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private readonly auth = inject(AuthService);
  get() {return this.http.get<AccountUser>(`${this.base}/me/`).pipe(tap(user => this.auth.updateUser(user)));}
  update(payload: UpdateAccountRequest) {return this.http.patch<AccountUser>(`${this.base}/me/`, payload).pipe(tap(user => this.auth.updateUser(user)));}
  preferences(payload: UserPreferences) {return this.http.patch<UserPreferences>(`${this.base}/me/preferences/`, payload);}
  uploadPhoto(file: File) {const form = new FormData(); form.append('photo', file); return this.http.put<UserProfile>(`${this.base}/me/photo/`, form);}
  removePhoto() {return this.http.delete<void>(`${this.base}/me/photo/`);}
  departments() {return this.http.get<Collection<Department>>(`${this.base}/catalogs/departments/`).pipe(map(items));}
  municipalities(id: string) {return this.http.get<Collection<Municipality>>(`${this.base}/catalogs/municipalities/`, {params: {id_departamento: id}}).pipe(map(items));}
  communities(id: string) {return this.http.get<Collection<Community>>(`${this.base}/catalogs/communities/`, {params: {id_municipio: id, activo: 'true'}}).pipe(map(items));}
}

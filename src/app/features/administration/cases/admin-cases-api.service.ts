import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api.config';
import { AdminAction, AdminCase, AdminCaseFilters, AdminCasePage, AdminDashboard, AdminFollowedCasePage, CandidatePage, ResponsibleCandidate } from './admin-cases.models';

@Injectable({providedIn:'root'})
export class AdminCasesApiService {
  private readonly http=inject(HttpClient);
  private readonly base=inject(API_BASE_URL);
  private url(id:string){return `${this.base}/admin/cases/${encodeURIComponent(id)}/`;}
  dashboard(){return this.http.get<AdminDashboard>(`${this.base}/admin/dashboard/`);}
  create(payload:{titulo:string;descripcion:string;tipo_caso:string;comunidad:string;estado:string;prioridad:string;estado_publicacion:string;direccion_referencia:string|null;familias_afectadas:number;meses_afectacion:number}){return this.http.post<AdminCase>(`${this.base}/admin/cases/`,payload);}
  list(params:AdminCaseFilters){return this.http.get<AdminCasePage|AdminCase[]>(`${this.base}/admin/cases/`,{params:{...params}}).pipe(map(value=>Array.isArray(value)?{count:value.length,next:null,previous:null,results:value}:value));}
  detail(id:string){return this.http.get<AdminCase>(this.url(id));}
  action(id:string,action:AdminAction){return action.kind==='evidence'?this.http.patch<unknown>(this.url(id)+`evidence/${encodeURIComponent(action.evidenceId)}/`,action.payload):this.http.post<unknown>(this.url(id)+action.kind+'/',action.payload);}
  candidates(id:string,search:string,page:number){return this.http.get<CandidatePage|ResponsibleCandidate[]>(`${this.base}/admin/users/`,{params:{eligible_for_case:id,estado:'activo',search,page,page_size:20}}).pipe(map(value=>Array.isArray(value)?{count:value.length,next:null,previous:null,results:value}:value));}
  followedCases(){return this.http.get<AdminFollowedCasePage>(`${this.base}/admin/followed-cases/`);}
  follow(id:string){return this.http.put(`${this.base}/admin/followed-cases/${encodeURIComponent(id)}/`,{});}
  unfollow(id:string){return this.http.delete<void>(`${this.base}/admin/followed-cases/${encodeURIComponent(id)}/`);}
  uploadEvidence(id:string,file:File,description:string){const body=new FormData();body.append('file',file,file.name);if(description.trim())body.append('descripcion',description.trim());return this.http.post(this.url(id)+'evidence/',body);}
  download(id:string,evidence:string){return this.http.get(this.url(id)+`evidence/${encodeURIComponent(evidence)}/download/`,{params:{download:'1'},responseType:'blob'});}
}

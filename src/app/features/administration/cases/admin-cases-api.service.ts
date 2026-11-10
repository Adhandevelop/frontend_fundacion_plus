import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api.config';
import { AdminAction, AdminCase, AdminCaseFilters, AdminCasePage, AdminDashboard, CandidatePage, ResponsibleCandidate } from './admin-cases.models';

@Injectable({providedIn:'root'})
export class AdminCasesApiService {
  private readonly http=inject(HttpClient);
  private readonly base=inject(API_BASE_URL);
  private url(id:string){return `${this.base}/admin/cases/${encodeURIComponent(id)}/`;}
  dashboard(){return this.http.get<AdminDashboard>(`${this.base}/admin/dashboard/`);}
  list(params:AdminCaseFilters){return this.http.get<AdminCasePage|AdminCase[]>(`${this.base}/admin/cases/`,{params:{...params}}).pipe(map(value=>Array.isArray(value)?{count:value.length,next:null,previous:null,results:value}:value));}
  detail(id:string){return this.http.get<AdminCase>(this.url(id));}
  action(id:string,action:AdminAction){return action.kind==='evidence'?this.http.patch<unknown>(this.url(id)+`evidence/${encodeURIComponent(action.evidenceId)}/`,action.payload):this.http.post<unknown>(this.url(id)+action.kind+'/',action.payload);}
  candidates(id:string,search:string,page:number){return this.http.get<CandidatePage|ResponsibleCandidate[]>(`${this.base}/admin/users/`,{params:{eligible_for_case:id,estado:'activo',search,page,page_size:20}}).pipe(map(value=>Array.isArray(value)?{count:value.length,next:null,previous:null,results:value}:value));}
  download(id:string,evidence:string){return this.http.get(this.url(id)+`evidence/${encodeURIComponent(evidence)}/download/`,{params:{download:'1'},responseType:'blob'});}
}

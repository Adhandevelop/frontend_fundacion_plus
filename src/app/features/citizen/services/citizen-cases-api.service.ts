import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api.config';
import { CaseContribution, CaseEvidence, CaseHistory, CasePage, CaseState, CaseType, CitizenCase, CitizenDashboard, CreateCaseRequest } from './citizen-cases.models';

@Injectable({providedIn:'root'})
export class CitizenCasesApiService {
  private readonly http=inject(HttpClient);
  private readonly base=inject(API_BASE_URL);
  private caseUrl(id:string) {return `${this.base}/me/cases/${encodeURIComponent(id)}/`;}
  dashboard() {return this.http.get<CitizenDashboard>(`${this.base}/me/dashboard/`);}
  list(params:{page:number;page_size:number;search:string;estado:string;estado_publicacion:string}) {
    return this.http.get<CasePage | CitizenCase[]>(`${this.base}/me/cases/`,{params}).pipe(map(value=>Array.isArray(value)?{count:value.length,next:null,previous:null,results:value}:value));
  }
  detail(id:string) {return this.http.get<CitizenCase>(this.caseUrl(id));}
  history(id:string) {return this.http.get<CaseHistory>(this.caseUrl(id)+'history/');}
  create(payload:CreateCaseRequest) {return this.http.post<CitizenCase>(`${this.base}/me/cases/`,payload);}
  types() {return this.http.get<CaseType[]>(`${this.base}/catalogs/case-types/`);}
  states() {return this.http.get<CaseState[]>(`${this.base}/catalogs/case-statuses/`);}
  upload(id:string,file:File) {
    const body=new FormData();body.append('file',file);
    return this.http.post<CaseEvidence>(this.caseUrl(id)+'evidence/',body);
  }
  download(id:string,evidence:string) {return this.http.get(this.caseUrl(id)+`evidence/${encodeURIComponent(evidence)}/download/`,{params:{download:'1'},responseType:'blob'});}
  contribute(id:string,contenido:string,correction?:string) {
    return this.http.post<CaseContribution>(this.caseUrl(id)+'contributions/',correction?{contenido,id_solicitud_correccion:correction}:{contenido});
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/api/api.config';
import { AdminCase } from '../cases/admin-cases.models';

export interface ReportCriteria {search:string;estado:string;estado_publicacion:string;prioridad:string;id_tipo_caso:string;naturaleza:string}
export const EMPTY_REPORT_CRITERIA:ReportCriteria={search:'',estado:'',estado_publicacion:'',prioridad:'',id_tipo_caso:'',naturaleza:''};
export interface ReportTotals {total_cases:number;by_estado:Record<string,number>;by_estado_publicacion:Record<string,number>;by_prioridad:Record<string,number>;by_categoria:Record<string,number>;by_municipio:Record<string,number>}
export interface CaseReport {totals:ReportTotals;count:number;page:number;page_size:number;results:AdminCase[]}
@Injectable({providedIn:'root'})
export class AdminReportApiService {
  private readonly http=inject(HttpClient);
  private readonly base=inject(API_BASE_URL);
  get(criteria:ReportCriteria,page:number,pageSize:number){return this.http.get<CaseReport>(`${this.base}/admin/reports/cases/`,{params:{...criteria,page,page_size:pageSize}});}
  csv(criteria:ReportCriteria){return this.http.get(`${this.base}/admin/reports/cases/export/`,{params:{...criteria},responseType:'blob'});}
}

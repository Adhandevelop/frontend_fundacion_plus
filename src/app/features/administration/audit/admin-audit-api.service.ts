import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api.config';

export interface AuditEvent {
  event_ref:string;source:string;action:string;module:string;entity:string|null;entity_id:string|null;
  actor:string|null;actor_nombre:string|null;result:string;description:string|null;changed_columns:string[]|null;timestamp:string;
}
export interface AuditSelection {count:number;results:AuditEvent[];kpis:{total_events:number;eventos:number;accesos:number;casos:number;permisos:number;seguridad:number}}
@Injectable({providedIn:'root'})
export class AdminAuditApiService {
  private readonly http=inject(HttpClient);
  private readonly base=inject(API_BASE_URL);
  list(source:string){return this.http.get<AuditSelection>(`${this.base}/admin/audit-events/`,{params:source?{source}:{}});}
  detail(reference:string){
    if(!/^(eventos|accesos|casos|permisos|seguridad):[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reference))return throwError(()=>new Error('Referencia de auditoría no válida.'));
    return this.http.get<Record<string,unknown>>(`${this.base}/admin/audit-events/${encodeURIComponent(reference)}/`);
  }
}

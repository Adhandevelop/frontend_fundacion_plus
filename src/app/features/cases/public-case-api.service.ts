import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_BASE_URL} from '../../core/api/api.config';
import {map} from 'rxjs';

export interface PublicCaseDetail {
  id_caso:string; codigo:string; titulo:string; descripcion:string;
  tipo_nombre:string; tipo_naturaleza:string; comunidad_nombre:string;
  municipio_nombre:string; departamento_nombre:string; estado_nombre:string;
  prioridad:string; fecha_creacion:string; resultado_resumen:string|null;
  fecha_resolucion:string|null;
}
export interface PublicCaseUpdate {id_seguimiento:string;titulo:string|null;descripcion:string;tipo_evento:string;fecha_seguimiento:string}
export interface PublicCaseStatusHistory {id_historial:string;estado_anterior_nombre:string|null;estado_nuevo_nombre:string;motivo:string|null;fecha_cambio:string}
export interface PublicCaseHistory {id_caso:string;codigo:string;seguimientos:PublicCaseUpdate[];historial_estados:PublicCaseStatusHistory[]}
export interface PublicCaseEvidence {id_evidencia:string;tipo_archivo:string;download_url:string;descripcion:string|null;nombre_original:string|null;mime_type:string|null;fecha_subida:string}
export interface PublicCaseComment {id_comentario:string;autor_nombre:string;contenido:string;fecha_creacion:string}
type Collection<T>=T[]|{count:number;results:T[]};
const rows=<T>(value:Collection<T>)=>Array.isArray(value)?value:value.results;

@Injectable({providedIn:'root'})
export class PublicCaseApiService {
  private readonly http=inject(HttpClient);
  private readonly base=inject(API_BASE_URL);
  detail(lookup:string){return this.http.get<PublicCaseDetail>(`${this.base}/public/cases/${encodeURIComponent(lookup)}/`);}
  history(id:string){return this.http.get<PublicCaseHistory>(`${this.base}/public/cases/${encodeURIComponent(id)}/history/`);}
  evidence(id:string){return this.http.get<Collection<PublicCaseEvidence>>(`${this.base}/public/cases/${encodeURIComponent(id)}/evidence/`).pipe(map(rows));}
  comments(id:string){return this.http.get<Collection<PublicCaseComment>>(`${this.base}/public/cases/${encodeURIComponent(id)}/comments/`,{params:{page_size:100}}).pipe(map(rows));}
  comment(id:string,contenido:string){return this.http.post<{id_comentario:string;estado_moderacion:string}>(`${this.base}/cases/${encodeURIComponent(id)}/comments/`,{contenido});}
}

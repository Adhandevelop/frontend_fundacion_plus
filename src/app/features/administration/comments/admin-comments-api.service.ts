import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/api/api.config';

export const COMMENT_STATES = ['pendiente', 'aprobado', 'rechazado', 'oculto'] as const;
export type CommentState = typeof COMMENT_STATES[number];
export const COMMENT_LABELS: Record<CommentState, string> = {
  pendiente: 'Pendiente', aprobado: 'Aprobado', rechazado: 'Rechazado', oculto: 'Oculto',
};
export interface AdminComment {
  id_comentario: string;
  caso: string;
  caso_codigo: string;
  usuario: string;
  autor_nombre: string;
  contenido: string;
  estado_moderacion: CommentState;
  fecha_creacion: string;
}
export interface CommentPage {count: number; results: AdminComment[]}
export interface CommentFilters {estado_moderacion: string; caso: string}
export interface CommentDecision {estado_moderacion: CommentState; motivo: string; notificar_motivo: boolean}
export interface CommentHistoryItem {id:string;actor_id:string;actor_nombre:string;fecha:string;decision:CommentState;estado_anterior:CommentState;estado_nuevo:CommentState;motivo:string;descripcion:string}
export interface CommentHistory {comment_id:string;count:number;results:CommentHistoryItem[];history?:CommentHistoryItem[]}
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable({providedIn: 'root'})
export class AdminCommentsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  list(filters: CommentFilters, page: number, pageSize: number) {
    return this.http.get<CommentPage>(`${this.base}/admin/comments/`, {params: {...filters, page, page_size: pageSize}});
  }
  get(id: string) {return this.http.get<AdminComment>(`${this.base}/admin/comments/${encodeURIComponent(id)}/`);}
  moderate(id: string, decision: CommentDecision) {
    return this.http.post<AdminComment>(`${this.base}/admin/comments/${encodeURIComponent(id)}/moderation/`, decision);
  }
  history(id:string){return this.http.get<CommentHistory>(`${this.base}/admin/comments/${encodeURIComponent(id)}/history/`);}
}

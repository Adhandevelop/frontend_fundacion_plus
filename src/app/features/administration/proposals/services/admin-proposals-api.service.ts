import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../../../core/api/api.config';

export const PROPOSAL_STATES=['pendiente','en_revision','aprobada','rechazada'] as const;
export type ProposalState=typeof PROPOSAL_STATES[number];
export const PROPOSAL_LABELS:Record<ProposalState,string>={pendiente:'Pendiente',en_revision:'En revisión',aprobada:'Aprobada',rechazada:'Rechazada'};
export interface AdminProposal {id:string;title:string;description:string;contactName:string;phone:string;email:string;territory:string;requestedInitiativeId:string|null;requestedInitiativeName:string;activityType:string;suggestedDate:string;consent:boolean;createdAt:string;state:ProposalState;response:string;resultInitiativeId:string|null;reviewer:string;reviewedAt:string|null}
export interface ProposalPage {count:number;next:string|null;previous:string|null;results:AdminProposal[]}
const mapProposal=(row:any):AdminProposal=>({id:row.id??row.id_propuesta,title:row.titulo??'',description:row.descripcion??'',contactName:row.nombre_contacto??'',phone:row.telefono_contacto??'',email:row.correo_contacto??'',territory:row.comunidad_declarada??'',requestedInitiativeId:row.iniciativa_solicitada??null,requestedInitiativeName:row.iniciativa_solicitada_nombre??row.initiative_name??'',activityType:row.tipo_actividad??'',suggestedDate:row.fecha_sugerida??'',consent:Boolean(row.acepta_tratamiento_datos),createdAt:row.fecha_creacion??'',state:row.estado,response:row.respuesta??'',resultInitiativeId:row.iniciativa_generada??null,reviewer:row.revisor_nombre??row.reviewer_name??'',reviewedAt:row.fecha_revision??null});

@Injectable({providedIn:'root'})
export class AdminProposalsApiService {
 private readonly http=inject(HttpClient);private readonly base=inject(API_BASE_URL);
 list(filters:{query:string;state:string;initiativeId:string},page=1,pageSize=10){const params:any={page,page_size:pageSize};if(filters.query.trim())params.search=filters.query.trim();if(filters.state)params.estado=filters.state;if(filters.initiativeId)params.iniciativa_solicitada=filters.initiativeId;return this.http.get<ProposalPage|any[]>(`${this.base}/admin/proposals/`,{params}).pipe(map(value=>Array.isArray(value)?{count:value.length,next:null,previous:null,results:value.map(mapProposal)}:{...value,results:value.results.map(mapProposal)}));}
 detail(id:string){return this.http.get<any>(`${this.base}/admin/proposals/${encodeURIComponent(id)}/`).pipe(map(mapProposal));}
 review(id:string,state:ProposalState,response:string,resultInitiativeId:string|null){return this.http.patch<any>(`${this.base}/admin/proposals/${encodeURIComponent(id)}/`,{estado:state,respuesta:response.trim(),iniciativa_generada:state==='aprobada'&&resultInitiativeId?resultInitiativeId:null}).pipe(map(mapProposal));}
}

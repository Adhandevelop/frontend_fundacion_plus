import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../../../core/api/api.config';
import { EditorialMedia, mapEditorialMedia } from '../../../../shared/editorial-media';

export type InitiativeState='planificada'|'en_curso'|'finalizada'|'cancelada';
export type InitiativePublication='borrador'|'pendiente'|'publicada'|'rechazada';
export const INITIATIVE_STATE_LABELS:Record<InitiativeState,string>={planificada:'Planificada',en_curso:'En curso',finalizada:'Finalizada',cancelada:'Cancelada'};
export const INITIATIVE_PUBLICATION_LABELS:Record<InitiativePublication,string>={borrador:'Borrador',pendiente:'En revisión',publicada:'Publicada',rechazada:'Rechazada'};
export interface AdminInitiativeEdition {id:string;year:number;name:string;season:string;description:string;start:string;end:string;state:InitiativeState;metrics:number;communities:number;activities:number}
export interface AdminInitiative {id:string;slug:string;title:string;subtitle:string;category:string;summary:string;description:string;state:InitiativeState;publication:InitiativePublication;featured:boolean;featuredOrder:number|null;cover:string;media:EditorialMedia[];editions:AdminInitiativeEdition[];createdAt:string;updatedAt:string;publishedAt:string|null}
interface Page<T>{count:number;next:string|null;previous:string|null;results:T[]}
const mapEdition=(row:any):AdminInitiativeEdition=>({id:row.id??row.id_edicion,year:Number(row.anio),name:row.nombre_edicion??'',season:row.temporada??'',description:row.descripcion??'',start:row.fecha_inicio??'',end:row.fecha_fin??'',state:row.estado,metrics:(row.indicadores??[]).length,communities:(row.comunidades_vinculadas??[]).length,activities:(row.actividades??[]).length});
const mapInitiative=(row:any):AdminInitiative=>{const media=(row.multimedia??[]).map(mapEditorialMedia);return{id:row.id??row.id_iniciativa,slug:row.slug??'',title:row.titulo??row.name??'',subtitle:row.subtitulo??row.featured_title??'',category:row.categoria??row.category??'',summary:row.descripcion_corta??row.short_description??'',description:row.descripcion??row.full_content??'',state:row.estado,publication:row.estado_publicacion,featured:Boolean(row.destacada??row.is_featured),featuredOrder:row.orden_destacado??null,cover:media.find((item:EditorialMedia)=>item.cover&&item.editionId===null)?.url??'',media,editions:(row.ediciones??[]).map(mapEdition),createdAt:row.fecha_creacion??'',updatedAt:row.fecha_actualizacion??'',publishedAt:row.fecha_publicacion??null};};

@Injectable({providedIn:'root'})
export class AdminInitiativesApiService {
 private readonly http=inject(HttpClient);private readonly base=inject(API_BASE_URL);
 list(publication='',page=1,pageSize=10){return this.http.get<Page<any>>(`${this.base}/admin/initiatives/`,{params:{estado_publicacion:publication,page,page_size:pageSize}}).pipe(map(value=>({...value,results:value.results.map(mapInitiative)} as Page<AdminInitiative>)));}
 detail(id:string){return this.http.get<any>(`${this.base}/admin/initiatives/${encodeURIComponent(id)}/`).pipe(map(mapInitiative));}
 create(value:{title:string;subtitle:string;category:string;summary:string;description:string;state:InitiativeState}){return this.http.post<any>(`${this.base}/admin/initiatives/`,this.payload(value)).pipe(map(mapInitiative));}
 update(id:string,value:{title:string;subtitle:string;category:string;summary:string;description:string;state:InitiativeState}){return this.http.patch<any>(`${this.base}/admin/initiatives/${encodeURIComponent(id)}/`,this.payload(value)).pipe(map(mapInitiative));}
 transition(id:string,publication:InitiativePublication,featured?:boolean){const url=`${this.base}/admin/initiatives/${encodeURIComponent(id)}/`;if(featured===undefined&&publication==='publicada')return this.http.post<any>(url+'publish/',{}).pipe(map(mapInitiative));if(featured===undefined&&publication==='rechazada')return this.http.post<any>(url+'reject/',{}).pipe(map(mapInitiative));return this.http.patch<any>(url,{estado_publicacion:publication,...(featured===undefined?{}:{destacada:featured})}).pipe(map(mapInitiative));}
 archive(id:string){return this.http.post<any>(`${this.base}/admin/initiatives/${encodeURIComponent(id)}/archive/`,{}).pipe(map(mapInitiative));}
 createEdition(initiativeId:string,value:{year:number;name:string;season:string;description:string;start:string;end:string;state:InitiativeState}){return this.http.post<any>(`${this.base}/admin/initiative-editions/`,this.editionPayload(initiativeId,value)).pipe(map(mapEdition));}
 updateEdition(id:string,initiativeId:string,value:{year:number;name:string;season:string;description:string;start:string;end:string;state:InitiativeState}){return this.http.patch<any>(`${this.base}/admin/initiative-editions/${encodeURIComponent(id)}/`,this.editionPayload(initiativeId,value)).pipe(map(mapEdition));}
 uploadMedia(initiativeId:string,editionId:string|null,file:File,value:{alt:string;description:string;cover:boolean;order:number}){const body=new FormData();body.append('file',file,file.name);body.append('iniciativa',initiativeId);if(editionId)body.append('edicion',editionId);body.append('texto_alternativo',value.alt.trim());body.append('descripcion',value.description.trim());body.append('es_portada',String(value.cover));body.append('orden',String(value.order));return this.http.post<any>(`${this.base}/admin/initiative-media/`,body).pipe(map(mapEditorialMedia));}
 deleteMedia(id:string){return this.http.delete<void>(`${this.base}/admin/initiative-media/${encodeURIComponent(id)}/`);}
 private editionPayload(initiativeId:string,value:{year:number;name:string;season:string;description:string;start:string;end:string;state:InitiativeState}){return{iniciativa:initiativeId,anio:value.year,nombre_edicion:value.name.trim(),temporada:value.season.trim(),descripcion:value.description.trim(),fecha_inicio:value.start||null,fecha_fin:value.end||null,estado:value.state};}
 private payload(value:{title:string;subtitle:string;category:string;summary:string;description:string;state:InitiativeState}){return{titulo:value.title.trim(),subtitulo:value.subtitle.trim(),categoria:value.category.trim(),descripcion_corta:value.summary.trim(),descripcion:value.description.trim(),estado:value.state};}
}

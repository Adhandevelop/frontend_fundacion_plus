import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../../../core/api/api.config';

export type InitiativeState='planificada'|'en_curso'|'finalizada'|'cancelada';
export type InitiativePublication='borrador'|'pendiente'|'publicada'|'rechazada';
export const INITIATIVE_STATE_LABELS:Record<InitiativeState,string>={planificada:'Planificada',en_curso:'En curso',finalizada:'Finalizada',cancelada:'Cancelada'};
export const INITIATIVE_PUBLICATION_LABELS:Record<InitiativePublication,string>={borrador:'Borrador',pendiente:'En revisión',publicada:'Publicada',rechazada:'Rechazada'};
export interface AdminInitiativeEdition {id:string;year:number;name:string;season:string;description:string;state:InitiativeState;metrics:number;communities:number;activities:number}
export interface AdminInitiative {id:string;slug:string;title:string;subtitle:string;category:string;summary:string;description:string;state:InitiativeState;publication:InitiativePublication;featured:boolean;featuredOrder:number|null;cover:string;editions:AdminInitiativeEdition[];createdAt:string;updatedAt:string;publishedAt:string|null}
interface Page<T>{count:number;next:string|null;previous:string|null;results:T[]}
const mapEdition=(row:any):AdminInitiativeEdition=>({id:row.id??row.id_edicion,year:Number(row.anio),name:row.nombre_edicion??'',season:row.temporada??'',description:row.descripcion??'',state:row.estado,metrics:(row.indicadores??[]).length,communities:(row.comunidades_vinculadas??[]).length,activities:(row.actividades??[]).length});
const mapInitiative=(row:any):AdminInitiative=>({id:row.id??row.id_iniciativa,slug:row.slug??'',title:row.titulo??row.name??'',subtitle:row.subtitulo??row.featured_title??'',category:row.categoria??row.category??'',summary:row.descripcion_corta??row.short_description??'',description:row.descripcion??row.full_content??'',state:row.estado,publication:row.estado_publicacion,featured:Boolean(row.destacada??row.is_featured),featuredOrder:row.orden_destacado??null,cover:(row.multimedia??[]).find((item:any)=>item.es_portada&&item.edicion==null)?.ruta_archivo??'',editions:(row.ediciones??[]).map(mapEdition),createdAt:row.fecha_creacion??'',updatedAt:row.fecha_actualizacion??'',publishedAt:row.fecha_publicacion??null});

@Injectable({providedIn:'root'})
export class AdminInitiativesApiService {
 private readonly http=inject(HttpClient);private readonly base=inject(API_BASE_URL);
 list(publication='',page=1,pageSize=10){return this.http.get<Page<any>>(`${this.base}/admin/initiatives/`,{params:{estado_publicacion:publication,page,page_size:pageSize}}).pipe(map(value=>({...value,results:value.results.map(mapInitiative)} as Page<AdminInitiative>)));}
 detail(id:string){return this.http.get<any>(`${this.base}/admin/initiatives/${encodeURIComponent(id)}/`).pipe(map(mapInitiative));}
 create(value:{title:string;subtitle:string;category:string;summary:string;description:string;state:InitiativeState}){return this.http.post<any>(`${this.base}/admin/initiatives/`,this.payload(value)).pipe(map(mapInitiative));}
 update(id:string,value:{title:string;subtitle:string;category:string;summary:string;description:string;state:InitiativeState}){return this.http.patch<any>(`${this.base}/admin/initiatives/${encodeURIComponent(id)}/`,this.payload(value)).pipe(map(mapInitiative));}
 transition(id:string,publication:InitiativePublication,featured?:boolean){return this.http.patch<any>(`${this.base}/admin/initiatives/${encodeURIComponent(id)}/`,{estado_publicacion:publication,...(featured===undefined?{}:{destacada:featured})}).pipe(map(mapInitiative));}
 private payload(value:{title:string;subtitle:string;category:string;summary:string;description:string;state:InitiativeState}){return{titulo:value.title.trim(),subtitulo:value.subtitle.trim(),categoria:value.category.trim(),descripcion_corta:value.summary.trim(),descripcion:value.description.trim(),estado:value.state};}
}

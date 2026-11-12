import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../../../core/api/api.config';
import { EditorialMedia, mapEditorialMedia } from '../../../../shared/editorial-media';

export type NewsState='borrador'|'en_revision'|'publicada'|'archivada';
export const NEWS_STATE_LABELS:Record<NewsState,string>={borrador:'Borrador',en_revision:'En revisión',publicada:'Publicada',archivada:'Archivada'};
export interface AdminNewsCategory {id:string;name:string;active:boolean}
export interface AdminNewsArticle {id:string;slug:string;title:string;summary:string;body:string;categoryId:string;categoryName:string;state:NewsState;featured:boolean;cover:string;media:EditorialMedia[];publishedAt:string|null;updatedAt:string}
interface Page<T>{count:number;next:string|null;previous:string|null;results:T[]}
const mapArticle=(row:any):AdminNewsArticle=>{const media=(row.multimedia??[]).map(mapEditorialMedia);return{id:row.id,title:row.titulo,slug:row.slug,summary:row.extracto,body:row.contenido,categoryId:row.categoria,categoryName:row.categoria_nombre??row.category_name??'',state:row.estado_publicacion,featured:row.destacada,cover:row.portada??media.find((item:EditorialMedia)=>item.cover)?.url??'',publishedAt:row.fecha_publicacion??null,updatedAt:row.fecha_actualizacion??row.fecha_creacion,media};};

@Injectable({providedIn:'root'})
export class AdminNewsApiService {
 private readonly http=inject(HttpClient);private readonly base=inject(API_BASE_URL);
 list(state='',page=1,pageSize=10){return this.http.get<Page<any>>(`${this.base}/admin/news/`,{params:{estado_publicacion:state,page,page_size:pageSize}}).pipe(map(value=>({...value,results:value.results.map(mapArticle)} as Page<AdminNewsArticle>)));}
 detail(id:string){return this.http.get<any>(`${this.base}/admin/news/${encodeURIComponent(id)}/`).pipe(map(mapArticle));}
 categories(){return this.http.get<any[]|Page<any>>(`${this.base}/admin/news-categories/`,{params:{page_size:100}}).pipe(map(value=>(Array.isArray(value)?value:value.results).map(row=>({id:row.id,name:row.nombre,active:row.activa} as AdminNewsCategory))));}
 create(value:{title:string;summary:string;body:string;categoryId:string;featured:boolean}){return this.http.post<any>(`${this.base}/admin/news/`,this.payload(value)).pipe(map(mapArticle));}
 update(id:string,value:{title:string;summary:string;body:string;categoryId:string;featured:boolean}){return this.http.patch<any>(`${this.base}/admin/news/${encodeURIComponent(id)}/`,this.payload(value)).pipe(map(mapArticle));}
 transition(id:string,state:NewsState,featured?:boolean){const url=`${this.base}/admin/news/${encodeURIComponent(id)}/`;if(featured===undefined&&state==='publicada')return this.http.post<any>(url+'publish/',{}).pipe(map(mapArticle));if(featured===undefined&&state==='archivada')return this.http.post<any>(url+'archive/',{}).pipe(map(mapArticle));return this.http.patch<any>(url,{estado_publicacion:state,...(featured===undefined?{}:{destacada:featured})}).pipe(map(mapArticle));}
 uploadMedia(newsId:string,file:File,value:{alt:string;description:string;cover:boolean;order:number}){const body=new FormData();body.append('file',file,file.name);body.append('noticia',newsId);body.append('texto_alternativo',value.alt.trim());body.append('descripcion',value.description.trim());body.append('es_portada',String(value.cover));body.append('orden',String(value.order));return this.http.post<any>(`${this.base}/admin/news-media/`,body).pipe(map(mapEditorialMedia));}
 deleteMedia(id:string){return this.http.delete<void>(`${this.base}/admin/news-media/${encodeURIComponent(id)}/`);}
 private payload(value:{title:string;summary:string;body:string;categoryId:string;featured:boolean}){return {titulo:value.title.trim(),extracto:value.summary.trim(),contenido:value.body.trim(),categoria:value.categoryId,destacada:value.featured};}
}

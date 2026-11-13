import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api.config';
import { NewsDemo } from './data/news.demo';
import {publicMediaUrl} from '../../shared/public-media-url';

interface NewsListDto {id:string;slug:string;titulo:string;extracto:string;portada:string|null;categoria_nombre:string;destacada:boolean;fecha_publicacion:string|null;fecha_creacion:string}
interface NewsMediaDto {tipo_archivo:string;ruta_archivo:string;url?:string;url_archivo?:string;texto_alternativo:string|null;descripcion:string|null;orden:number;es_portada:boolean}
interface NewsDetailDto extends NewsListDto {contenido:string;multimedia:NewsMediaDto[]}
interface NewsCategoryDto {id:string;nombre:string;slug:string;activa:boolean}
interface Page<T>{count:number;next:string|null;previous:string|null;results:T[]}
export interface NewsletterActionResponse {estado?:string;message?:string;mensaje?:string}

const date=(value:string|null)=>value?new Intl.DateTimeFormat('es-CO',{day:'2-digit',month:'long',year:'numeric',timeZone:'America/Bogota'}).format(new Date(value)):'';
const article=(value:NewsListDto,index=0):NewsDemo=>({id:value.id,slug:value.slug,title:value.titulo,summary:value.extracto,image:publicMediaUrl(value.portada),category:value.categoria_nombre,date:date(value.fecha_publicacion??value.fecha_creacion),publishedAt:value.fecha_publicacion??value.fecha_creacion,order:index,featured:value.destacada,demo:false});

@Injectable({providedIn:'root'})
export class NewsApiService {
 private readonly http=inject(HttpClient);private readonly base=inject(API_BASE_URL);
 list(){return this.http.get<Page<NewsListDto>>(`${this.base}/public/news/`,{params:{page_size:100}}).pipe(map(value=>value.results.map(article)));}
 categories(){return this.http.get<NewsCategoryDto[]>(`${this.base}/public/news/categories/`).pipe(map(value=>value.filter(item=>item.activa).map(item=>item.nombre)));}
 detail(slug:string){return this.http.get<NewsDetailDto>(`${this.base}/public/news/${encodeURIComponent(slug)}/`).pipe(map(value=>{const mapped=article(value);const cover=value.multimedia.find(item=>item.es_portada)||value.multimedia.find(item=>item.tipo_archivo==='imagen');return {...mapped,content:value.contenido,image:publicMediaUrl(cover?.url||cover?.url_archivo||cover?.ruta_archivo)||mapped.image,imageAlt:cover?.texto_alternativo||value.titulo};}));}
 subscribe(name:string,email:string){return this.http.post<{mensaje?:string;message?:string}>(`${this.base}/public/newsletter/subscribe/`,{nombre:name.trim(),correo:email.trim(),acepta_tratamiento_datos:true});}
 confirmSubscription(token:string){return this.http.post<NewsletterActionResponse>(`${this.base}/public/newsletter-subscriptions/confirm/`,{token});}
 unsubscribe(token:string,email:string){return this.http.post<NewsletterActionResponse>(`${this.base}/public/newsletter-subscriptions/unsubscribe/`,{token,correo:email.trim()});}
}

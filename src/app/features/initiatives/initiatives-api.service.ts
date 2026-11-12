import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api.config';
import { InitiativeDemo } from './data/initiatives.demo';

interface Page<T>{count:number;next:string|null;previous:string|null;results:T[]}
const metric=(items:any[])=>items.slice(0,2).map(item=>`${item.nombre}: ${item.valor}${item.unidad?` ${item.unidad}`:''}`).join(' · ');
const mapInitiative=(row:any):InitiativeDemo=>{const editions=row.ediciones??[],years=editions.map((item:any)=>String(item.anio));return{id:row.id,slug:row.slug,title:row.titulo,summary:row.descripcion_corta??'',description:row.descripcion,image:row.portada??'',imageAlt:row.titulo,category:row.categoria,period:years.length?`Ediciones ${years.join(', ')}`:'Programa permanente',impact:metric(row.metrics??[])||'Indicadores pendientes',coverage:editions.length?`${editions.length} edición(es)`:'Sin ediciones publicadas',year:years[0]??'',years,featured:row.destacada,gallery:(row.multimedia??[]).filter((item:any)=>item.tipo==='imagen').map((item:any)=>({id:item.id,path:item.ruta_archivo,alt:item.texto_alternativo??row.titulo,description:item.descripcion??''})),demo:false};};

@Injectable({providedIn:'root'})
export class InitiativesApiService {
 private readonly http=inject(HttpClient);private readonly base=inject(API_BASE_URL);
 list(){return this.http.get<Page<any>>(`${this.base}/public/initiatives/`,{params:{page_size:100}}).pipe(map(value=>value.results.map(mapInitiative)));}
 categories(){return this.http.get<{categories:string[]}>(`${this.base}/public/initiatives/categories/`).pipe(map(value=>value.categories));}
 detail(slug:string){return this.http.get<any>(`${this.base}/public/initiatives/${encodeURIComponent(slug)}/`).pipe(map(mapInitiative));}
 propose(value:{name:string;phone:string;territory:string;initiative:string;title:string;description:string}){return this.http.post<any>(`${this.base}/public/initiatives/proposals/`,{nombre_contacto:value.name.trim(),telefono_contacto:value.phone.trim(),comunidad_declarada:value.territory.trim(),...(value.initiative?{iniciativa_solicitada:value.initiative}:{}),titulo:value.title.trim(),descripcion:value.description.trim(),acepta_tratamiento_datos:true});}
}

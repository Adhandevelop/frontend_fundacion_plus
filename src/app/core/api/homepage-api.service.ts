import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from './api.config';

export interface HomepageInstitution {
  corporation_name:string;
  acronym:string;
  representative_name?:string;
  representative_role?:string;
  mission?:string;
  image_url?:string;
  url?:string;
  relative_url?:string;
  api_media_url?:string;
  alt_text?:string;
}
export interface HomepageIndicators {
  published_cases_count:number;
  resolved_cases_count:number;
  active_municipalities_count:number;
  active_communities_count:number;
  published_initiatives_count:number;
  completed_activities_count:number;
}
export interface PublicHomepage {
  institution:HomepageInstitution;
  verified_indicators:HomepageIndicators;
  featured_initiatives:unknown[];
  recent_news:unknown[];
  site_settings:Record<string,unknown>;
}
export interface HomepageHero {
  clave:string;
  image_url:string;
  url:string;
  relative_url:string;
  api_media_url:string;
  alt_text:string;
  version:string;
  updated_at:string|null;
  corporation_name?:string;
  acronym?:string;
}

export function homepageImageUrl(value:Pick<HomepageInstitution,'api_media_url'|'relative_url'|'image_url'|'url'>|null|undefined):string {
  const preferred=value?.api_media_url||value?.relative_url||value?.image_url||value?.url||'';
  if(!preferred)return '';
  try {
    const parsed=new URL(preferred,typeof location==='undefined'?'https://fundacionplus.site':location.origin);
    const path=`${parsed.pathname}${parsed.search}`;
    return path.startsWith('/media/')?`/api/v1/public/media/${path.slice('/media/'.length)}`:path;
  } catch {return preferred;}
}

@Injectable({providedIn:'root'})
export class HomepageApiService {
  private readonly http=inject(HttpClient);private readonly base=inject(API_BASE_URL);
  publicHome(){return this.http.get<PublicHomepage>(`${this.base}/public/home/`);}
  hero(){return this.http.get<HomepageHero>(`${this.base}/admin/site/home-hero/`);}
  updateHero(file:File|null,altText:string){const body=new FormData();if(file)body.append('image',file);body.append('alt_text',altText.trim());return this.http.put<HomepageHero>(`${this.base}/admin/site/home-hero/`,body);}
}

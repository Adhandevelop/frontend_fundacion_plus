import assert from 'node:assert/strict';
import { createEnvironmentInjector, PLATFORM_ID, ɵINJECTOR_SCOPE } from '@angular/core';
import { provideHttpClient, withNoXsrfProtection } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../src/app/core/api/api.config';
import { HomepageApiService, homepageImageUrl } from '../src/app/core/api/homepage-api.service';

const env=createEnvironmentInjector([{provide:PLATFORM_ID,useValue:'browser'},{provide:ɵINJECTOR_SCOPE,useValue:'root'},provideHttpClient(withNoXsrfProtection()),provideHttpClientTesting(),{provide:API_BASE_URL,useValue:'/api/v1'},HomepageApiService],undefined as never);
const api=env.get(HomepageApiService),backend=env.get(HttpTestingController);
assert.equal(homepageImageUrl({image_url:'http://fundacionplus.site/media/site/hero/test.jpg?v=1'}),'/api/v1/public/media/site/hero/test.jpg?v=1');assert.equal(homepageImageUrl({image_url:'http://fundacionplus.site/media/old.jpg',api_media_url:'/api/v1/public/media/new.jpg'}),'/api/v1/public/media/new.jpg');
const publicPromise=firstValueFrom(api.publicHome());
backend.expectOne('/api/v1/public/home/').flush({institution:{corporation_name:'Corporación PLUS',acronym:'PLUS',image_url:'/media/site/hero/test.jpg',alt_text:'Equipo PLUS'},verified_indicators:{published_cases_count:2,resolved_cases_count:1,active_municipalities_count:4,active_communities_count:5,published_initiatives_count:3,completed_activities_count:6},featured_initiatives:[],recent_news:[],site_settings:{}});
assert.equal((await publicPromise).verified_indicators.published_cases_count,2);

const heroPromise=firstValueFrom(api.hero());
backend.expectOne('/api/v1/admin/site/home-hero/').flush({clave:'INSTITUTION_HERO',image_url:'/media/site/hero/test.jpg',url:'/media/site/hero/test.jpg',relative_url:'/media/site/hero/test.jpg',api_media_url:'/api/v1/public/media/site/hero/test.jpg',alt_text:'Equipo PLUS',version:'1',updated_at:'2026-11-11T00:00:00Z'});assert.equal((await heroPromise).alt_text,'Equipo PLUS');

const file=new File([new Uint8Array([0xff,0xd8,0xff])],'hero.jpg',{type:'image/jpeg'});
const updatePromise=firstValueFrom(api.updateHero(file,'Representante de PLUS'));
const request=backend.expectOne('/api/v1/admin/site/home-hero/');assert.equal(request.request.method,'PUT');assert.ok(request.request.body instanceof FormData);assert.equal(request.request.body.get('alt_text'),'Representante de PLUS');assert.equal((request.request.body.get('image') as File).name,'hero.jpg');
request.flush({clave:'INSTITUTION_HERO',image_url:'/media/site/hero/new.jpg?v=2',url:'/media/site/hero/new.jpg?v=2',relative_url:'/media/site/hero/new.jpg?v=2',api_media_url:'/api/v1/public/media/site/hero/new.jpg?v=2',alt_text:'Representante de PLUS',version:'2',updated_at:'2026-11-11T01:00:00Z'});assert.equal((await updatePromise).version,'2');
backend.verify();env.destroy();
console.log('Homepage integration checks passed: public institution/verified metrics and protected multipart hero replacement.');

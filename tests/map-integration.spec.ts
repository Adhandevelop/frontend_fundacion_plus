import assert from 'node:assert/strict';
import {createEnvironmentInjector, PLATFORM_ID, ɵINJECTOR_SCOPE} from '@angular/core';
import {provideHttpClient, withNoXsrfProtection} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {firstValueFrom} from 'rxjs';
import {API_BASE_URL} from '../src/app/core/api/api.config';
import {MapCasesApiService} from '../src/app/features/map/map-cases-api.service';

const env=createEnvironmentInjector([{provide:PLATFORM_ID,useValue:'browser'},{provide:ɵINJECTOR_SCOPE,useValue:'root'},provideHttpClient(withNoXsrfProtection()),provideHttpClientTesting(),{provide:API_BASE_URL,useValue:'/api/v1'},MapCasesApiService],undefined as never);
const api=env.get(MapCasesApiService),backend=env.get(HttpTestingController);
const requestPromise=firstValueFrom(api.geojson({search:'quebrada',naturaleza:'problematica',id_departamento:'department-a',id_municipio:'municipality-a',id_estado:'state-a',fecha_desde:'2026-01-01'}));
const request=backend.expectOne(value=>value.url==='/api/v1/public/cases/geojson/');
assert.equal(request.request.params.get('search'),'quebrada');
assert.equal(request.request.params.get('naturaleza'),'problematica');
assert.equal(request.request.params.get('id_departamento'),'department-a');
assert.equal(request.request.params.get('id_municipio'),'municipality-a');
assert.equal(request.request.params.get('id_estado'),'state-a');
assert.equal(request.request.params.get('fecha_desde'),'2026-01-01');
request.flush({type:'FeatureCollection',srid:4326,count:2,features:[
 {type:'Feature',id:'case-a',geometry:{type:'Point',srid:4326,coordinates:['-73.6266','4.142']},properties:{id_caso:'case-a',codigo:'PLUS-2026-00001',radicado_code:'PLUS-2026-00001',titulo:'Caso público',estado:'en_proceso'}},
 {type:'Feature',id:'invalid',geometry:null,properties:{id_caso:'invalid',codigo:'PLUS-INVALID'}},
]});
const collection=await requestPromise;
assert.equal(collection.features.length,1);
assert.deepEqual(collection.features[0].geometry.coordinates,[-73.6266,4.142]);
backend.verify();env.destroy();
console.log('Map integration checks passed: server filters and validated public GeoJSON features.');

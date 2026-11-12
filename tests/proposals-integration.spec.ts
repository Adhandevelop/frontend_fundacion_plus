import assert from 'node:assert/strict';
import { firstValueFrom } from 'rxjs';
import { createEnvironmentInjector, PLATFORM_ID, ɵINJECTOR_SCOPE } from '@angular/core';
import { provideHttpClient, withNoXsrfProtection } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../src/app/core/api/api.config';
import { AdminProposalsApiService } from '../src/app/features/administration/proposals/services/admin-proposals-api.service';

const env=createEnvironmentInjector([{provide:PLATFORM_ID,useValue:'browser'},{provide:ɵINJECTOR_SCOPE,useValue:'root'},provideHttpClient(withNoXsrfProtection()),provideHttpClientTesting(),{provide:API_BASE_URL,useValue:'/api/v1'},AdminProposalsApiService],undefined as never);const api=env.get(AdminProposalsApiService),backend=env.get(HttpTestingController);
const dto={id_propuesta:'proposal-1',titulo:'Encuentro comunitario',descripcion:'Descripción recibida',nombre_contacto:'Persona solicitante',telefono_contacto:'3000000000',comunidad_declarada:'Villavicencio',iniciativa_solicitada:'initiative-1',tipo_actividad:'Encuentro',fecha_sugerida:'2027-02-01',acepta_tratamiento_datos:true,fecha_creacion:'2026-11-12T12:00:00Z',estado:'pendiente',respuesta:'',iniciativa_generada:null};
const listPromise=firstValueFrom(api.list({query:' encuentro ',state:'pendiente',initiativeId:'initiative-1'},2,10));const list=backend.expectOne(request=>request.url==='/api/v1/admin/proposals/');assert.equal(list.request.params.get('search'),'encuentro');assert.equal(list.request.params.get('estado'),'pendiente');assert.equal(list.request.params.get('iniciativa_solicitada'),'initiative-1');assert.equal(list.request.params.get('page'),'2');list.flush({count:1,next:null,previous:null,results:[dto]});assert.equal((await listPromise).results[0].contactName,'Persona solicitante');
const detailPromise=firstValueFrom(api.detail('proposal-1'));backend.expectOne('/api/v1/admin/proposals/proposal-1/').flush(dto);assert.equal((await detailPromise).requestedInitiativeId,'initiative-1');
const reviewPromise=firstValueFrom(api.review('proposal-1','aprobada',' Aprobación institucional ','initiative-2'));const review=backend.expectOne('/api/v1/admin/proposals/proposal-1/');assert.equal(review.request.method,'PATCH');assert.deepEqual(review.request.body,{estado:'aprobada',respuesta:'Aprobación institucional',iniciativa_generada:'initiative-2'});review.flush({...dto,estado:'aprobada',respuesta:'Aprobación institucional',iniciativa_generada:'initiative-2'});assert.equal((await reviewPromise).state,'aprobada');
backend.verify();env.destroy();console.log('Proposal integration checks passed: list, filters, detail and reviewed decisions.');

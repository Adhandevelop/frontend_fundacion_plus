import assert from 'node:assert/strict';
import { createEnvironmentInjector, PLATFORM_ID, runInInjectionContext, ɵINJECTOR_SCOPE } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { provideHttpClient, withInterceptors, withNoXsrfProtection } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AuthService } from '../src/app/core/auth/auth.service';
import { authInterceptor } from '../src/app/core/auth/auth.interceptor';
import { API_BASE_URL } from '../src/app/core/api/api.config';
import { AdminReportsComponent } from '../src/app/features/administration/reports/admin-reports.component';
import { AdminReportApiService } from '../src/app/features/administration/reports/admin-report-api.service';
import { AdminAuditComponent } from '../src/app/features/administration/audit/admin-audit.component';
import { AdminAuditApiService, AuditEvent } from '../src/app/features/administration/audit/admin-audit-api.service';
import { auditCaseId, auditDateMatches, auditMetadata } from '../src/app/features/administration/audit/audit-presentation';

const queryParams=new BehaviorSubject(convertToParamMap({}));
let downloads=0;
const env=createEnvironmentInjector([
  {provide:PLATFORM_ID,useValue:'browser'},{provide:ɵINJECTOR_SCOPE,useValue:'root'},
  provideHttpClient(withInterceptors([authInterceptor]),withNoXsrfProtection()),provideHttpClientTesting(),
  {provide:API_BASE_URL,useValue:'/api/v1'},
  {provide:DOCUMENT,useValue:{createElement:()=>({click:()=>downloads++})}},
  {provide:Router,useValue:{navigate:()=>Promise.resolve(true)}},
  {provide:ActivatedRoute,useValue:{queryParamMap:queryParams,snapshot:{queryParamMap:convertToParamMap({})}}},
  AuthService,AdminReportApiService,AdminAuditApiService,
],undefined as never);
const backend=env.get(HttpTestingController),auth=env.get(AuthService);
const login=firstValueFrom(auth.login('admin@example.invalid','test-only',false));
backend.expectOne('/api/v1/auth/login/').flush({user:{id_usuario:'admin-test',nombres:'Equipo',apellidos:'Prueba',primary_role:'administrador',estado:'activo',permissions:{all:['*']}},tokens:{access:'report-access',refresh:'report-refresh'}});await login;

const report=runInInjectionContext(env,()=>new AdminReportsComponent());
backend.expectOne('/api/v1/catalogs/case-statuses/').flush([]);
backend.expectOne('/api/v1/catalogs/case-types/').flush([]);
const totals={total_cases:25,by_estado:{en_proceso:20,resuelto:5},by_estado_publicacion:{pendiente:3,aprobado:22},by_prioridad:{media:25},by_categoria:{general:25},by_municipio:{Municipio:25}};
const selection={totals,count:25,page:1,page_size:10,results:[]};
let request=backend.expectOne(req=>req.url==='/api/v1/admin/reports/cases/');
assert.equal(request.request.params.get('page_size'),'10');request.flush(selection);
// Indicators represent the complete filtered set, even when the visible page has no rows.
assert.deepEqual(report.metrics().map(item=>item.value),[25,20,5,3]);
assert.equal(report.managementDistribution()[0].percent,80);
report.navigate(1);request=backend.expectOne(req=>req.url==='/api/v1/admin/reports/cases/');
assert.equal(request.request.params.get('page'),'2');request.flush({...selection,page:2});assert.equal(report.metrics()[0].value,25);

report.form.controls.search.setValue('  aplicado  ');report.apply();
request=backend.expectOne(req=>req.url==='/api/v1/admin/reports/cases/');assert.equal(request.request.params.get('search'),'aplicado');assert.equal(request.request.params.get('page'),'1');request.flush(selection);
report.form.controls.search.setValue('sin aplicar');report.download();report.download();
const csv=backend.expectOne('/api/v1/admin/reports/cases/export/?search=aplicado&estado=&estado_publicacion=&prioridad=&id_tipo_caso=&naturaleza=');
assert.equal(csv.request.params.has('page'),false);assert.equal(csv.request.params.has('page_size'),false);
assert.equal(csv.request.responseType,'blob');assert.equal(csv.request.headers.get('Authorization'),'Bearer report-access');
csv.flush(new Blob(['codigo,titulo\n'],{type:'text/csv'}));assert.equal(downloads,1);assert.equal(report.downloading(),false);
// Superseded reads are cancelled; errors never enable exporting stale results.
report.apply();const cancelled=backend.expectOne(req=>req.url==='/api/v1/admin/reports/cases/');report.reset();assert.equal(cancelled.cancelled,true);
request=backend.expectOne(req=>req.url==='/api/v1/admin/reports/cases/');request.flush({},{status:403,statusText:'Forbidden'});assert.ok(report.error());report.download();backend.expectNone(req=>req.url.endsWith('/export/'));
report.load();backend.expectOne(req=>req.url==='/api/v1/admin/reports/cases/').flush({...selection,count:0,results:[],totals:{...totals,total_cases:0,by_estado:{},by_estado_publicacion:{}}});
report.download();backend.expectNone(req=>req.url.endsWith('/export/'));assert.equal(report.pages(),1);

const audit=runInInjectionContext(env,()=>new AdminAuditComponent());
const event:AuditEvent={event_ref:'accesos:550e8400-e29b-41d4-a716-446655440000',source:'auditoria_accesos',action:'login',module:'auth',entity:'usuarios',entity_id:'user-test',actor:'user-test',actor_nombre:'Equipo de prueba',result:'exitoso',description:'Prueba HTTP simulada',changed_columns:null,timestamp:'2026-11-09T04:59:59Z'};
const second:AuditEvent={...event,event_ref:'casos:550e8400-e29b-41d4-a716-446655440001',source:'auditoria_casos',action:'avance',module:'casos',entity:'casos',entity_id:'case-test',timestamp:'2026-11-09T05:00:00Z'};
let auditRequest=backend.expectOne(req=>req.url==='/api/v1/admin/audit-events/');assert.equal(auditRequest.request.params.get('page'),'1');assert.equal(auditRequest.request.params.get('page_size'),'25');auditRequest.flush({count:500,results:[event,second],kpis:{total_events:500}});
assert.equal(audit.filtered().length,2);assert.equal(audit.pages(),20);assert.equal(audit.visible().length,2);
audit.change('query','equipo');assert.equal(audit.filtered().length,2);audit.change('query','sin coincidencia');assert.equal(audit.filtered().length,0);audit.change('query','');
audit.change('action','avance');audit.change('result','exitoso');audit.change('from','2026-11-09');audit.change('to','2026-11-09');audit.apply();auditRequest=backend.expectOne(req=>req.url==='/api/v1/admin/audit-events/');assert.equal(auditRequest.request.params.get('action'),'avance');assert.equal(auditRequest.request.params.get('resultado'),'exitoso');assert.equal(auditRequest.request.params.get('fecha_desde'),'2026-11-09');auditRequest.flush({count:1,results:[second],kpis:{total_events:1}});
audit.change('to','2026-11-08');assert.equal(audit.invalidRange(),true);audit.apply();backend.expectNone(req=>req.url==='/api/v1/admin/audit-events/');assert.ok(audit.error());audit.reset();backend.expectOne(req=>req.url==='/api/v1/admin/audit-events/').flush({count:500,results:[event,second],kpis:{total_events:500}});
assert.equal(auditDateMatches(event,'2026-11-08','2026-11-08'),true);
assert.equal(auditDateMatches(second,'2026-11-09','2026-11-09'),true);
assert.equal(auditCaseId(event),null);assert.equal(auditCaseId(second),'case-test');
audit.navigate(1);auditRequest=backend.expectOne(req=>req.url==='/api/v1/admin/audit-events/');assert.equal(auditRequest.request.params.get('page'),'2');auditRequest.flush({count:500,results:[],kpis:{total_events:500}});audit.page.set(1);

audit.open(event);const detail=backend.expectOne('/api/v1/admin/audit-events/accesos%3A550e8400-e29b-41d4-a716-446655440000/');
detail.flush({tipo_evento:'login',resultado:'exitoso',usuario:'user-test',direccion_ip:'PRIVATE-IP',user_agent:'PRIVATE-AGENT',datos_anteriores:{password:'PRIVATE-PASSWORD'},datos_nuevos:{token:'PRIVATE-TOKEN'}});
assert.equal(audit.fields().length,3);assert.equal(JSON.stringify(audit.fields()).includes('PRIVATE'),false);
assert.deepEqual(auditMetadata({accion:{nested:'PRIVATE'},password:'PRIVATE',datos_nuevos:'PRIVATE'}),[]);
audit.open(event);const obsolete=backend.expectOne(req=>req.url.includes('/accesos%3A'));audit.open(second);assert.equal(obsolete.cancelled,true);
const current=backend.expectOne(req=>req.url.includes('/casos%3A'));current.flush({tipo_accion:'avance',caso:'case-test'});assert.equal(audit.selected()?.event_ref,second.event_ref);
audit.open(second);const hidden=backend.expectOne(req=>req.url.includes('/casos%3A'));audit.changeSource('seguridad');assert.equal(hidden.cancelled,true);assert.equal(audit.selected(),null);
const source=backend.expectOne(req=>req.url==='/api/v1/admin/audit-events/');assert.equal(source.request.params.get('source'),'seguridad');assert.equal(source.request.params.get('page_size'),'25');source.flush({count:0,results:[],kpis:{total_events:500}});assert.equal(audit.filtered().length,0);
const invalid=await firstValueFrom(env.get(AdminAuditApiService).detail('../users/')).catch(error=>error);assert.ok(invalid instanceof Error);backend.expectNone(req=>req.url.includes('../users/'));
audit.load();backend.expectOne(req=>req.url==='/api/v1/admin/audit-events/'&&req.params.get('source')==='seguridad').flush({},{status:403,statusText:'Forbidden'});assert.ok(audit.error());
backend.expectNone(req=>req.method!=='GET');backend.verify();env.destroy();
console.log('Reports/audit checks passed: whole-selection totals/CSV, server-side audit paging/filters, Bogotá dates, safe metadata and cancelled stale reads.');

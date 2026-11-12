import assert from 'node:assert/strict';
import { createEnvironmentInjector, PLATFORM_ID, runInInjectionContext, ɵINJECTOR_SCOPE } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors, withNoXsrfProtection } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../src/app/core/auth/auth.service';
import { authInterceptor } from '../src/app/core/auth/auth.interceptor';
import { API_BASE_URL } from '../src/app/core/api/api.config';
import { AccountApiService } from '../src/app/core/api/account-api.service';
import { CitizenCasesApiService } from '../src/app/features/citizen/services/citizen-cases-api.service';
import { CaseSubmissionService } from '../src/app/features/citizen/services/case-submission.service';
import { CaseDraftService } from '../src/app/features/citizen/services/case-draft.service';
import { EMPTY_INTAKE } from '../src/app/features/citizen/intake/intake-view.model';
import { CaseIntakeComponent } from '../src/app/features/citizen/intake/case-intake.component';
import { CitizenCaseTableComponent } from '../src/app/features/citizen/components/case-table/case-table.component';

function storage(){const values=new Map();return{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)};}
Object.assign(globalThis,{localStorage:storage(),sessionStorage:storage()});
const navigations:unknown[]=[];
const env=createEnvironmentInjector([{provide:PLATFORM_ID,useValue:'browser'},{provide:ɵINJECTOR_SCOPE,useValue:'root'},provideHttpClient(withInterceptors([authInterceptor]),withNoXsrfProtection()),provideHttpClientTesting(),{provide:API_BASE_URL,useValue:'/api/v1'},{provide:Router,useValue:{navigate:(...args:unknown[])=>{navigations.push(args);return Promise.resolve(true);}}},AuthService,AccountApiService,CitizenCasesApiService,CaseSubmissionService,CaseDraftService],undefined as never);
const auth=env.get(AuthService),backend=env.get(HttpTestingController),api=env.get(CitizenCasesApiService),submission=env.get(CaseSubmissionService),drafts=env.get(CaseDraftService);
const user={id_usuario:'550e8400-e29b-41d4-a716-446655440000',nombres:'Persona',apellidos:'Prueba',full_name:'Persona Prueba',correo:'persona@example.invalid',telefono:null,estado:'activo' as const,primary_role:'ciudadano',rol_nombre:'ciudadano',permissions:{casos:['crear','ver_propios']},perfil:null,preferencias:null};
const login=firstValueFrom(auth.login(user.correo,'test-only',false));backend.expectOne('/api/v1/auth/login/').flush({user,tokens:{access:'test-access',refresh:'test-refresh'}});await login;
const caso={id_caso:'880e8400-e29b-41d4-a716-446655440000',codigo:'PLUS-TEST-00001',titulo:'Caso de prueba automatizada',descripcion:'Solo existe en HttpTestingController.',tipo_nombre:'Infraestructura',comunidad_nombre:'Comunidad de prueba',municipio_nombre:'Municipio de prueba',departamento_nombre:'Departamento de prueba',estado_nombre:'pendiente',estado_publicacion:'pendiente',prioridad:'media',familias_afectadas:0,meses_afectacion:0,direccion_referencia:null,resultado_resumen:null,fecha_creacion:'2026-11-09T08:00:00Z',fecha_actualizacion:'2026-11-09T08:00:00Z',active_correction_request:null,solicitudes_correccion:[],active_assignment:null,seguimientos:[],evidencias:[],aportes:[],allowed_actions:['view','contribute','upload_evidence']};
const payload={titulo:caso.titulo,descripcion:caso.descripcion,id_tipo_caso:'b10e8400-e29b-41d4-a716-446655440000',id_comunidad:'660e8400-e29b-41d4-a716-446655440000',prioridad:'media',familias_afectadas:0,meses_afectacion:0,acepta_tratamiento_datos:true,latitud:0,longitud:0};

// Filtering/paging uses actual supported backend query parameters.
const listed=firstValueFrom(api.list({page:2,page_size:5,search:'PLUS-',estado:'pendiente',estado_publicacion:'pendiente'}));
const list=backend.expectOne(request=>request.url==='/api/v1/me/cases/');
assert.equal(list.request.params.get('page'),'2');assert.equal(list.request.params.get('estado'),'pendiente');assert.equal(list.request.params.get('search'),'PLUS-');
list.flush({count:6,next:null,previous:'previous',results:[caso]});assert.equal((await listed).count,6);
const detail=firstValueFrom(api.detail(caso.codigo));backend.expectOne('/api/v1/me/cases/PLUS-TEST-00001/').flush(caso);assert.equal((await detail).id_caso,caso.id_caso);
const history=firstValueFrom(api.history(caso.id_caso));backend.expectOne(`/api/v1/me/cases/${caso.id_caso}/history/`).flush({id_caso:caso.id_caso,codigo:caso.codigo,seguimientos:[],historial_estados:[]});assert.deepEqual((await history).historial_estados,[]);
const stats=firstValueFrom(api.dashboard());backend.expectOne('/api/v1/me/dashboard/').flush({total_cases:0,pendientes_publicacion:0,en_gestion:0,resueltos_o_cerrados:0});assert.equal((await stats).total_cases,0);
const followedRow={id:'follow-uuid',id_seguimiento_usuario:'follow-uuid',id_caso:caso.id_caso,codigo:caso.codigo,titulo:caso.titulo,activo:true,fecha_creacion:'2026-11-12T10:00:00Z',fecha_baja:null};
const followed=firstValueFrom(api.followedCases());backend.expectOne('/api/v1/me/followed-cases/').flush([followedRow]);assert.equal((await followed)[0].codigo,caso.codigo);
const follow=firstValueFrom(api.follow(caso.id_caso));const followRequest=backend.expectOne(`/api/v1/me/followed-cases/${caso.id_caso}/`);assert.equal(followRequest.request.method,'PUT');assert.deepEqual(followRequest.request.body,{});followRequest.flush(followedRow);await follow;
const unfollow=firstValueFrom(api.unfollow(caso.id_caso));const unfollowRequest=backend.expectOne(`/api/v1/me/followed-cases/${caso.id_caso}/`);assert.equal(unfollowRequest.request.method,'DELETE');unfollowRequest.flush(null,{status:204,statusText:'No Content'});await unfollow;
const contribution=firstValueFrom(api.contribute(caso.id_caso,'Información de prueba','correction-uuid'));
const contributionRequest=backend.expectOne(`/api/v1/me/cases/${caso.id_caso}/contributions/`);assert.deepEqual(contributionRequest.request.body,{contenido:'Información de prueba',id_solicitud_correccion:'correction-uuid'});contributionRequest.flush({id_aporte:'contribution-uuid'});await contribution;
const download=firstValueFrom(api.download(caso.id_caso,'evidence-uuid'));
const downloadRequest=backend.expectOne(request=>request.url.endsWith('/evidence/evidence-uuid/download/'));
assert.equal(downloadRequest.request.responseType,'blob');assert.equal(downloadRequest.request.params.get('download'),'1');assert.equal(downloadRequest.request.headers.get('Authorization'),'Bearer test-access');downloadRequest.flush(new Blob(['test']));assert.equal((await download).size,4);

function file(name:string){const value=new Blob(['test-file'],{type:'application/pdf'});Object.defineProperty(value,'name',{value:name});return value as File;}
const files=[file('one.pdf'),file('two.pdf'),file('three.pdf')];
drafts.save({...EMPTY_INTAKE,title:'Borrador propio'},files);
const submitted=firstValueFrom(submission.submit(payload,files));
const create=backend.expectOne('/api/v1/me/cases/');assert.equal(create.request.method,'POST');assert.equal(create.request.body.latitud,0);assert.equal(create.request.body.longitud,0);assert.equal(create.request.body.id_comunidad,payload.id_comunidad);assert.equal('departamento' in create.request.body,false);create.flush(caso);
assert.equal(submission.receipt()?.caso.codigo,caso.codigo);assert.equal(drafts.draft(),null);
for(let index=0;index<files.length;index++){
 const upload=backend.expectOne(`/api/v1/me/cases/${caso.id_caso}/evidence/`);
 assert.equal(upload.request.method,'POST');assert.ok(upload.request.body instanceof FormData);assert.ok(upload.request.body.get('file') instanceof Blob);assert.equal(upload.request.headers.has('Content-Type'),false);
 if(index===1)upload.flush({errors:{file:['Archivo rechazado.']}},{status:400,statusText:'Bad Request'});else upload.flush({id_evidencia:`evidence-${index}`});
}
assert.equal((await submitted).codigo,caso.codigo);assert.deepEqual(submission.receipt()?.attachments.map(item=>item.uploaded),[true,false,true]);assert.equal(submission.receipt()?.attachments[1].error,'Archivo rechazado.');backend.expectNone('/api/v1/me/cases/');

// A second account must never see the previous owner's drafts or receipt.
drafts.save({...EMPTY_INTAKE,title:'Privado'},[]);auth.updateUser({...user,id_usuario:'another-user'});assert.equal(drafts.draft(),null);assert.equal(submission.receipt(),null);auth.updateUser(user);drafts.clear();submission.clear();
const invalid=firstValueFrom(submission.submit(payload,files)).catch(error=>error);backend.expectOne('/api/v1/me/cases/').flush({errors:{id_comunidad:['Inválida']}},{status:400,statusText:'Bad Request'});assert.equal((await invalid).status,400);assert.equal(submission.receipt(),null);backend.expectNone(request=>request.url.includes('/evidence/'));
const empty=firstValueFrom(submission.submit(payload,[]));backend.expectOne('/api/v1/me/cases/').flush(caso);assert.equal((await empty).codigo,caso.codigo);assert.deepEqual(submission.receipt()?.attachments,[]);submission.clear();

// Cancelled uploads preserve the known radicado and never recreate it.
const interrupted=submission.submit(payload,[file('pending.pdf')]).subscribe();backend.expectOne('/api/v1/me/cases/').flush(caso);const interruptedUpload=backend.expectOne(`/api/v1/me/cases/${caso.id_caso}/evidence/`);interrupted.unsubscribe();assert.ok(interruptedUpload.cancelled);assert.equal(submission.receipt()?.caso.codigo,caso.codigo);assert.equal(submission.receipt()?.attachments[0].uploaded,false);submission.clear();

// Real form: empty catalogs, hierarchy resets, consent and duplicate-submit prevention.
const intake=runInInjectionContext(env,()=>new CaseIntakeComponent());
backend.expectOne('/api/v1/catalogs/case-types/').flush([]);backend.expectOne('/api/v1/catalogs/departments/').flush([]);assert.equal(intake.loading(),false);assert.deepEqual(intake.types(),[]);assert.deepEqual(intake.departments(),[]);
intake.loadCatalogs();backend.expectOne('/api/v1/catalogs/case-types/').flush([{id_tipo_caso:payload.id_tipo_caso,nombre:'Infraestructura',categoria:'general',naturaleza:'problematica',activo:true}]);backend.expectOne('/api/v1/catalogs/departments/').flush([{id_departamento:'department-uuid',nombre:'Departamento'}]);
intake.form.patchValue({title:'Situación de prueba',description:'Descripción de prueba',category:payload.id_tipo_caso,department:'department-uuid'});intake.changeDepartment();
backend.expectOne(request=>request.url.endsWith('/municipalities/') && request.params.get('id_departamento')==='department-uuid').flush([{id_municipio:'municipality-uuid',id_departamento:'department-uuid',nombre:'Municipio'}]);
intake.form.controls.municipality.setValue('municipality-uuid');intake.changeMunicipality();
backend.expectOne(request=>request.url.endsWith('/communities/') && request.params.get('id_municipio')==='municipality-uuid').flush([{id_comunidad:payload.id_comunidad,id_municipio:'municipality-uuid',nombre:'Comunidad'}]);
intake.form.controls.community.setValue(payload.id_comunidad);intake.submit();backend.expectNone('/api/v1/me/cases/');assert.ok(intake.message().includes('autorizar'));
intake.truth.set(true);intake.consent.set(true);intake.submit();intake.submit();
const actualCreate=backend.expectOne('/api/v1/me/cases/');assert.equal(actualCreate.request.body.acepta_tratamiento_datos,true);assert.equal(actualCreate.request.body.id_tipo_caso,payload.id_tipo_caso);assert.equal('latitud' in actualCreate.request.body,false);actualCreate.flush(caso);assert.equal(intake.pending(),false);assert.ok(navigations.some((value:any)=>value[0][0]==='/ciudadano/casos/confirmacion'));
intake.submit();backend.expectNone('/api/v1/me/cases/'); // Do not recreate while navigation to confirmation completes.
// The constructor of another intake starts blank, not with the submitted case.
const another=runInInjectionContext(env,()=>new CaseIntakeComponent());backend.expectOne('/api/v1/catalogs/case-types/').flush([]);backend.expectOne('/api/v1/catalogs/departments/').flush([]);assert.equal(another.form.controls.title.value,'');
another.types.set(intake.types());another.departments.set(intake.departments());another.municipalities.set(intake.municipalities());another.communities.set(intake.communities());another.form.reset(intake.form.getRawValue());another.truth.set(true);another.consent.set(true);
another.submit();backend.expectOne('/api/v1/me/cases/').flush({},{status:500,statusText:'Server error'});assert.equal(another.uncertain(),true);another.submit();backend.expectNone('/api/v1/me/cases/');

// The list has a genuine empty state, not a fallback to fake cases.
const table=runInInjectionContext(env,()=>new CitizenCaseTableComponent());backend.expectOne(request=>request.url==='/api/v1/me/cases/').flush({count:0,next:null,previous:null,results:[]});backend.expectOne('/api/v1/catalogs/case-statuses/').flush([]);assert.equal(table.result().count,0);assert.deepEqual(table.result().results,[]);assert.equal(table.pages(),1);
table.filter('status','en_proceso');const filtered=backend.expectOne(request=>request.url==='/api/v1/me/cases/');assert.equal(filtered.request.params.get('estado'),'en_proceso');filtered.flush({count:1,next:null,previous:null,results:[caso]});assert.equal(table.result().results.length,1);
backend.verify();env.destroy();
console.log('Citizen cases checks passed: paging, followed cases, real form, consent, ownership isolation, partial uploads, protected downloads, contributions and empty states.');

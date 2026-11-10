import assert from 'node:assert/strict';
import { createEnvironmentInjector, PLATFORM_ID, runInInjectionContext, ɵINJECTOR_SCOPE } from '@angular/core';
import { provideHttpClient, withInterceptors, withNoXsrfProtection } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AuthService } from '../src/app/core/auth/auth.service';
import { authInterceptor } from '../src/app/core/auth/auth.interceptor';
import { API_BASE_URL } from '../src/app/core/api/api.config';
import { AdminTerritoriesApiService } from '../src/app/features/administration/territories/admin-territories-api.service';
import { CommunitiesListComponent } from '../src/app/features/administration/territories/communities-list.component';
import { CommunityDetailComponent } from '../src/app/features/administration/territories/community-detail.component';
import { CommunityEditorComponent } from '../src/app/features/administration/territories/community-editor.component';

const params=new BehaviorSubject(convertToParamMap({id:'community-a'}));
const destinations:unknown[]=[];
const env=createEnvironmentInjector([
  {provide:PLATFORM_ID,useValue:'browser'},{provide:ɵINJECTOR_SCOPE,useValue:'root'},
  provideHttpClient(withInterceptors([authInterceptor]),withNoXsrfProtection()),provideHttpClientTesting(),
  {provide:API_BASE_URL,useValue:'/api/v1'},
  {provide:Router,useValue:{navigate:(target:unknown)=>{destinations.push(target);return Promise.resolve(false);}}},
  {provide:ActivatedRoute,useValue:{paramMap:params}},AuthService,AdminTerritoriesApiService,
],undefined as never);
const backend=env.get(HttpTestingController),auth=env.get(AuthService);
async function login(role:string){
  auth.clear();const promise=firstValueFrom(auth.login('staff@example.invalid','test-only',false));
  backend.expectOne('/api/v1/auth/login/').flush({user:{id_usuario:'staff-test',primary_role:role,estado:'activo',permissions:{all:['*']}},tokens:{access:'territory-access',refresh:'territory-refresh'}});await promise;
}
await login('administrador');
const departments=[{id_departamento:'department-a',nombre:'Departamento A'},{id_departamento:'department-b',nombre:'Departamento B'}];
const municipalities=[{id_municipio:'municipality-a',id_departamento:'department-a',nombre:'Municipio A',departamento_nombre:'Departamento A',codigo_dane:'01001'},{id_municipio:'municipality-b',id_departamento:'department-b',nombre:'Municipio B',departamento_nombre:'Departamento B',codigo_dane:'02001'}];
const row={id_comunidad:'community-a',id_municipio:'municipality-a',municipio_nombre:'Municipio A',nombre:'Comunidad de pruebas HTTP',tipo:'vereda',tipo_display:'Vereda',descripcion:'Texto sintético',activo:true,ubicacion:{type:'MultiPolygon',coordinates:[]}};
const list=runInInjectionContext(env,()=>new CommunitiesListComponent());
backend.expectOne('/api/v1/catalogs/municipalities/').flush(municipalities);
let request=backend.expectOne(req=>req.url==='/api/v1/admin/communities/');request.flush({count:0,results:[]});assert.equal(list.pages(),1);
list.form.setValue({municipio:'municipality-a',tipo:'vereda',activo:'false'});list.apply();
request=backend.expectOne(req=>req.url==='/api/v1/admin/communities/');assert.equal(request.request.params.get('activo'),'false');assert.equal(request.request.params.get('municipio'),'municipality-a');assert.equal(request.request.params.get('tipo'),'vereda');assert.equal(request.request.params.has('search'),false);request.flush({count:25,results:[row]});assert.equal(list.pages(),3);
list.navigate(1);request=backend.expectOne(req=>req.url==='/api/v1/admin/communities/');assert.equal(request.request.params.get('page'),'2');request.flush({},{status:404,statusText:'Not found'});
request=backend.expectOne(req=>req.url==='/api/v1/admin/communities/');assert.equal(request.request.params.get('page'),'1');request.flush({count:0,results:[]});
list.reset();const obsolete=backend.expectOne(req=>req.url==='/api/v1/admin/communities/');list.load();assert.equal(obsolete.cancelled,true);backend.expectOne(req=>req.url==='/api/v1/admin/communities/').flush({},{status:403,statusText:'Forbidden'});assert.ok(list.error());

const detail=runInInjectionContext(env,()=>new CommunityDetailComponent());backend.expectOne('/api/v1/admin/communities/community-a/').flush(row);
detail.prepareState();backend.expectNone(req=>req.method==='PATCH');assert.equal(detail.review()?.active,false);
detail.changeState();detail.changeState();request=backend.expectOne('/api/v1/admin/communities/community-a/');assert.equal(request.request.method,'PATCH');assert.deepEqual(request.request.body,{activo:false});request.flush({...row,activo:false});
backend.expectOne('/api/v1/admin/communities/community-a/').flush({...row,activo:false});assert.equal(detail.saving(),false);assert.equal(detail.record()?.activo,false);
detail.prepareState();detail.changeState();backend.expectOne('/api/v1/admin/communities/community-a/').flush({},{status:500,statusText:'Server error'});assert.equal(detail.uncertain(),true);detail.prepareState();detail.changeState();backend.expectNone(req=>req.method==='PATCH');
detail.load();backend.expectOne('/api/v1/admin/communities/community-a/').flush(row);assert.equal(detail.uncertain(),false);
detail.prepareState();detail.changeState();const late=backend.expectOne('/api/v1/admin/communities/community-a/');params.next(convertToParamMap({id:'community-b'}));backend.expectOne('/api/v1/admin/communities/community-b/').flush({...row,id_comunidad:'community-b'});late.flush({...row,activo:false});assert.equal(detail.record()?.id_comunidad,'community-b');assert.equal(detail.record()?.activo,true);

const editorParams=new BehaviorSubject(convertToParamMap({}));
const editorEnv=createEnvironmentInjector([{provide:ActivatedRoute,useValue:{paramMap:editorParams}}],env);
const editor=runInInjectionContext(editorEnv,()=>new CommunityEditorComponent());
function catalogs(empty=false){backend.expectOne('/api/v1/catalogs/departments/').flush(empty?[]:departments);backend.expectOne('/api/v1/catalogs/municipalities/').flush(empty?[]:municipalities);}
catalogs(true);editor.form.setValue({municipalityId:'invented',name:'Nombre',type:'vereda',description:''});editor.save();assert.equal(editor.review(),null);backend.expectNone(req=>req.method==='POST');
editor.load();catalogs();editor.changeDepartment('department-a');editor.form.setValue({municipalityId:'municipality-b',name:'Nombre',type:'vereda',description:''});editor.save();assert.equal(editor.review(),null); // Must belong to the selected department.
editor.form.setValue({municipalityId:'municipality-a',name:'  Comunidad nueva  ',type:'barrio',description:'  Descripción  '});editor.save();backend.expectNone(req=>req.method==='POST');assert.equal(editor.review()?.payload.nombre,'Comunidad nueva');
editor.cancel();backend.expectNone(req=>req.method==='POST');editor.save();editor.form.controls.name.setValue('Edición posterior');editor.confirm();editor.confirm();
request=backend.expectOne('/api/v1/admin/communities/');assert.equal(request.request.method,'POST');assert.deepEqual(request.request.body,{id_municipio:'municipality-a',nombre:'Comunidad nueva',tipo:'barrio',descripcion:'Descripción'});assert.equal(request.request.headers.get('Authorization'),'Bearer territory-access');request.flush({...row,id_comunidad:'created-test'},{status:201,statusText:'Created'});
assert.equal(editor.completed(),true);assert.equal(editor.saving(),false);assert.equal(destinations.length,1);editor.save();editor.confirm();backend.expectNone(req=>req.method==='POST'); // Navigation returning false cannot allow a duplicate creation.

editorParams.next(convertToParamMap({id:'community-a'}));catalogs();backend.expectOne('/api/v1/admin/communities/community-a/').flush(row);assert.equal(editor.departmentId(),'department-a');
editor.form.controls.name.setValue('Nombre modificado');editor.save();editor.confirm();request=backend.expectOne('/api/v1/admin/communities/community-a/');assert.equal(request.request.method,'PATCH');assert.equal('ubicacion' in request.request.body,false);assert.equal('activo' in request.request.body,false);request.flush({},{status:400,statusText:'Bad request'});assert.equal(editor.uncertain(),false);assert.equal(editor.form.controls.name.value,'Nombre modificado');
editor.save();editor.confirm();backend.expectOne('/api/v1/admin/communities/community-a/').flush({},{status:500,statusText:'Server error'});assert.equal(editor.uncertain(),true);editor.save();editor.confirm();editor.load();backend.expectNone(req=>req.method!=='GET');
// Route changes cancel old reads; late writes never redirect away from the new editor.
editorParams.next(convertToParamMap({id:'community-a'}));catalogs();backend.expectOne('/api/v1/admin/communities/community-a/').flush(row);editor.save();editor.confirm();const oldWrite=backend.expectOne('/api/v1/admin/communities/community-a/');
editorParams.next(convertToParamMap({id:'community-b'}));catalogs();backend.expectOne('/api/v1/admin/communities/community-b/').flush({...row,id_comunidad:'community-b'});oldWrite.flush(row);assert.equal(editor.record()?.id_comunidad,'community-b');assert.equal(destinations.length,1);
await login('representante');assert.equal(editor.canManage(),false);assert.equal(detail.canManage(),false);editor.save();editor.confirm();detail.prepareState();detail.changeState();backend.expectNone(req=>req.method!=='GET');
await login('moderador');assert.equal(editor.canManage(),false);assert.equal(detail.canManage(),false);assert.equal(list.canManage(),false);
backend.verify();editorEnv.destroy();env.destroy();
console.log('Territory checks passed: real filters/paging, catalog validation, review before writes, geometry preservation, uncertain saves, role restrictions and late-response isolation.');

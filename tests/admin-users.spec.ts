import assert from 'node:assert/strict';
import { createEnvironmentInjector, PLATFORM_ID, runInInjectionContext, ɵINJECTOR_SCOPE } from '@angular/core';
import { provideHttpClient, withInterceptors, withNoXsrfProtection } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AuthService } from '../src/app/core/auth/auth.service';
import { authInterceptor } from '../src/app/core/auth/auth.interceptor';
import { API_BASE_URL } from '../src/app/core/api/api.config';
import { AdminUsersApiService } from '../src/app/features/administration/users/admin-users-api.service';
import { UsersListComponent } from '../src/app/features/administration/users/users-list.component';
import { UserDetailComponent } from '../src/app/features/administration/users/user-detail.component';
import { UserEditorComponent } from '../src/app/features/administration/users/user-editor.component';
import { RolesReferenceComponent } from '../src/app/features/administration/users/roles-reference.component';

const params=new BehaviorSubject(convertToParamMap({id:'person-a'}));const destinations:unknown[]=[];
const env=createEnvironmentInjector([
  {provide:PLATFORM_ID,useValue:'browser'},{provide:ɵINJECTOR_SCOPE,useValue:'root'},
  provideHttpClient(withInterceptors([authInterceptor]),withNoXsrfProtection()),provideHttpClientTesting(),
  {provide:API_BASE_URL,useValue:'/api/v1'},
  {provide:Router,useValue:{navigate:(target:unknown)=>{destinations.push(target);return Promise.resolve(false);}}},
  {provide:ActivatedRoute,useValue:{paramMap:params}},AuthService,AdminUsersApiService,
],undefined as never);
const backend=env.get(HttpTestingController),auth=env.get(AuthService),api=env.get(AdminUsersApiService);
async function login(role:string){auth.clear();const pending=firstValueFrom(auth.login('staff@example.invalid','test-only',false));backend.expectOne('/api/v1/auth/login/').flush({user:{id_usuario:'operator',primary_role:role,estado:'activo',permissions:{all:['*']}},tokens:{access:'users-access',refresh:'users-refresh'}});await pending;}
await login('administrador');
const roles=[{id_rol:'role-citizen',nombre:'ciudadano',descripcion:'Cuenta ciudadana',assignable:true},{id_rol:'role-admin',nombre:'administrador',descripcion:'Administración',assignable:true},{id_rol:'role-future',nombre:'unknown',descripcion:'Fuera del contrato',assignable:true},{id_rol:'role-restricted',nombre:'moderador',descripcion:'No asignable',assignable:false}];
function flushRoles(){backend.expectOne('/api/v1/admin/roles/?page_size=100').flush({count:roles.length,results:roles});}
const row={id_usuario:'person-a',id_rol:'role-citizen',nombres:'Persona',apellidos:'Prueba',correo:'person@example.invalid',telefono:null,estado:'activo',primary_role:'ciudadano',fecha_registro:'2026-11-09T10:00:00Z',fecha_actualizacion:'2026-11-09T10:00:00Z'};
const list=runInInjectionContext(env,()=>new UsersListComponent());flushRoles();backend.expectOne(req=>req.url==='/api/v1/admin/users/').flush({count:0,results:[]});assert.equal(list.pages(),1);
list.form.setValue({search:'  Persona  ',id_rol:'role-citizen',estado:'suspendido'});list.apply();let request=backend.expectOne(req=>req.url==='/api/v1/admin/users/');assert.equal(request.request.params.get('search'),'Persona');assert.equal(request.request.params.get('id_rol'),'role-citizen');assert.equal(request.request.params.get('estado'),'suspendido');assert.equal(request.request.params.get('page_size'),'10');request.flush({count:25,results:[row]});assert.equal(list.pages(),3);
list.navigate(1);request=backend.expectOne(req=>req.url==='/api/v1/admin/users/');assert.equal(request.request.params.get('page'),'2');request.flush({},{status:404,statusText:'Not found'});backend.expectOne(req=>req.url==='/api/v1/admin/users/').flush({count:0,results:[]});assert.equal(list.page(),1);
const detail=runInInjectionContext(env,()=>new UserDetailComponent());
function loadUser(value:any=row){backend.expectOne('/api/v1/admin/users/'+value.id_usuario+'/').flush(value);flushRoles();}
loadUser();assert.equal(detail.assignable().length,2);
detail.form.controls.state.setValue('suspendido');detail.prepare('status');assert.equal(detail.review(),null);
detail.form.controls.reason.setValue('Motivo sintético de suspensión');detail.prepare('status');backend.expectNone(req=>req.method==='PATCH');detail.confirm();detail.confirm();request=backend.expectOne('/api/v1/admin/users/person-a/status/');assert.equal(request.request.method,'PATCH');assert.deepEqual(request.request.body,{estado:'suspendido',motivo:'Motivo sintético de suspensión'});request.flush({});loadUser({...row,estado:'suspendido'});assert.equal(detail.saving(),false);assert.equal(detail.user()?.estado,'suspendido');
detail.form.setValue({role:'role-future',state:'suspendido',reason:'Motivo de prueba'});detail.prepare('role');assert.equal(detail.review(),null);
detail.form.controls.role.setValue('role-admin');detail.prepare('role');assert.equal(detail.review()?.target,'administrador');detail.confirm();request=backend.expectOne('/api/v1/admin/users/person-a/role/');assert.equal(request.request.method,'PUT');assert.deepEqual(request.request.body,{id_rol:'role-admin',motivo:'Motivo de prueba'});request.flush({});loadUser({...row,id_rol:'role-admin',primary_role:'administrador'});
detail.form.setValue({role:'role-citizen',state:'inactivo',reason:'Motivo de prueba'});detail.prepare('status');detail.confirm();backend.expectOne('/api/v1/admin/users/person-a/status/').flush({},{status:500,statusText:'Server error'});assert.equal(detail.uncertain(),true);detail.prepare('role');detail.confirm();backend.expectNone(req=>req.method!=='GET');
detail.load();loadUser();detail.form.setValue({role:'role-admin',state:'activo',reason:'Motivo de prueba'});detail.prepare('role');detail.confirm();const oldAction=backend.expectOne('/api/v1/admin/users/person-a/role/');params.next(convertToParamMap({id:'person-b'}));loadUser({...row,id_usuario:'person-b'});oldAction.flush({});assert.equal(detail.user()?.id_usuario,'person-b');backend.expectNone('/api/v1/admin/users/person-a/');
params.next(convertToParamMap({id:'operator'}));loadUser({...row,id_usuario:'operator',primary_role:'administrador',id_rol:'role-admin'});assert.equal(detail.canEdit(),false);detail.form.controls.reason.setValue('No debe cambiarse a sí mismo');detail.prepare('status');detail.confirm();backend.expectNone(req=>req.method!=='GET');

const editorParams=new BehaviorSubject(convertToParamMap({}));const editorEnv=createEnvironmentInjector([{provide:ActivatedRoute,useValue:{paramMap:editorParams}}],env);
const editor=runInInjectionContext(editorEnv,()=>new UserEditorComponent());flushRoles();assert.equal(editor.assignable().length,2);
const contact={nombres:'Nueva',apellidos:'Persona',correo:'new@example.invalid',telefono:'1234'};
editor.form.patchValue({...contact,id_rol:'role-future',password:'test-only-pass',passwordConfirm:'test-only-pass'});editor.save();assert.equal(editor.review(),null);
editor.form.controls.id_rol.setValue('role-citizen');editor.form.controls.passwordConfirm.setValue('different');editor.save();assert.equal(editor.review(),null);
editor.form.controls.passwordConfirm.setValue('test-only-pass');editor.save();backend.expectNone(req=>req.method==='POST');assert.equal(JSON.stringify(editor.review()).includes('test-only-pass'),false);
editor.form.controls.password.setValue('changed-after-review');editor.confirm();editor.confirm();request=backend.expectOne('/api/v1/admin/users/');assert.equal(request.request.method,'POST');assert.deepEqual(request.request.body,{...contact,id_rol:'role-citizen',password:'test-only-pass',estado:'activo'});request.flush({...row,id_usuario:'created-person'},{status:201,statusText:'Created'});assert.equal(editor.completed(),true);assert.equal(editor.form.controls.password.value,'');assert.equal(editor.form.controls.passwordConfirm.value,'');assert.equal(destinations.length,1);editor.save();editor.confirm();backend.expectNone(req=>req.method==='POST');
editorParams.next(convertToParamMap({id:'person-a'}));flushRoles();backend.expectOne('/api/v1/admin/users/person-a/').flush(row);
editor.form.patchValue({...contact,id_rol:'role-admin',password:'must-not-be-sent',passwordConfirm:'must-not-be-sent'});editor.save();editor.confirm();request=backend.expectOne('/api/v1/admin/users/person-a/');assert.equal(request.request.method,'PATCH');assert.deepEqual(request.request.body,contact);request.flush({},{status:400,statusText:'Bad request'});assert.equal(editor.uncertain(),false);assert.equal(editor.form.controls.password.value,'');assert.equal(editor.form.controls.nombres.value,contact.nombres);
editor.save();editor.confirm();backend.expectOne('/api/v1/admin/users/person-a/').flush({},{status:500,statusText:'Server error'});assert.equal(editor.uncertain(),true);editor.save();editor.confirm();backend.expectNone(req=>req.method!=='GET');
editorParams.next(convertToParamMap({id:'person-a'}));flushRoles();backend.expectOne('/api/v1/admin/users/person-a/').flush(row);editor.save();editor.confirm();const oldSave=backend.expectOne('/api/v1/admin/users/person-a/');editorParams.next(convertToParamMap({id:'person-b'}));flushRoles();backend.expectOne('/api/v1/admin/users/person-b/').flush({...row,id_usuario:'person-b'});oldSave.flush(row);assert.equal(editor.user()?.id_usuario,'person-b');assert.equal(destinations.length,1);
await login('moderador');assert.equal(api.canManage(),false);assert.equal(editor.allowed(),false);editor.save();editor.confirm();detail.prepare('role');detail.confirm();backend.expectNone(req=>req.method!=='GET');
await login('administrador');const reference=runInInjectionContext(env,()=>new RolesReferenceComponent());flushRoles();assert.equal(reference.roles().length,4);
const catalogError=firstValueFrom(api.roles()).catch(error=>error);backend.expectOne('/api/v1/admin/roles/?page_size=100').flush({count:101,results:roles});assert.ok(await catalogError instanceof Error);
backend.verify();editorEnv.destroy();env.destroy();
console.log('Administrative users checks passed: paging/filters, unique assignable role, reviewed contact/create/status/role writes, secret cleanup, self-action prevention, uncertain responses and stale navigation isolation.');

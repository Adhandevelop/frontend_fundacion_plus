import assert from 'node:assert/strict';
import { createEnvironmentInjector, PLATFORM_ID, runInInjectionContext, ɵINJECTOR_SCOPE } from '@angular/core';
import { provideHttpClient, withInterceptors, withNoXsrfProtection } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AuthService } from '../src/app/core/auth/auth.service';
import { authInterceptor } from '../src/app/core/auth/auth.interceptor';
import { API_BASE_URL } from '../src/app/core/api/api.config';
import { AdminCommentsApiService } from '../src/app/features/administration/comments/admin-comments-api.service';
import { CommentsListComponent } from '../src/app/features/administration/comments/comments-list.component';
import { CommentDetailComponent } from '../src/app/features/administration/comments/comment-detail.component';

const caseId='550e8400-e29b-41d4-a716-446655440000';
const queryParams=new BehaviorSubject(convertToParamMap({}));
const params=new BehaviorSubject(convertToParamMap({id:'comment-a'}));
const env=createEnvironmentInjector([
  {provide:PLATFORM_ID,useValue:'browser'},{provide:ɵINJECTOR_SCOPE,useValue:'root'},
  provideHttpClient(withInterceptors([authInterceptor]),withNoXsrfProtection()),provideHttpClientTesting(),
  {provide:API_BASE_URL,useValue:'/api/v1'}, {provide:Router,useValue:{navigate:()=>Promise.resolve(true)}},
  {provide:ActivatedRoute,useValue:{queryParamMap:queryParams,paramMap:params}},AuthService,AdminCommentsApiService,
],undefined as never);
const backend=env.get(HttpTestingController),auth=env.get(AuthService);
async function login(role:string){
  auth.clear();const pending=firstValueFrom(auth.login('staff@example.invalid','test-only',false));
  backend.expectOne('/api/v1/auth/login/').flush({user:{id_usuario:'staff-test',primary_role:role,estado:'activo',permissions:{all:['*']}},tokens:{access:'comments-access',refresh:'comments-refresh'}});await pending;
}
await login('administrador');
const list=runInInjectionContext(env,()=>new CommentsListComponent());
let request=backend.expectOne(req=>req.url==='/api/v1/admin/comments/');assert.equal(request.request.params.get('page_size'),'10');request.flush({count:0,results:[]});assert.equal(list.pages(),1);
list.form.controls.caso.setValue('PLUS-EXAMPLE');list.apply();assert.ok(list.error());backend.expectNone(req=>req.url==='/api/v1/admin/comments/');
list.form.setValue({estado_moderacion:'pendiente',caso:caseId});list.apply();
request=backend.expectOne(req=>req.url==='/api/v1/admin/comments/');assert.equal(request.request.params.get('caso'),caseId);assert.equal(request.request.params.get('estado_moderacion'),'pendiente');request.flush({count:25,results:[]});assert.equal(list.pages(),3);
list.navigate(1);request=backend.expectOne(req=>req.url==='/api/v1/admin/comments/');assert.equal(request.request.params.get('page'),'2');request.flush({},{status:404,statusText:'Not found'});
request=backend.expectOne(req=>req.url==='/api/v1/admin/comments/');assert.equal(request.request.params.get('page'),'1');request.flush({count:0,results:[]});
list.reset();const obsolete=backend.expectOne(req=>req.url==='/api/v1/admin/comments/');queryParams.next(convertToParamMap({caso:caseId}));assert.equal(obsolete.cancelled,true);
backend.expectOne(req=>req.url==='/api/v1/admin/comments/').flush({},{status:403,statusText:'Forbidden'});assert.ok(list.error());

const row={id_comentario:'comment-a',caso:caseId,caso_codigo:'PLUS-TEST',usuario:'person-test',autor_nombre:'Persona de prueba',contenido:'Texto solo en memoria de pruebas.',estado_moderacion:'pendiente',fecha_creacion:'2026-11-09T10:00:00Z'};
const detail=runInInjectionContext(env,()=>new CommentDetailComponent());
backend.expectOne('/api/v1/admin/comments/comment-a/').flush(row);
assert.equal(detail.canModerate(),true);assert.equal(detail.actions().includes('pendiente'),false);
detail.begin('rechazado');assert.equal(detail.review(),null);assert.ok(detail.status());
detail.form.controls.reason.setValue('Motivo exclusivamente interno');detail.begin('rechazado');
backend.expectNone(req=>req.method==='POST');assert.equal(detail.review()?.payload.notificar_motivo,false);
detail.cancel();backend.expectNone(req=>req.method==='POST');
// Review snapshots the text and disclosure flag, so subsequent edits cannot change the confirmed request.
detail.begin('rechazado');detail.form.controls.reason.setValue('Texto editado después');detail.form.controls.notifyReason.setValue(true);
detail.confirm();detail.confirm();const decision=backend.expectOne('/api/v1/admin/comments/comment-a/moderation/');
assert.equal(decision.request.headers.get('Authorization'),'Bearer comments-access');
assert.deepEqual(decision.request.body,{estado_moderacion:'rechazado',motivo:'Motivo exclusivamente interno',notificar_motivo:false});
decision.flush({...row,estado_moderacion:'rechazado'});
backend.expectOne('/api/v1/admin/comments/comment-a/').flush({...row,estado_moderacion:'rechazado'});
assert.equal(detail.saving(),false);assert.equal(detail.review(),null);assert.equal(detail.form.controls.notifyReason.value,false);
detail.form.setValue({reason:'Motivo expresamente compartido',notifyReason:true});detail.begin('oculto');detail.confirm();
const shared=backend.expectOne('/api/v1/admin/comments/comment-a/moderation/');assert.equal(shared.request.body.notificar_motivo,true);
shared.flush({},{status:400,statusText:'Bad request'});assert.equal(detail.uncertain(),false);assert.equal(detail.saving(),false);
detail.begin('oculto');detail.confirm();backend.expectOne('/api/v1/admin/comments/comment-a/moderation/').flush({},{status:500,statusText:'Server error'});
assert.equal(detail.uncertain(),true);detail.begin('aprobado');detail.confirm();backend.expectNone(req=>req.method==='POST');
detail.load();backend.expectOne('/api/v1/admin/comments/comment-a/').flush(row);assert.equal(detail.uncertain(),false);
// A successful write for A arriving after navigation must never reload or change B.
detail.form.reset();detail.begin('aprobado');detail.confirm();const late=backend.expectOne('/api/v1/admin/comments/comment-a/moderation/');
params.next(convertToParamMap({id:'comment-b'}));backend.expectOne('/api/v1/admin/comments/comment-b/').flush({...row,id_comentario:'comment-b'});
late.flush({...row,estado_moderacion:'aprobado'});assert.equal(detail.row()?.id_comentario,'comment-b');assert.equal(detail.saving(),false);backend.expectNone('/api/v1/admin/comments/comment-a/');
await login('representante');assert.equal(detail.canModerate(),false);detail.begin('aprobado');detail.confirm();backend.expectNone(req=>req.method==='POST');
await login('moderador');assert.equal(detail.canModerate(),true);
detail.load();backend.expectOne('/api/v1/admin/comments/comment-b/').flush({},{status:404,statusText:'Not found'});assert.ok(detail.error());detail.begin('aprobado');detail.confirm();backend.expectNone(req=>req.method==='POST');
backend.verify();env.destroy();
console.log('Comment moderation checks passed: server pagination/filters, review before writes, internal/shared reasons, role restrictions, uncertain responses and navigation isolation.');

import assert from 'node:assert/strict';
import { createEnvironmentInjector, PLATFORM_ID, runInInjectionContext, ɵINJECTOR_SCOPE } from '@angular/core';
import { provideHttpClient, withInterceptors, withNoXsrfProtection } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AuthService } from '../src/app/core/auth/auth.service';
import { authInterceptor } from '../src/app/core/auth/auth.interceptor';
import { API_BASE_URL } from '../src/app/core/api/api.config';
import { CitizenCasesApiService } from '../src/app/features/citizen/services/citizen-cases-api.service';
import { CitizenCommunicationApiService } from '../src/app/features/citizen/services/citizen-communication-api.service';
import { CitizenInboxCountersService } from '../src/app/features/citizen/services/citizen-inbox-counters.service';
import { groupCaseThreads } from '../src/app/features/citizen/services/citizen-communication.models';
import { CitizenMessagesComponent } from '../src/app/features/citizen/messages/citizen-messages.component';
import { CitizenNotificationsComponent } from '../src/app/features/citizen/notifications/citizen-notifications.component';

const params=new BehaviorSubject(convertToParamMap({}));
const navigations:any[]=[];
const env=createEnvironmentInjector([{provide:PLATFORM_ID,useValue:'browser'},{provide:ɵINJECTOR_SCOPE,useValue:'root'},provideHttpClient(withInterceptors([authInterceptor]),withNoXsrfProtection()),provideHttpClientTesting(),{provide:API_BASE_URL,useValue:'/api/v1'},{provide:Router,useValue:{navigate:(...args:unknown[])=>{navigations.push(args);return Promise.resolve(true);}}},{provide:ActivatedRoute,useValue:{queryParamMap:params}},AuthService,CitizenCasesApiService,CitizenCommunicationApiService,CitizenInboxCountersService],undefined as never);
const auth=env.get(AuthService),backend=env.get(HttpTestingController),api=env.get(CitizenCommunicationApiService),counters=env.get(CitizenInboxCountersService);
const user={id_usuario:'user-communication-test',nombres:'Persona',apellidos:'Prueba',full_name:'Persona Prueba',correo:'persona@example.invalid',telefono:null,estado:'activo' as const,primary_role:'ciudadano',rol_nombre:'ciudadano',permissions:{casos:['crear','ver_propios']},perfil:null,preferencias:null};
const login=firstValueFrom(auth.login(user.correo,'test-only',false));backend.expectOne('/api/v1/auth/login/').flush({user,tokens:{access:'test-access',refresh:'test-refresh'}});await login;
const last=(id:string,date:string)=>({id_mensaje:id,contenido:'Mensaje de prueba',fecha_envio:date,remitente:'staff'});
const conversations=[{id_caso:'case-a',caso_codigo:'PLUS-TEST-A',caso_titulo:'Caso A',counterpart:{id_usuario:'staff-a',nombre:'Equipo A',rol:'representante'},last_message:last('m1','2026-11-09T10:00:00Z'),unread_count:1},{id_caso:'case-a',caso_codigo:'PLUS-TEST-A',caso_titulo:'Caso A',counterpart:{id_usuario:'staff-b',nombre:'Equipo B',rol:'administrador'},last_message:last('m2','2026-11-09T11:00:00Z'),unread_count:2},{id_caso:null,caso_codigo:null,caso_titulo:'General',counterpart:{id_usuario:'staff-c',nombre:'Equipo C',rol:'administrador'},last_message:last('m3','2026-11-09T09:00:00Z'),unread_count:0}];
const grouped=groupCaseThreads(conversations);assert.equal(grouped.length,1);assert.equal(grouped[0].unread_count,3);assert.equal(grouped[0].last_message.id_mensaje,'m2');assert.deepEqual(grouped[0].participantes,['Equipo A','Equipo B']);
function flushCounters(messages=0,notifications=0){for(const request of backend.match('/api/v1/me/dashboard/'))if(!request.cancelled)request.flush({unread_messages:messages,unread_notifications:notifications});}
function flushInbox(){for(const request of backend.match('/api/v1/me/conversations/'))if(!request.cancelled)request.flush(conversations.map(item=>({...item,unread_count:0})));}
const caseData=(id:string)=>({id_caso:id,codigo:'PLUS-TEST-'+id,titulo:'Caso de prueba',municipio_nombre:'Municipio',allowed_actions:['message']});
const message=(id:string,from:string,to:string,read:string|null=null)=>({id_mensaje:id,caso:'case-a',remitente:from,remitente_nombre:'Participante',destinatario:to,destinatario_nombre:'Participante',contenido:'Texto de prueba',fecha_envio:'2026-11-09T11:00:00Z',fecha_lectura:read});
function flushThread(id:string,items:any[]=[]){backend.expectOne(`/api/v1/me/cases/${id}/`).flush(caseData(id));backend.expectOne(`/api/v1/cases/${id}/messages/`).flush(items);}

// Empty ID selections can never accidentally mark all notifications/messages.
await firstValueFrom(api.readNotifications([])).catch(()=>{});await firstValueFrom(api.readMessages('case-a',[])).catch(()=>{});backend.expectNone(request=>request.url.endsWith('/mark-read/')||request.url.endsWith('/read/'));
const notificationFilter=firstValueFrom(api.notifications(2,10,true));const filter=backend.expectOne(request=>request.url==='/api/v1/me/notifications/');assert.equal(filter.request.params.get('leida'),'false');assert.equal(filter.request.params.has('unread'),false);assert.equal(filter.request.params.get('page'),'2');filter.flush({count:0,next:null,previous:null,results:[]});await notificationFilter;

const ui=runInInjectionContext(env,()=>new CitizenMessagesComponent());backend.expectOne('/api/v1/me/conversations/').flush(conversations);flushCounters(3,2);assert.equal(ui.threads().length,1);assert.equal(ui.generalCount(),1);assert.equal(ui.selected(),null);
params.next(convertToParamMap({caso:'case-a'}));
const received=message('received','staff',user.id_usuario);const outgoing=message('outgoing',user.id_usuario,'staff');const foreign=message('foreign','stranger','other');
flushThread('case-a',[received,outgoing,foreign]);assert.equal(ui.messages().length,2);
const mark=backend.expectOne('/api/v1/cases/case-a/messages/read/');assert.deepEqual(mark.request.body,{message_ids:['received']});mark.flush({marked_read:1,unread_remaining:0});flushCounters(0,2);flushInbox();
assert.equal(counters.messages(),0);assert.equal(ui.inboxLoading(),false);

// Changing selection cancels stale GETs, preserving drafts per case.
ui.form.controls.content.setValue('Borrador A');params.next(convertToParamMap({caso:'case-b'}));
const staleCase=backend.expectOne('/api/v1/me/cases/case-b/'),staleMessages=backend.expectOne('/api/v1/cases/case-b/messages/');
params.next(convertToParamMap({caso:'case-a'}));assert.ok(staleCase.cancelled);assert.ok(staleMessages.cancelled);
flushThread('case-a',[{...received,fecha_lectura:'2026-11-09T11:01:00Z'}]);flushCounters();flushInbox();assert.equal(ui.form.controls.content.value,'Borrador A');

// A send response for A must never clear text typed in B.
ui.send();ui.send();const sent=backend.expectOne('/api/v1/cases/case-a/messages/');assert.equal(sent.request.method,'POST');assert.deepEqual(sent.request.body,{contenido:'Borrador A'});assert.equal('destinatario' in sent.request.body,false);
params.next(convertToParamMap({caso:'case-b'}));flushThread('case-b');flushCounters();flushInbox();ui.form.controls.content.setValue('Borrador B');
sent.flush({...outgoing,id_mensaje:'sent-a'});flushCounters();flushInbox();assert.equal(ui.form.controls.content.value,'Borrador B');assert.equal(ui.selected()?.id_caso,'case-b');
params.next(convertToParamMap({caso:'case-a'}));flushThread('case-a',[{...outgoing,id_mensaje:'sent-a'}]);flushCounters();flushInbox();assert.equal(ui.form.controls.content.value,'');
ui.form.controls.content.setValue('Envío incierto');ui.send();backend.expectOne('/api/v1/cases/case-a/messages/').flush({},{status:500,statusText:'Server error'});assert.equal(ui.uncertain(),true);ui.send();backend.expectNone(request=>request.url.endsWith('/messages/')&&request.method==='POST');ui.discardDraft();assert.equal(ui.uncertain(),false);assert.equal(ui.form.controls.content.value,'');
ui.form.controls.content.setValue('Mensaje corregible');ui.send();backend.expectOne('/api/v1/cases/case-a/messages/').flush({errors:{contenido:['Revisa el texto.']}},{status:400,statusText:'Bad request'});assert.equal(ui.uncertain(),false);assert.equal(ui.form.controls.content.value,'Mensaje corregible');

// Notifications: server paging, explicit read success and visible-ID snapshots.
const notification={id_notificacion:'notice-a',caso:'case-a',caso_codigo:'PLUS-TEST-A',titulo:'Aviso',mensaje:'Texto',tipo:'seguimiento_caso',leida:false,fecha_creacion:'2026-11-09T10:00:00Z'};
const notices=runInInjectionContext(env,()=>new CitizenNotificationsComponent());backend.expectOne(request=>request.url==='/api/v1/me/notifications/').flush({count:2,next:null,previous:null,results:[notification,{...notification,id_notificacion:'already-read',leida:true}]});flushCounters(0,1);
notices.markPage();const bulk=backend.expectOne('/api/v1/me/notifications/mark-read/');assert.deepEqual(bulk.request.body,{ids:['notice-a']});bulk.flush({marked_read_count:1,unread_remaining:1});
const arriving={...notification,id_notificacion:'arrived-later'};backend.expectOne(request=>request.url==='/api/v1/me/notifications/').flush({count:1,next:null,previous:null,results:[arriving]});flushCounters(0,1);assert.equal(notices.result().results[0].leida,false);
notices.mark(arriving);backend.expectOne('/api/v1/me/notifications/arrived-later/').flush({},{status:500,statusText:'Server error'});assert.equal(notices.result().results[0].leida,false);assert.ok(notices.status());
notices.mark(arriving);const patch=backend.expectOne('/api/v1/me/notifications/arrived-later/');assert.deepEqual(patch.request.body,{leida:true});patch.flush({...arriving,leida:true});backend.expectOne(request=>request.url==='/api/v1/me/notifications/').flush({count:1,next:null,previous:null,results:[{...arriving,leida:true}]});flushCounters();assert.equal(notices.result().results[0].leida,true);
notices.markPage();backend.expectNone('/api/v1/me/notifications/mark-read/');
const messageNotice={...notification,id_notificacion:'message-notice',tipo:'mensaje_privado'};notices.mark(messageNotice,true);backend.expectOne('/api/v1/me/notifications/message-notice/').flush({...messageNotice,leida:true});flushCounters();assert.ok(navigations.some(value=>value[0][0]==='/ciudadano/mensajes'&&value[1].queryParams.caso==='case-a'));
assert.equal(notices.canOpen({...notification,tipo:'comentario_moderado'}),false);assert.equal(notices.canOpen({...notification,caso:null}),false);

// Counters are never exposed to a different account or to an administrative role.
auth.updateUser({...user,id_usuario:'other-account'});assert.equal(counters.messages(),null);assert.equal(counters.notifications(),null);counters.refresh();flushCounters(9,8);assert.equal(counters.messages(),9);auth.updateUser(user);assert.equal(counters.messages(),null);counters.refresh();flushCounters();
auth.updateUser({...user,primary_role:'administrador',permissions:{all:['*']}});counters.refresh();backend.expectNone('/api/v1/me/dashboard/');assert.equal(counters.messages(),null);
backend.verify();env.destroy();
console.log('Citizen communication checks passed: recipient resolution, thread isolation, bounded reads, paging, late notifications, uncertain sends and owner-scoped counters.');

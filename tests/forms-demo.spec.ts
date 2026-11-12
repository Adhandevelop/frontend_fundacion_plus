import assert from 'node:assert/strict';
import { createEnvironmentInjector, PLATFORM_ID, ɵINJECTOR_SCOPE } from '@angular/core';
import { provideHttpClient, withNoXsrfProtection } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../src/app/core/api/api.config';
import { AuthService } from '../src/app/core/auth/auth.service';
import { FormsApiService } from '../src/app/shared/dynamic-forms/forms-api.service';
import { formProblems, submissionProblems } from '../src/app/shared/dynamic-forms/forms.models';

const env=createEnvironmentInjector([
  {provide:PLATFORM_ID,useValue:'browser'},{provide:ɵINJECTOR_SCOPE,useValue:'root'},
  provideHttpClient(withNoXsrfProtection()),provideHttpClientTesting(),{provide:API_BASE_URL,useValue:'/api/v1'},
  {provide:Router,useValue:{navigate:()=>Promise.resolve(true)}},AuthService,FormsApiService,
],undefined as never);
const auth=env.get(AuthService),backend=env.get(HttpTestingController),api=env.get(FormsApiService);
auth.updateUser({id_usuario:'admin-test',nombres:'Cuenta',apellidos:'Prueba',full_name:'Cuenta Prueba',correo:'admin@example.invalid',telefono:null,primary_role:'administrador',rol_nombre:'administrador',estado:'activo',permissions:{all:['*'],can_manage_forms:true},can_manage_forms:true,perfil:null,preferencias:null});
assert.equal(api.canManage(),true);

const questionDto=(id:string,tipo_campo:string)=>({id,codigo:id,enunciado:`Pregunta ${id}`,descripcion_ayuda:'Ayuda',tipo_campo,es_obligatorio:true,orden:1,configuracion_validacion:{},opciones:tipo_campo.startsWith('seleccion_')?[{id:'o1',valor:'opcion_a',etiqueta:'Opción A',orden:1},{id:'o2',valor:'opcion_b',etiqueta:'Opción B',orden:2}]:[]});
const summary={id:'form-1',slug:'censo-meta',titulo:'Censo Meta',estado:'borrador',numero_version_publicada:0,revision_edicion:2,total_versiones:0,total_envios:0,permite_multiples_envios:false,requiere_documento:true,fecha_creacion:'2026-11-11T00:00:00Z',fecha_actualizacion:'2026-11-11T00:00:00Z'};
const listPromise=firstValueFrom(api.adminList('censo','borrador',2,20));
let request=backend.expectOne(req=>req.url==='/api/v1/admin/forms/');
assert.deepEqual({search:request.request.params.get('search'),estado:request.request.params.get('estado'),page:request.request.params.get('page'),pageSize:request.request.params.get('page_size')},{search:'censo',estado:'borrador',page:'2',pageSize:'20'});
request.flush({count:1,next:null,previous:null,results:[summary]});assert.equal((await listPromise).results[0].title,'Censo Meta');

const publicPromise=firstValueFrom(api.publicForm('censo-meta'));
backend.expectOne('/api/v1/public/forms/censo-meta/').flush({...summary,descripcion:'Descripción',version_activa:{numero_version:1,preguntas:['texto_corto','texto_largo','numero','fecha','booleano','seleccion_unica','seleccion_multiple'].map((type,index)=>questionDto(`q${index}`,type))},politica_datos:{id_documento:'legal-1',version:'1',titulo:'Política',resumen:'Resumen',url_contenido:'/api/v1/public/legal/tratamiento_datos/'}});
const form=await publicPromise;assert.equal(form.questions.length,7);assert.equal(form.policy?.id,'legal-1');
assert.ok(formProblems({...form,slug:'Enlace inválido'}).length);
const input={identity:{names:'Ana',surnames:'Prueba',email:'ana@example.invalid',phone:'3000000000',documentType:'CC',document:'123'},answers:{q0:'Corto',q1:'Largo',q2:2,q3:'2026-11-11',q4:true,q5:'opcion_a',q6:['opcion_a','opcion_b']},consent:true};
assert.deepEqual(submissionProblems(form,input),[]);

const submitPromise=firstValueFrom(api.submit(form,input,'idem-test-1'));
request=backend.expectOne('/api/v1/public/forms/censo-meta/submit/');
assert.equal(request.request.headers.get('Idempotency-Key'),'idem-test-1');assert.equal(request.request.body.respuestas.length,7);assert.deepEqual(request.request.body.respuestas[6].valores_seleccionados,['opcion_a','opcion_b']);
request.flush({id_envio:'submission-1',estado:'recibido',mensaje:'Recibido'});assert.equal((await submitPromise).id,'submission-1');

const verifyPromise=firstValueFrom(api.verifyActivation('token-test','Password123!'));
request=backend.expectOne('/api/v1/public/forms/activation/verify/');assert.deepEqual(request.request.body,{token:'token-test',nueva_contrasena:'Password123!'});request.flush({mensaje:'Cuenta activada',estado:'activada',login_required:true});await verifyPromise;
const resendPromise=firstValueFrom(api.resendActivation('ana@example.invalid'));
request=backend.expectOne('/api/v1/public/forms/activation/resend/');assert.deepEqual(request.request.body,{correo:'ana@example.invalid'});request.flush({mensaje:'Si corresponde, se enviará un correo.'});await resendPromise;

const citizenPromise=firstValueFrom(api.citizenList());
backend.expectOne(req=>req.url==='/api/v1/me/forms/submissions/').flush({count:1,next:null,previous:null,results:[{id:'submission-1',formulario:{slug:'censo-meta',titulo:'Censo Meta'},numero_version:1,fecha_envio:'2026-11-11T01:00:00Z',estado_vinculacion:'vinculado',total_respuestas:7}]});assert.equal((await citizenPromise).results[0].totalAnswers,7);
const detailPromise=firstValueFrom(api.citizenDetail('submission-1'));
backend.expectOne('/api/v1/me/forms/submissions/submission-1/').flush({id:'submission-1',formulario_titulo:'Censo Meta',numero_version:1,fecha_envio:'2026-11-11T01:00:00Z',respuestas:[{id:'answer-1',codigo_pregunta:'q0',enunciado_congelado:'Pregunta q0',tipo_campo_congelado:'texto_corto',valor:'Corto'}]});assert.equal((await detailPromise).answers[0].value,'Corto');

const lifecyclePromise=firstValueFrom(api.lifecycle('form-1','publish'));backend.expectOne('/api/v1/admin/forms/form-1/publish/').flush({mensaje:'Publicado',estado:'publicado',numero_version:1});assert.equal((await lifecyclePromise).estado,'publicado');
const historicalPromise=firstValueFrom(api.adminVersion('form-1',1,'censo-meta'));backend.expectOne('/api/v1/admin/forms/form-1/versions/1/').flush({id:'version-1',numero_version:1,es_vigente:true,titulo_congelado:'Censo Meta v1',descripcion_congelada:'Versión congelada',requiere_documento:true,permite_multiples_envios:false,publicado_en:'2026-11-11T00:00:00Z',preguntas:[questionDto('historical','texto_corto')]});const historical=await historicalPromise;assert.equal(historical.title,'Censo Meta v1');assert.equal(historical.questions[0].code,'historical');
assert.equal(api.exportUrl('form-1',1),'/api/v1/admin/forms/form-1/submissions-export/?version=1');
backend.verify();env.destroy();
console.log('Dynamic forms integration checks passed: admin list, seven field types, validation, idempotent public submission, activation, citizen history and lifecycle routes.');

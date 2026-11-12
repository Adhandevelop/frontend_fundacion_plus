import '@angular/compiler';
import assert from 'node:assert/strict';
import { createEnvironmentInjector, runInInjectionContext, PLATFORM_ID, ɵINJECTOR_SCOPE } from '@angular/core';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors, withNoXsrfProtection } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../src/app/core/auth/auth.service';
import { authInterceptor } from '../src/app/core/auth/auth.interceptor';
import { accountGuard } from '../src/app/core/auth/auth.guards';
import { AccountApiService } from '../src/app/core/api/account-api.service';
import { API_BASE_URL } from '../src/app/core/api/api.config';
import { apiErrorMessage } from '../src/app/core/api/api-error';
import { canAccessAdministration } from '../src/app/core/auth/account-permissions';
import { routes } from '../src/app/app.routes';

function memoryStorage() {
  const values=new Map<string,string>();
  return {getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)};
}
Object.assign(globalThis,{window:{location:{origin:'https://fundacionplus.site'}},localStorage:memoryStorage(),sessionStorage:memoryStorage()});
const navigations:unknown[]=[];
const router={navigate:(...args:unknown[])=>{navigations.push(args);return Promise.resolve(true);},createUrlTree:(commands:unknown[],extras:unknown)=>({commands,extras})};
function environment() {
  return createEnvironmentInjector([
    {provide:PLATFORM_ID,useValue:'browser'},{provide:ɵINJECTOR_SCOPE,useValue:'root'},provideHttpClient(withInterceptors([authInterceptor]), withNoXsrfProtection()),provideHttpClientTesting(),
    {provide:Router,useValue:router},{provide:API_BASE_URL,useValue:'/api/v1'},AuthService,AccountApiService,
  ],undefined as never);
}
const env=environment();
// A shared form must remain nested in each portal so editing a profile keeps its navigation.
const adminRoute=routes.find(route=>route.path==='admin')!;
const citizenRoute=routes.find(route=>route.path==='ciudadano')!;
const adminProfile=adminRoute.children!.find(route=>route.path==='perfil')!;
const citizenProfile=citizenRoute.children!.find(route=>route.path==='perfil')!;
assert.ok(adminProfile);assert.ok(citizenProfile);
assert.equal(adminRoute.data?.['requiresAdmin'],true);
assert.ok(adminRoute.canActivate?.includes(accountGuard));
assert.equal(await adminProfile.loadComponent!(),await citizenProfile.loadComponent!());
const auth=env.get(AuthService), http=env.get(HttpClient), backend=env.get(HttpTestingController), account=env.get(AccountApiService);
const user={id_usuario:'550e8400-e29b-41d4-a716-446655440000',nombres:'Persona',apellidos:'Prueba',full_name:'Persona Prueba',correo:'persona@example.invalid',telefono:null,estado:'activo' as const,primary_role:'ciudadano',rol_nombre:'ciudadano',permissions:{can_create_cases:true,can_manage_own_cases:true,can_moderate_cases:false},perfil:null,preferencias:null};
function login(remember=false) {
  const result=firstValueFrom(auth.login('persona@example.invalid','test-only',remember));
  const request=backend.expectOne('/api/v1/auth/login/');
  assert.equal(request.request.headers.has('Authorization'),false);
  assert.deepEqual(request.request.body,{correo:'persona@example.invalid',password:'test-only'});
  request.flush({tokens:{access:'old-access',refresh:'old-refresh'},user});return result;
}
await login();
assert.equal(auth.canAdmin(),false);
assert.equal(auth.defaultRoute(),'/ciudadano');
assert.equal(localStorage.getItem('plus.session.v1'),null);
assert.equal(JSON.parse(sessionStorage.getItem('plus.session.v1')!).refresh,'old-refresh');
assert.equal(sessionStorage.getItem('plus.session.v1')!.includes('test-only'),false);

// Credentials never leave the API origin or its path boundary.
for(const url of ['https://third-party.invalid/api/v1/me/','/api/v10/me/']) {
  const result=firstValueFrom(http.get(url));const request=backend.expectOne(url);
  assert.equal(request.request.headers.has('Authorization'),false);request.flush({});await result;
}

// Concurrent failures share one refresh and retry both operations with the rotated token.
const a=firstValueFrom(http.get('/api/v1/me/'));
const b=firstValueFrom(http.get('/api/v1/me/preferences/'));
const ar=backend.expectOne('/api/v1/me/'),br=backend.expectOne('/api/v1/me/preferences/');
assert.equal(ar.request.headers.get('Authorization'),'Bearer old-access');
ar.flush({}, {status:401,statusText:'Unauthorized'});br.flush({}, {status:401,statusText:'Unauthorized'});
const refresh=backend.expectOne('/api/v1/auth/refresh/');
assert.deepEqual(refresh.request.body,{refresh:'old-refresh'});
refresh.flush({access:'new-access',refresh:'new-refresh'});
for(const url of ['/api/v1/me/','/api/v1/me/preferences/']) {
  const request=backend.expectOne(url);assert.equal(request.request.headers.get('Authorization'),'Bearer new-access');request.flush({});
}
await Promise.all([a,b]);
assert.equal(JSON.parse(sessionStorage.getItem('plus.session.v1')!).refresh,'new-refresh');

// A forbidden operation must never trigger a refresh or discard the account.
const forbidden=firstValueFrom(http.get('/api/v1/admin/users/')).catch(error=>error);
backend.expectOne('/api/v1/admin/users/').flush({}, {status:403,statusText:'Forbidden'});
assert.equal((await forbidden).status,403);backend.expectNone('/api/v1/auth/refresh/');assert.ok(auth.hasSession());

// A role alone never grants access without backend capabilities.
const denied=await firstValueFrom(runInInjectionContext(env,()=>accountGuard({data:{requiresAdmin:true}} as never,{url:'/admin'} as never)) as any);
assert.deepEqual(denied.commands,['/acceso-denegado']);
auth.updateUser({...user,primary_role:'administrador',permissions:{can_moderate_cases:false}});
assert.equal(auth.canAdmin(),false);
auth.updateUser({...user,primary_role:'administrador',permissions:{can_moderate_cases:true}});assert.equal(auth.canAdmin(),true);
// Production /me/ returns module/action lists, despite the documented boolean example.
const citizenPermissions={casos:['crear','ver_propios','subir_evidencia','comentar','mensajes_privados'],propuestas:['crear','ver_propias'],notificaciones:['ver_propias']};
const adminPermissions={all:['*'],usuarios:['crear','editar','cambiar_rol','asignar_ambito'],territorios:['crear','editar','eliminar'],casos:['*'],iniciativas:['*'],auditoria:['consultar'],configuracion:['*'],can_manage_forms:true,can_manage_homepage:true};
assert.equal(canAccessAdministration(citizenPermissions),false);
assert.equal(canAccessAdministration(adminPermissions),true);
assert.equal(canAccessAdministration({casos:['revisar_publicacion','moderar_comentarios']}),true);
assert.equal(canAccessAdministration({casos:['ver_asignados','seguimiento','cambiar_estado']}),true);
assert.equal(canAccessAdministration({unknown:['*']}),false);
assert.equal(canAccessAdministration({casos:['unknown']}),false);
assert.equal(canAccessAdministration({all:true}),false);
auth.updateUser({...user,primary_role:'administrador',permissions:adminPermissions,can_manage_forms:true,can_manage_homepage:true});assert.equal(auth.defaultRoute(),'/admin');
assert.equal(await firstValueFrom(runInInjectionContext(env,()=>accountGuard({data:{requiresAdmin:true}} as never,{url:'/admin'} as never)) as any),true);
assert.ok(adminRoute.canActivateChild?.includes(accountGuard));
assert.ok(citizenRoute.canActivateChild?.includes(accountGuard));
assert.equal(citizenRoute.data?.['requiresCitizen'],true);

async function verifyPortal(portal:typeof adminRoute, allowed:boolean|((path:string)=>boolean)) {
  for(const child of portal.children!) {
    // Child metadata must not erase the enclosing portal's access requirement.
    const snapshot={data:child.data ?? {},pathFromRoot:[{data:{}},{data:portal.data ?? {}},{data:child.data ?? {}}]};
    const result=await firstValueFrom(runInInjectionContext(env,()=>accountGuard(snapshot as never,{url:`/${portal.path}/${child.path}`} as never)) as any);
    if(typeof allowed==='function'?allowed(child.path??''):allowed)assert.equal(result,true,`${portal.path}/${child.path} should be allowed`);
    else assert.deepEqual(result.commands,['/acceso-denegado'],`${portal.path}/${child.path} should be denied`);
  }
}
await verifyPortal(adminRoute,true);await verifyPortal(citizenRoute,false);
auth.updateUser({...user,permissions:citizenPermissions});assert.equal(auth.defaultRoute(),'/ciudadano');
await verifyPortal(citizenRoute,true);await verifyPortal(adminRoute,false);
for(const role of ['representante','moderador']) {
  auth.updateUser({...user,primary_role:role,permissions:adminPermissions});
  const sections=role==='representante'?['','perfil','casos','mapa','informes']:['','perfil','casos','mapa','informes','noticias','iniciativas','postulaciones','comentarios'];
  await verifyPortal(adminRoute,path=>sections.includes(path.split('/')[0]));await verifyPortal(citizenRoute,false);
}
auth.updateUser({...user,permissions:adminPermissions}); // Conflicting citizen/admin data fails closed.
assert.equal(auth.canAdmin(),false);assert.equal(auth.canCitizen(),false);
await verifyPortal(adminRoute,false);await verifyPortal(citizenRoute,false);
auth.updateUser({...user,primary_role:'unknown',permissions:adminPermissions});
assert.equal(auth.defaultRoute(),'/acceso-denegado');
await verifyPortal(adminRoute,false);await verifyPortal(citizenRoute,false);
auth.updateUser({...user,estado:'suspendido'});
await verifyPortal(citizenRoute,false);
auth.updateUser(user);

// Profile writes use real field names, UUID relations and multipart photo bytes.
const profile=firstValueFrom(account.update({nombres:'Persona',apellidos:'Prueba',correo:user.correo,telefono:'',id_departamento:null,id_municipio:null,id_comunidad:null}));
const patch=backend.expectOne('/api/v1/me/');assert.equal(patch.request.method,'PATCH');assert.equal('rol' in patch.request.body,false);patch.flush(user);await profile;
const prefs=firstValueFrom(account.preferences({notificar_novedades_casos:true,notificar_mensajes:false,suscrito_boletin:false}));
const prefRequest=backend.expectOne('/api/v1/me/preferences/');assert.equal(prefRequest.request.body.notificar_mensajes,false);prefRequest.flush(prefRequest.request.body);await prefs;
const file=new Blob(['test-image'],{type:'image/png'}) as File;
const upload=firstValueFrom(account.uploadPhoto(file));const photo=backend.expectOne('/api/v1/me/photo/');
assert.ok(photo.request.body instanceof FormData);assert.ok(photo.request.body.get('photo') instanceof Blob);assert.equal(photo.request.headers.has('Content-Type'),false);
photo.flush({foto_url:'/api/v1/public/media/profiles/image.png'});await upload;
const departments=firstValueFrom(account.departments());backend.expectOne('/api/v1/catalogs/departments/').flush([{id_departamento:'department-uuid',nombre:'Territorio'}]);assert.equal((await departments).length,1);
const municipalities=firstValueFrom(account.municipalities('department-uuid'));
backend.expectOne(request=>request.url.endsWith('/municipalities/') && request.params.get('id_departamento')==='department-uuid').flush({count:1,next:null,previous:null,results:[{id_municipio:'municipality-uuid',nombre:'Municipio'}]});assert.equal((await municipalities).length,1);

// Network errors during refresh preserve the session so the user can retry.
const offline=firstValueFrom(auth.refresh()).catch(error=>error);
backend.expectOne('/api/v1/auth/refresh/').error({type:'error'} as ProgressEvent);await offline;assert.ok(auth.hasSession());

// Revoked refresh tokens clear storage and route to the expired-session state.
const expired=firstValueFrom(http.get('/api/v1/me/')).catch(error=>error);
backend.expectOne('/api/v1/me/').flush({}, {status:401,statusText:'Unauthorized'});
backend.expectOne('/api/v1/auth/refresh/').flush({}, {status:401,statusText:'Unauthorized'});
assert.equal((await expired).status,401);assert.equal(auth.hasSession(),false);assert.equal(sessionStorage.getItem('plus.session.v1'),null);
assert.ok(navigations.some((value:any)=>value[0][0]==='/sesion-vencida'));

// Restoring tokens verifies /me instead of trusting a stored profile or role.
await login(true);assert.ok(localStorage.getItem('plus.session.v1'));assert.equal(sessionStorage.getItem('plus.session.v1'),null);
const restored=environment();const restoredAuth=restored.get(AuthService), restoredBackend=restored.get(HttpTestingController);
assert.equal(restoredAuth.user(),null);const restoredUser=firstValueFrom(restoredAuth.ensureUser());restoredBackend.expectOne('/api/v1/me/').flush(user);assert.equal((await restoredUser)?.correo,user.correo);
restoredBackend.verify();restored.destroy();

// Failed logout does not claim server revocation; successful logout clears tokens.
auth.logout();backend.expectOne('/api/v1/auth/logout/').flush({}, {status:503,statusText:'Unavailable'});assert.ok(auth.hasSession());assert.ok(auth.logoutError());
auth.logout();backend.expectOne('/api/v1/auth/logout/').flush({detail:'ok'});assert.equal(auth.hasSession(),false);assert.equal(localStorage.getItem('plus.session.v1'),null);
assert.equal(apiErrorMessage(new HttpErrorResponse({status:400,error:{errors:{correo:['Correo inválido.']}}})),'Correo inválido.');

// Anonymous routes redirect to login; registration never requests a privileged role.
const anonymous=await firstValueFrom(runInInjectionContext(env,()=>accountGuard({data:{}} as never,{url:'/ciudadano/perfil'} as never)) as any);
assert.deepEqual(anonymous.commands,['/login']);assert.equal(anonymous.extras.queryParams.returnUrl,'/ciudadano/perfil');
const registered=firstValueFrom(auth.register({nombres:'Persona',apellidos:'Prueba',correo:user.correo,telefono:'',password:'test-only',acepta_tratamiento_datos:true}));
const registration=backend.expectOne('/api/v1/auth/register/');
assert.equal(registration.request.body.acepta_tratamiento_datos,true);assert.equal('id_rol' in registration.request.body,false);
registration.flush({user,tokens:{access:'register-access',refresh:'register-refresh'}});await registered;
const recovery=firstValueFrom(auth.requestPasswordReset(user.correo));const recoveryRequest=backend.expectOne('/api/v1/auth/password-reset/request/');
assert.equal(recoveryRequest.request.headers.has('Authorization'),false);recoveryRequest.flush({message:'generic'});await recovery;
const validation=firstValueFrom(auth.validateReset({uid:'encoded-id',token:'test-token'}));backend.expectOne('/api/v1/auth/password-reset/validate/').flush({valid:true});assert.equal((await validation).valid,true);
const confirmation=firstValueFrom(auth.confirmReset({uid:'encoded-id',token:'test-token',new_password:'new-test-password',new_password_confirm:'new-test-password'}));
const confirmRequest=backend.expectOne('/api/v1/auth/password-reset/confirm/');assert.equal(confirmRequest.request.body.new_password_confirm,'new-test-password');confirmRequest.flush({message:'ok'});await confirmation;assert.equal(auth.hasSession(),false);

// An outstanding refresh cannot restore a session after it was cleared.
await login();const stale=firstValueFrom(auth.refresh()).catch(error=>error);const staleRequest=backend.expectOne('/api/v1/auth/refresh/');
auth.clear();staleRequest.flush({access:'stale-access',refresh:'stale-refresh'});assert.equal((await stale).status,401);assert.equal(auth.hasSession(),false);
backend.verify();env.destroy();
console.log('API integration checks passed: session storage, refresh concurrency/rotation, guards, profile, multipart, catalogs, errors, logout.');

await import('./citizen-cases.spec');
await import('./citizen-communication.spec');
await import('./admin-cases.spec');
await import('./admin-report-audit.spec');
await import('./admin-comments.spec');
await import('./admin-territories.spec');
await import('./admin-users.spec');
await import('./admin-access.spec');
await import('./forms-demo.spec');
await import('./homepage-integration.spec');
await import('./news-integration.spec');
await import('./initiatives-integration.spec');

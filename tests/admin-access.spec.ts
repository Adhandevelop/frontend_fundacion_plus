import assert from 'node:assert/strict';
import { createEnvironmentInjector, PLATFORM_ID, runInInjectionContext, ɵINJECTOR_SCOPE } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { routes } from '../src/app/app.routes';
import { AuthService } from '../src/app/core/auth/auth.service';
import { accountGuard } from '../src/app/core/auth/auth.guards';
import { AccountUser } from '../src/app/core/auth/auth.models';
import { ADMIN_SECTION_ROLES, canAccessAdminSection } from '../src/app/core/auth/admin-access.policy';

const env=createEnvironmentInjector([
  {provide:PLATFORM_ID,useValue:'browser'},{provide:ɵINJECTOR_SCOPE,useValue:'root'},
  provideHttpClient(),provideHttpClientTesting(),
  {provide:Router,useValue:{createUrlTree:(commands:unknown[])=>({commands})}},AuthService,
],undefined as never);
const auth=env.get(AuthService);auth.clear();
const admin=routes.find(route=>route.path==='admin')!;
const user:AccountUser={id_usuario:'test-access-user',nombres:'Cuenta',apellidos:'Prueba',full_name:'Cuenta Prueba',correo:'local@example.invalid',telefono:null,primary_role:'administrador',rol_nombre:'administrador',estado:'activo',permissions:{all:['*']},perfil:null,preferencias:null};
const signedIn=firstValueFrom(auth.login('local@example.invalid','test-only',false));
env.get(HttpTestingController).expectOne('/api/v1/auth/login/').flush({user,tokens:{access:'local-access',refresh:'local-refresh'}});await signedIn;
const expected:Record<string,string[]>={
  administrador:Object.keys(ADMIN_SECTION_ROLES),
  moderador:['dashboard','cases','reports','profile','map','news','initiatives','proposals','comments'],
  representante:['dashboard','cases','reports','profile','map'],
  ciudadano:[],unknown:[],
};
for(const [role,sections] of Object.entries(expected)){
  auth.updateUser({...user,primary_role:role});
  for(const child of admin.children!){
    const section=child.data?.['adminSection'];assert.ok(section,`Missing policy for /admin/${child.path}`);
    assert.equal(canAccessAdminSection(auth.user(),section),sections.includes(section),`${role}: ${child.path}`);
    const result=await firstValueFrom(runInInjectionContext(env,()=>accountGuard({data:child.data,pathFromRoot:[{data:admin.data},{data:child.data}]} as never,{url:'/admin/'+child.path} as never)) as any);
    if(sections.includes(section))assert.equal(result,true,`${role} allowed ${child.path}`);
    else assert.deepEqual(result.commands,['/acceso-denegado'],`${role} denied ${child.path}`);
  }
}
assert.equal(canAccessAdminSection(user,'__proto__'),false);
assert.equal(canAccessAdminSection(user,'new-unconfigured-section'),false);
assert.equal(canAccessAdminSection({...user,estado:'suspendido'},'users'),false);
assert.equal(canAccessAdminSection({...user,permissions:{}},'users'),false);
assert.equal(canAccessAdminSection(null,'profile'),false);
// An unauthorized ancestor cannot be bypassed by an allowed child.
auth.updateUser({...user,primary_role:'moderador'});
const nested=await firstValueFrom(runInInjectionContext(env,()=>accountGuard({data:{adminSection:'profile'},pathFromRoot:[{data:admin.data},{data:{adminSection:'users'}},{data:{adminSection:'profile'}}]} as never,{url:'/admin/usuarios/id/editar'} as never)) as any);
assert.deepEqual(nested.commands,['/acceso-denegado']);
// Shared profile still stays inside the internal portal; no citizen portal is granted.
assert.equal(auth.canCitizen(),false);
auth.clear();const anonymous=await firstValueFrom(runInInjectionContext(env,()=>accountGuard({data:{requiresAdmin:true,adminSection:'users'}} as never,{url:'/admin/usuarios'} as never)) as any);assert.deepEqual(anonymous.commands,['/login']);
env.get(HttpTestingController).expectNone(()=>true);env.destroy();
console.log('Administrative access checks passed: every child route, role matrix, unknown sections, inactive accounts, nested requirements and no API requests for denied navigation.');

// Local Chrome checks with synthetic, read-only API responses. No production API is contacted.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';

const origin=process.env.PLUS_UI_ORIGIN ?? 'http://127.0.0.1:4201';
assert.equal(new URL(origin).hostname,'127.0.0.1','UI checks only run against localhost.');
const output=path.resolve('.angular/ui-review');await mkdir(output,{recursive:true});
const profile=await mkdtemp(path.join(output,'chrome-'));
const browser=spawn(process.env.PLUS_CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',[
  '--headless=new','--no-first-run','--no-default-browser-check','--disable-background-networking',
  '--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank',
],{windowsHide:true,stdio:'ignore'});
let socket,cdp,nextId=0,role='administrador',withCatalogs=false;const pending=new Map(),failures=[],apiCalls=[];
browser.on('error',error=>failures.push(error.message));
const account=()=>({id_usuario:'local-ui-user',nombres:'Cuenta',apellidos:'de prueba',full_name:'Cuenta de prueba',correo:'ui@example.invalid',telefono:null,estado:'activo',primary_role:role,rol_nombre:role,permissions:role==='ciudadano'?{}:{all:['*'],can_manage_forms:role==='administrador',can_manage_homepage:role==='administrador'},can_manage_forms:role==='administrador',can_manage_homepage:role==='administrador',perfil:null,preferencias:{notificar_novedades_casos:true,notificar_mensajes:true,suscrito_boletin:false}});
const page={count:0,next:null,previous:null,results:[]};
function response(pathname){
  if(pathname==='/api/v1/me/')return account();
  if(pathname==='/api/v1/me/dashboard/')return {cases:{total:0,by_estado:{},by_estado_publicacion:{}},notifications:{unread:0},messages:{unread:0}};
  if(withCatalogs && pathname==='/api/v1/catalogs/departments/')return [{id_departamento:'local-department',nombre:'Departamento de prueba'}];
  if(withCatalogs && pathname==='/api/v1/catalogs/municipalities/')return [{id_municipio:'local-municipality',id_departamento:'local-department',nombre:'Municipio de prueba',departamento_nombre:'Departamento de prueba'}];
  if(pathname.includes('/catalogs/'))return [];
  if(pathname==='/api/v1/admin/roles/')return {count:1,results:[{id_rol:'local-role',nombre:'ciudadano',descripcion:'Rol de prueba local',assignable:true}]};
  if(pathname==='/api/v1/admin/reports/cases/')return {...page,page:1,page_size:10,totals:{total_cases:0,by_estado:{},by_estado_publicacion:{},by_prioridad:{},by_categoria:{},by_municipio:{}}};
  if(pathname==='/api/v1/admin/audit-events/')return {...page,kpis:{total_events:0}};
  if(pathname==='/api/v1/admin/forms/')return {count:1,next:null,previous:null,results:[{id:'form-local',slug:'encuesta-local',titulo:'Encuesta local',estado:'borrador',numero_version_publicada:0,revision_edicion:1,total_versiones:0,total_envios:0,permite_multiples_envios:false,requiere_documento:false,fecha_creacion:'2026-11-13T12:00:00Z',fecha_actualizacion:'2026-11-13T12:00:00Z'}]};
  if(pathname==='/api/v1/admin/settings/')return {count:5,next:null,previous:null,results:[
    ['institucion.nombre','Corporación Pluralismo Social'],['institucion.sigla','PLUS'],['institucion.representante_nombre','Juan David Martinez Bolaño'],['institucion.representante_cargo','CEO'],['institucion.mision','Misión institucional de prueba local.'],
  ].map(([clave,valor],index)=>({id:`setting-${index}`,id_configuracion:`setting-${index}`,clave,valor,fecha_actualizacion:'2026-11-13T12:00:00Z'}))};
  if(pathname==='/api/v1/public/site/')return {institucion:{},configuracion:{},documentos_legales:[{id:'legal-local',id_documento:'legal-local',tipo:'tratamiento_datos',version:'1.0',titulo:'Política local de tratamiento de datos',contenido:'Contenido legal sintético para la prueba local.',vigente:true,fecha_vigencia:'2026-11-13T00:00:00Z'}]};
  if(pathname==='/api/v1/me/conversations/')return [];
  return page;
}
async function until(check,label){for(let i=0;i<100;i++){const result=await check();if(result)return result;await pause(100);}throw new Error(`Timeout: ${label}`);}
try{
  const port=await until(async()=>{try{return (await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];}catch{return null;}},'Chrome');
  const targets=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket=new WebSocket(targets.find(target=>target.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  socket.addEventListener('message',async event=>{
    const message=JSON.parse(event.data);
    if(message.id){const request=pending.get(message.id);pending.delete(message.id);if(message.error)request?.reject(new Error(message.error.message));else request?.resolve(message.result);return;}
    if(message.method==='Runtime.exceptionThrown')failures.push(message.params.exceptionDetails.text);
    if(message.method!=='Fetch.requestPaused')return;
    const {requestId,request}=message.params;
    try{
      const url=new URL(request.url);
      if(url.origin!==origin){await cdp('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});return;}
      if(!url.pathname.startsWith('/api/')){await cdp('Fetch.continueRequest',{requestId});return;}
      apiCalls.push({method:request.method,path:url.pathname});
      const localValidation=request.method==='POST' && url.pathname==='/api/v1/auth/password-reset/validate/';
      if(!localValidation)assert.equal(request.method,'GET','The UI review must not write to APIs.');
      await cdp('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(localValidation?{valid:true}:response(url.pathname))).toString('base64')});
    }catch(error){failures.push(error.message);await cdp('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'}).catch(()=>{});}
  });
  await cdp('Runtime.enable');await cdp('Page.enable');await cdp('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]});
  const evaluate=async(expression)=>{const result=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);return result.result.value;};
  await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`sessionStorage.setItem('plus.session.v1',JSON.stringify({access:'local-test',refresh:'local-test'}));localStorage.removeItem('plus.session.v1');localStorage.setItem('plus-theme','light');`});
  async function visit(route,currentRole='administrador'){
    role=currentRole;await cdp('Page.navigate',{url:origin+route});
    await until(()=>evaluate(`location.pathname===${JSON.stringify(new URL(route,origin).pathname)} && !!document.querySelector('main h1')`),route);
    await pause(200);
  }
  async function viewport(width){await cdp('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:false});await pause(100);}
  async function snapshot(name){const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));}
  async function widthFits(){const fits=await evaluate('document.documentElement.scrollWidth<=innerWidth');if(!fits){await snapshot('overflow-debug');console.log(await evaluate(`Array.from(document.querySelectorAll('body *')).filter(element=>element.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(element=>({tag:element.tagName,id:element.id,classes:element.className,width:element.getBoundingClientRect().width}))`));}assert.ok(fits,`Unexpected page overflow at ${await evaluate('location.pathname')}`);}
  await viewport(360);await visit('/admin/usuarios/nuevo');await widthFits();
  assert.equal(await evaluate(`document.querySelector('main').getBoundingClientRect().width>0`),true);
  await evaluate(`document.querySelector('[aria-controls="admin-navigation"]').focus();document.querySelector('[aria-controls="admin-navigation"]').click()`);await pause(150);
  assert.equal(await evaluate(`document.querySelector('#admin-navigation').getAttribute('aria-modal')`),'true');
  assert.equal(await evaluate(`document.querySelector('#admin-navigation').contains(document.activeElement)`),true);
  assert.equal(await evaluate(`document.querySelector('#admin-content').parentElement.inert`),true);
  await evaluate(`document.querySelector('#admin-navigation button').focus()`);
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',modifiers:8});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',modifiers:8});
  assert.equal(await evaluate(`document.querySelector('#admin-navigation').contains(document.activeElement)`),true);
  await snapshot('admin-menu-mobile');
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});await pause(100);
  assert.equal(await evaluate(`document.querySelector('[aria-controls="admin-navigation"]').getAttribute('aria-expanded')`),'false');
  assert.equal(await evaluate(`document.activeElement.getAttribute('aria-controls')`),'admin-navigation');
  assert.equal(await evaluate(`document.querySelector('#admin-content').parentElement.inert`),false);
  await evaluate(`document.querySelector('[aria-controls="admin-navigation"]').click()`);await pause(100);await viewport(1280);await pause(100);
  assert.equal(await evaluate(`document.querySelector('#admin-content').parentElement.inert`),false);
  assert.equal(await evaluate(`document.querySelector('#admin-navigation').getAttribute('aria-modal')`),null);
  assert.equal(await evaluate(`document.querySelector('[aria-controls="admin-navigation"]').getClientRects().length`),0);
  assert.equal(await evaluate(`document.querySelector('#admin-navigation button').getClientRects().length`),0);
  await widthFits();await snapshot('admin-user-light-desktop');
  await viewport(320);await widthFits();
  await viewport(360);
  for(const route of ['/admin/usuarios/nuevo','/admin/comunidades/nueva','/admin/informes','/admin/auditoria','/admin/casos']){
    await visit(route);await widthFits();
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('plus-admin-user-editor, plus-community-editor, plus-admin-reports, plus-admin-audit, plus-admin-cases')).display`),'block');
    await evaluate(`document.querySelector('[aria-label="Cambiar tema de color"]').click()`);await pause(60);await widthFits();
    if(route==='/admin/usuarios/nuevo'){
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('input')).backgroundColor`),'rgb(22, 25, 34)');
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('input')).fontSize`),'16px');await snapshot('admin-user-dark-mobile');
    }
  }
  // Invalid submissions stay in the browser: summary links focus the exact failing control.
  await visit('/admin/usuarios/nuevo');
  await evaluate(`document.querySelector('#user-editor-submit').click()`);await pause(120);
  assert.equal(await evaluate(`document.activeElement.id`),'user-editor-errors');
  assert.equal(await evaluate(`document.querySelectorAll('#user-editor-errors a').length`),6);
  await evaluate(`document.querySelector('#user-editor-errors a').click()`);await pause(60);
  assert.equal(await evaluate(`document.activeElement.id`),'user-nombres');
  assert.equal(await evaluate(`document.querySelector('#user-nombres').getAttribute('aria-describedby')`),'user-nombres-error');
  assert.equal(await evaluate(`document.querySelector('#user-nombres-error').textContent.includes('100')`),true);
  await evaluate(`const field=document.querySelector('#user-nombres');field.value='Cuenta';field.dispatchEvent(new Event('input',{bubbles:true}))`);await pause(60);
  assert.equal(await evaluate(`document.querySelector('#user-nombres').getAttribute('aria-invalid')`),'false');
  assert.equal(await evaluate(`document.querySelector('#user-nombres-error')`),null);
  await widthFits();await snapshot('user-validation-mobile');
  withCatalogs=true;await visit('/admin/comunidades/nueva');
  await evaluate(`document.querySelector('#community-editor-submit').click()`);await pause(120);
  assert.equal(await evaluate(`document.activeElement.id`),'community-editor-errors');
  assert.equal(await evaluate(`document.querySelectorAll('#community-editor-errors a').length`),3);
  await evaluate(`document.querySelector('#community-editor-errors a').click()`);await pause(60);
  assert.equal(await evaluate(`document.activeElement.id`),'community-department');
  await evaluate(`{const select=document.querySelector('#community-department');select.value='local-department';select.dispatchEvent(new Event('change',{bubbles:true}));}`);await pause(60);
  await evaluate(`{const select=document.querySelector('#community-municipalityId');select.value='local-municipality';select.dispatchEvent(new Event('change',{bubbles:true}));const name=document.querySelector('#community-name');name.value='Comunidad local';name.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#community-editor-submit').click();}`);await pause(120);
  assert.equal(await evaluate(`document.querySelector('#community-review')!==null`),true);
  await evaluate(`Array.from(document.querySelectorAll('#community-review button')).find(button=>button.textContent==='Cancelar').click()`);await pause(60);
  assert.equal(await evaluate(`document.activeElement.id`),'community-editor-submit');
  withCatalogs=false;
  await visit('/ciudadano/perfil','ciudadano');await widthFits();
  await evaluate(`document.querySelector('[aria-controls="citizen-nav"]').focus();document.querySelector('[aria-controls="citizen-nav"]').click()`);await pause(100);
  assert.equal(await evaluate(`document.querySelector('#citizen-nav').contains(document.activeElement)`),true);
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});await pause(100);
  assert.equal(await evaluate(`document.activeElement.getAttribute('aria-controls')`),'citizen-nav');
  assert.equal(await evaluate(`document.querySelector('a[aria-current="page"]').getAttribute('href')`),'/ciudadano/perfil');
  await evaluate(`document.querySelector('[aria-label="Cambiar tema de color"]').click()`);await snapshot('citizen-profile-dark-mobile');
  for(const [route,summary,count] of [['/login','login',2],['/registro','register',6],['/recuperar-contrasena','recovery',1],['/restablecer-contrasena?uid=local&token=local-only','reset',2]]){
    await visit(route);await widthFits();await evaluate(`document.querySelector('button[type="submit"]').click()`);await pause(100);
    assert.equal(await evaluate(`document.activeElement.id`),summary+'-errors');
    assert.equal(await evaluate(`document.querySelectorAll('#${summary}-errors a').length`),count);
    await evaluate(`document.querySelector('#${summary}-errors a').click()`);await pause(60);
    assert.equal(await evaluate(`document.activeElement.getAttribute('aria-invalid')`),'true');
    assert.equal(await evaluate(`!!document.getElementById(document.activeElement.getAttribute('aria-describedby'))`),true);
    await evaluate(`document.querySelector('[aria-label="Cambiar tema de color"]').click()`);await widthFits();
    if(summary==='register'){
      await evaluate(`{for(const field of ['name','surname','email','password','confirmation']){const input=document.querySelector('[formControlName="'+field+'"]');input.value=field==='email'?'local@example.invalid':field==='password'?'local-secret-one':field==='confirmation'?'local-secret-two':'Prueba';input.dispatchEvent(new Event('input',{bubbles:true}));}const consent=document.querySelector('[formControlName="consent"]');consent.checked=true;consent.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('button[type="submit"]').click();}`);await pause(100);
      assert.equal(await evaluate(`document.querySelectorAll('#register-errors a').length`),1);
      assert.equal(await evaluate(`document.querySelector('#register-confirmation').getAttribute('aria-invalid')`),'true');
      assert.equal(await evaluate(`document.querySelector('#register-confirmation-error').textContent`),'Las contraseñas deben coincidir.');
      assert.equal(await evaluate(`document.querySelector('#register-errors').textContent.includes('local-secret')`),false);
      await evaluate(`document.querySelector('button[aria-controls="register-password"]').click()`);
      assert.equal(await evaluate(`document.querySelector('#register-password').type`),'text');
      assert.equal(await evaluate(`document.querySelector('button[aria-controls="register-password"]').getAttribute('aria-pressed')`),'true');
      await evaluate(`document.querySelector('button[aria-controls="register-password"]').click()`);await snapshot('register-validation-dark-mobile');
    }
  }
  await visit('/admin/formularios');await widthFits();
  assert.equal(await evaluate(`document.querySelectorAll('plus-admin-forms article').length`),1);
  await visit('/admin/formularios/nuevo');await widthFits();
  const callsBeforeInvalidForm=apiCalls.length;
  await evaluate(`document.querySelector('button[type="submit"]').click()`);
  await pause(100);assert.equal(apiCalls.length,callsBeforeInvalidForm,'An invalid form draft must not call the API.');
  assert.equal(await evaluate(`location.pathname`),'/admin/formularios/nuevo');
  await snapshot('form-builder-validation-mobile');
  await visit('/ciudadano/formularios','ciudadano');await widthFits();
  assert.equal(await evaluate(`!!document.querySelector('plus-citizen-forms')`),true);
  await visit('/admin/configuracion-institucional','administrador');await widthFits();
  assert.equal(await evaluate(`document.querySelectorAll('plus-institution-settings input, plus-institution-settings textarea').length`),5);
  await visit('/legal/tratamiento_datos');await widthFits();
  assert.equal(await evaluate(`document.querySelector('main h1').textContent.trim()`),'Política local de tratamiento de datos');
  for(const [currentRole,allowed] of [
    ['moderador',['/admin','/admin/casos','/admin/casos/nuevo','/admin/casos-asignados','/admin/mis-casos','/admin/mapa','/admin/informes','/admin/noticias','/admin/iniciativas','/admin/postulaciones','/admin/comentarios']],
    ['representante',['/admin','/admin/casos','/admin/casos/nuevo','/admin/casos-asignados','/admin/mis-casos','/admin/mapa','/admin/informes']],
  ]){
    await visit('/admin/casos',currentRole);
    assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('nav[aria-label="Navegación administrativa"] a')).map(link=>link.getAttribute('href'))`),allowed);
    assert.equal(await evaluate(`!!document.querySelector('a[href="/admin/perfil"]')`),true);
    assert.equal(await evaluate(`!!document.querySelector('a[href="/ciudadano/perfil"]')`),false);
  }
  for(const [currentRole,route,endpoint] of [
    ['moderador','/admin/usuarios/person/editar','/api/v1/admin/users/'],
    ['moderador','/admin/comunidades/nueva','/api/v1/admin/communities/'],
    ['moderador','/admin/formularios','/api/v1/admin/forms/'],
    ['representante','/admin/comentarios','/api/v1/admin/comments/'],
    ['representante','/admin/auditoria','/api/v1/admin/audit-events/'],
    ['ciudadano','/admin/casos','/api/v1/admin/cases/'],
    ['administrador','/ciudadano/perfil','/api/v1/catalogs/'],
  ]){
    role=currentRole;const start=apiCalls.length;await cdp('Page.navigate',{url:origin+route});
    await until(()=>evaluate(`location.pathname==='/acceso-denegado' && !!document.querySelector('h1')`),'denied '+currentRole+' '+route);
    assert.equal(apiCalls.slice(start).some(call=>call.path.startsWith(endpoint)),false,'A denied route must not load the protected API.');
  }
  assert.deepEqual(failures,[]);
  console.log('Local Chrome UI checks passed: mobile keyboard navigation, focus/scroll restoration, desktop resize, current-page links, 360px overflow, dark fields, linked field errors, cancelled review focus and synthetic read-only API.');
  console.log('Screenshots: .angular/ui-review/');
}finally{
  if(cdp)await Promise.race([cdp('Browser.close').catch(()=>{}),pause(1500)]);
  socket?.close();browser.kill();
  assert.ok(profile.startsWith(output+path.sep));
  await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:300}).catch(()=>{});
}

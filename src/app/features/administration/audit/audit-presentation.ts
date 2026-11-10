import { AuditEvent } from './admin-audit-api.service';

// Only known structural metadata is rendered. Never dump raw before/after objects.
export function auditMetadata(value:Record<string,unknown>):{label:string;value:string}[]{
  const fields:Record<string,string>={accion:'Acción',tipo_evento:'Tipo de evento',tipo_accion:'Acción del caso',tipo_cambio:'Cambio de permiso',modulo:'Módulo',tabla_afectada:'Tabla',id_registro:'Registro',caso:'Caso',caso_codigo:'Radicado',usuario:'Actor',usuario_afectado:'Usuario afectado',usuario_responsable:'Responsable',resultado:'Resultado',estado_anterior:'Estado anterior',estado_nuevo:'Estado nuevo',nivel_severidad:'Severidad'};
  return Object.entries(fields).flatMap(([key,label])=>{
    const item=value[key];
    return typeof item==='string' || typeof item==='number' || typeof item==='boolean'?[{label,value:String(item).slice(0,500)}]:[];
  });
}
export function auditCaseId(event:AuditEvent):string|null {
  return /^(?:plus\.)?casos$/.test(event.entity ?? '')?event.entity_id:null;
}
export function auditDateMatches(event:AuditEvent,from:string,to:string):boolean {
  const time=Date.parse(event.timestamp);
  return (!from || time>=Date.parse(`${from}T00:00:00-05:00`)) && (!to || time<=Date.parse(`${to}T23:59:59.999-05:00`));
}

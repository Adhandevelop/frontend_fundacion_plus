import { CaseCorrection, CaseContribution, CaseEvidence, CaseHistory, CaseUpdate } from '../../citizen/services/citizen-cases.models';

export interface AdminCase {
  id_caso:string;codigo:string;titulo:string;descripcion:string;usuario_nombre:string;usuario_correo:string;usuario_telefono:string|null;
  tipo_nombre:string;tipo_categoria:string;tipo_naturaleza:string;comunidad_nombre:string;municipio_nombre:string;departamento_nombre:string;
  estado_nombre:string;estado_publicacion:string;prioridad:string;fecha_creacion:string;fecha_actualizacion:string;
  familias_afectadas:number;meses_afectacion:number;resultado_resumen:string|null;
  ubicacion?:{type:'Point';srid?:4326;coordinates:[number,number]}|null;latitud?:number|null;longitud?:number|null;
  creado_por?:string;creado_por_nombre?:string;creado_por_correo?:string;
  active_assignment:{responsable_nombre:string;responsable:string}|null;
  active_correction_request:CaseCorrection|null;solicitudes_correccion:CaseCorrection[];
  aportes:CaseContribution[];seguimientos:CaseUpdate[];historial_estados:CaseHistory['historial_estados'];evidencias:CaseEvidence[];allowed_actions:string[];
}
export interface AdminCasePage {count:number;next:string|null;previous:string|null;results:AdminCase[]}
export interface AdminCaseFilters {
  page:number;page_size:number;search:string;estado:string;prioridad:string;estado_publicacion:string;
  id_departamento:string;id_municipio:string;id_tipo_caso:string;
  scope?:'assigned';assigned_to_me?:boolean;created_by_me?:boolean;
}
export interface AdminFollowedCase {id:string;id_seguimiento_usuario:string;id_caso:string;codigo:string;titulo:string;estado_nombre:string;comunidad_nombre:string;municipio_nombre:string;tipo_nombre:string;prioridad:string;estado_publicacion:string;activo:boolean;fecha_creacion:string;fecha_baja:string|null}
export interface AdminFollowedCasePage {count:number;results:AdminFollowedCase[]}
export interface AdminDashboard {
  cases:{total:number;by_estado_publicacion:Record<string,number>;by_estado_operativo:Record<string,number>;by_prioridad:Record<string,number>;open_correction_requests:number};
  moderation_queues:{pending_cases:number;pending_comments:number;pending_proposals:number};
  territories:{municipalities:number;communities:number};
  content:{initiatives_published:number;initiatives_draft:number;news_published:number};
  users:{total_active:number};
}
export interface ResponsibleCandidate {id_usuario:string;nombres:string;apellidos:string;estado:string;primary_role:string}
export interface CandidatePage {count:number;next:string|null;previous:string|null;results:ResponsibleCandidate[]}
export type AdminAction =
  | {kind:'evidence';evidenceId:string;payload:{descripcion:string;audiencia:string;estado_revision:string}}
  | {kind:'moderation';payload:{estado_publicacion:string;motivo:string;prioridad:string}}
  | {kind:'correction-requests';payload:{motivo:string}}
  | {kind:'assignments';payload:{id_responsable:string;motivo:string}}
  | {kind:'progress';payload:{titulo:string;descripcion:string;audiencia:string;visible_publicamente:boolean;estado?:string};files?:File[];evidenceDescription?:string}
  | {kind:'resolution';payload:{estado:string;motivo:string;resultado_resumen:string}};

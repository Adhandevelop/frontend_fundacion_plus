export interface CaseType {id_tipo_caso: string; nombre: string; categoria: string; naturaleza: string; activo: boolean}
export interface CaseState {id_estado: string; nombre: string; descripcion: string | null}
export interface CaseEvidence {
  id_evidencia: string; nombre_original: string | null; descripcion: string | null;
  tamano_bytes: number | null; mime_type: string | null; audiencia: string; estado_revision: string; fecha_subida: string;
}
export interface CaseCorrection {id_solicitud: string; motivo: string; estado: string; fecha_solicitud: string; respuesta: string | null}
export interface CaseUpdate {id_seguimiento: string; titulo: string; descripcion: string; audiencia: string; fecha_seguimiento: string}
export interface CaseContribution {id_aporte: string; contenido: string; fecha_creacion: string; evidencias: CaseEvidence[]}
export interface CaseHistory {
  id_caso: string; codigo: string;
  seguimientos: CaseUpdate[];
  historial_estados: {id_historial:string; estado_anterior_nombre?:string|null; estado_nuevo_nombre:string; motivo:string|null; fecha_cambio:string}[];
}
export interface CitizenCase {
  id_caso: string; codigo: string; titulo: string; descripcion: string; tipo_nombre: string;
  comunidad_nombre: string; municipio_nombre: string; departamento_nombre: string;
  estado_nombre: string; estado_publicacion: string; prioridad: string;
  familias_afectadas: number; meses_afectacion: number; direccion_referencia: string | null;
  resultado_resumen: string | null; fecha_creacion: string; fecha_actualizacion: string;
  active_correction_request: CaseCorrection | null; solicitudes_correccion: CaseCorrection[];
  active_assignment: {responsable_nombre?: string} | null;
  seguimientos: CaseUpdate[]; evidencias: CaseEvidence[]; aportes: CaseContribution[]; allowed_actions: string[];
}
export interface CitizenDashboard {
  total_cases: number; pendientes_publicacion: number; aprobados_publicacion: number;
  en_gestion: number; resueltos_o_cerrados: number; open_correction_requests: number;
  unread_notifications: number; unread_messages: number; followed_cases_count: number;
}
export interface CreateCaseRequest {
  titulo: string; descripcion: string; id_tipo_caso: string; id_comunidad: string;
  prioridad: string; familias_afectadas: number; meses_afectacion: number;
  acepta_tratamiento_datos: boolean; latitud?: number; longitud?: number;
}
export interface CasePage {count: number; next: string | null; previous: string | null; results: CitizenCase[]}
export function caseStateLabel(value: string): string {
  return ({pendiente:'Pendiente',en_revision:'En revisión',en_proceso:'En proceso',resuelto:'Resuelto',cerrado:'Cerrado',aprobado:'Aprobado',rechazado:'Rechazado',baja:'Baja',media:'Media',alta:'Alta',critica:'Crítica',abierta:'Abierta',respondida:'Respondida'} as Record<string,string>)[value] ?? value;
}

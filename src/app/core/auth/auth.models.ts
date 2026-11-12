import { AccountPermissions } from './account-permissions';

export interface UserProfile {
  id_perfil: string;
  foto_url: string | null;
  ruta_foto: string | null;
  id_departamento: string | null;
  departamento_nombre?: string | null;
  id_municipio: string | null;
  municipio_nombre?: string | null;
  id_comunidad: string | null;
  comunidad_nombre?: string | null;
}
export interface UserPreferences {
  notificar_novedades_casos: boolean;
  notificar_mensajes: boolean;
  suscrito_boletin: boolean;
}
export interface AccountUser {
  id_usuario: string;
  nombres: string;
  apellidos: string;
  full_name: string;
  correo: string;
  telefono: string | null;
  estado: 'activo' | 'suspendido' | 'inactivo';
  primary_role: string;
  rol_nombre: string;
  permissions: AccountPermissions;
  can_manage_homepage?: boolean;
  can_manage_forms?: boolean;
  perfil: UserProfile | null;
  preferencias: UserPreferences | null;
}
export interface SessionTokens {access: string; refresh: string}
export interface AuthResponse {user: AccountUser; tokens: SessionTokens}
export interface RegisterRequest {
  nombres: string; apellidos: string; correo: string; telefono: string;
  password: string; acepta_tratamiento_datos: boolean;
}
export interface UpdateAccountRequest {
  nombres: string; apellidos: string; correo: string; telefono: string;
  id_departamento: string | null; id_municipio: string | null; id_comunidad: string | null;
}

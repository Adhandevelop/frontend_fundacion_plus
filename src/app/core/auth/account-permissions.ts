export type AccountPermissions = Record<string, boolean | string[]>;

const ADMIN_FLAGS = ['can_moderate_cases', 'can_assign_cases', 'can_resolve_cases', 'can_manage_users', 'can_view_audit', 'can_export_reports'];
// Module/action grants returned by /me/ and defined in the backend's ROLE_PERMISSIONS_MAP.
const ADMIN_ACTIONS: Record<string, string[]> = {
  casos: ['ver_asignados', 'seguimiento', 'cambiar_estado', 'revisar_publicacion', 'moderar_comentarios'],
  iniciativas: ['crear', 'editar', 'publicar', 'registrar_actividades', 'multimedia', 'indicadores'],
  propuestas: ['revisar'],
  usuarios: ['crear', 'editar', 'cambiar_rol', 'asignar_ambito'],
  territorios: ['crear', 'editar', 'eliminar'],
  auditoria: ['consultar'],
  configuracion: [],
};

export function canAccessAdministration(permissions: AccountPermissions | null | undefined): boolean {
  if (!permissions) return false;
  const global = permissions['all'];
  if (Array.isArray(global) && global.includes('*')) return true;
  if (ADMIN_FLAGS.some(key => permissions[key] === true)) return true;
  return Object.entries(ADMIN_ACTIONS).some(([module, actions]) => {
    const grants = permissions[module];
    return Array.isArray(grants) && (grants.includes('*') || actions.some(action => grants.includes(action)));
  });
}

import { AccountUser } from './auth.models';
import { canAccessAdministration } from './account-permissions';

// Role boundaries of the current backend view permissions. Per-case actions still use allowed_actions.
const INTERNAL = ['administrador', 'moderador', 'representante'];
const EDITORIAL = ['administrador', 'moderador'];
const ADMIN_ONLY = ['administrador'];
export const ADMIN_SECTION_ROLES = {
  dashboard: INTERNAL, cases: INTERNAL, reports: INTERNAL, profile: INTERNAL, map: INTERNAL,
  users: ADMIN_ONLY, roles: ADMIN_ONLY, territories: ADMIN_ONLY, audit: ADMIN_ONLY,
  forms: ADMIN_ONLY, homepage: ADMIN_ONLY,
  news: EDITORIAL, initiatives: EDITORIAL, proposals: EDITORIAL, comments: EDITORIAL,
} as const;
export type AdminSection = keyof typeof ADMIN_SECTION_ROLES;

export function canAccessAdminSection(user: AccountUser | null | undefined, section: unknown): boolean {
  if (!user || user.estado !== 'activo' || !canAccessAdministration(user.permissions)) return false;
  if (typeof section !== 'string' || !Object.prototype.hasOwnProperty.call(ADMIN_SECTION_ROLES, section)) return false;
  if (section === 'forms' && user.can_manage_forms !== true && user.permissions['can_manage_forms'] !== true) return false;
  if (section === 'homepage' && user.can_manage_homepage !== true && user.permissions['can_manage_homepage'] !== true) return false;
  return ADMIN_SECTION_ROLES[section as AdminSection].includes(user.primary_role);
}

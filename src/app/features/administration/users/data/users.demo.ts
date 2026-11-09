// Frontend-only models. These are not account or authorization API contracts.
export const DEMO_ROLES = [
  {id: 'citizen', name: 'Ciudadano', description: 'Registra casos y consulta su información.'},
  {id: 'responsible', name: 'Responsable', description: 'Gestiona los casos que le sean asignados.'},
  {id: 'editor', name: 'Editor institucional', description: 'Gestiona noticias e iniciativas según permisos.'},
  {id: 'admin', name: 'Administrador', description: 'Supervisa casos, usuarios, territorios y contenidos.'},
  {id: 'superadmin', name: 'Superadministrador', description: 'Administra configuración y permisos globales.'},
] as const;
export type DemoRoleId = typeof DEMO_ROLES[number]['id'];
export interface DemoUserInput {name: string; email: string; roles: readonly DemoRoleId[];}
export interface DemoUser extends DemoUserInput {id: string; active: boolean; modified: boolean; origin: 'fixture' | 'local';}
export const DEMO_USERS: readonly DemoUser[] = [
  {id: 'demo-1', name: 'Ciudadana de ejemplo', email: 'ciudadana@example.invalid', roles: ['citizen'], active: true, modified: false, origin: 'fixture'},
  {id: 'demo-2', name: 'Responsable de ejemplo', email: 'responsable@example.invalid', roles: ['responsible'], active: true, modified: false, origin: 'fixture'},
  {id: 'demo-3', name: 'Editora de ejemplo', email: 'editora@example.invalid', roles: ['editor'], active: true, modified: false, origin: 'fixture'},
  {id: 'demo-4', name: 'Administración de ejemplo', email: 'administracion@example.invalid', roles: ['admin', 'responsible'], active: true, modified: false, origin: 'fixture'},
  {id: 'demo-5', name: 'Superadministración de ejemplo', email: 'configuracion@example.invalid', roles: ['superadmin'], active: true, modified: false, origin: 'fixture'},
  {id: 'demo-6', name: 'Ciudadano inactivo de ejemplo', email: 'inactivo@example.invalid', roles: ['citizen'], active: false, modified: false, origin: 'fixture'},
];
export function demoRoleName(id: DemoRoleId): string {return DEMO_ROLES.find(role => role.id === id)?.name ?? id;}
export interface DemoUserFilters {query: string; role: string; state: string;}
export function filterDemoUsers(users: readonly DemoUser[], filters: DemoUserFilters): readonly DemoUser[] {
  const normalize = (value: string) => value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return users.filter(user => normalize(`${user.name} ${user.email} ${user.id}`).includes(normalize(filters.query)) &&
    (!filters.role || user.roles.some(role => role === filters.role)) &&
    (!filters.state || (filters.state === 'active' ? user.active : !user.active)));
}

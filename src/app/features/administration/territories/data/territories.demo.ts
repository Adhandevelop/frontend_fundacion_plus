// Local presentation fixtures, not geographic reference data or REST DTOs.
export const COMMUNITY_TYPES = ['barrio', 'vereda', 'corregimiento', 'comuna', 'sector', 'otro'] as const;
export type CommunityType = typeof COMMUNITY_TYPES[number];
export const DEPARTMENTS_DEMO = [{id: 'dep-choco', name: 'Chocó'}, {id: 'dep-antioquia', name: 'Antioquia'}] as const;
export const MUNICIPALITIES_DEMO = [
  {id: 'mun-riosucio', departmentId: 'dep-choco', name: 'Riosucio'},
  {id: 'mun-bojaya', departmentId: 'dep-choco', name: 'Bojayá'},
  {id: 'mun-carmen', departmentId: 'dep-choco', name: 'Carmen del Darién'},
  {id: 'mun-vigia', departmentId: 'dep-antioquia', name: 'Vigía del Fuerte'},
] as const;
export interface CommunityInput {municipalityId: string; name: string; type: CommunityType; description: string;}
export interface CommunityDemo extends CommunityInput {id: string; active: boolean; modified: boolean; origin: 'fixture' | 'local';}
export const COMMUNITIES_DEMO: readonly CommunityDemo[] = [
  {id: 'com-1', municipalityId: 'mun-riosucio', name: 'El Porvenir', type: 'vereda', description: 'Comunidad de referencia del diseño. Sin perímetro geográfico disponible.', active: true, modified: false, origin: 'fixture'},
  {id: 'com-2', municipalityId: 'mun-bojaya', name: 'Bellavista', type: 'sector', description: 'Registro de demostración para explorar los filtros territoriales.', active: true, modified: false, origin: 'fixture'},
  {id: 'com-3', municipalityId: 'mun-carmen', name: 'Curvaradó', type: 'otro', description: 'Tipo usado solo como ejemplo de interfaz; pendiente de catálogo territorial validado.', active: true, modified: false, origin: 'fixture'},
  {id: 'com-4', municipalityId: 'mun-vigia', name: 'Sector de ejemplo', type: 'sector', description: 'Ejemplo ficticio inactivo. No representa una delimitación oficial.', active: false, modified: false, origin: 'fixture'},
];
export function communityTerritory(municipalityId: string) {
  const municipality = MUNICIPALITIES_DEMO.find(item => item.id === municipalityId);
  const department = DEPARTMENTS_DEMO.find(item => item.id === municipality?.departmentId);
  return {municipality: municipality?.name ?? 'No disponible', department: department?.name ?? 'No disponible', departmentId: department?.id ?? ''};
}
export interface CommunityFilters {query: string; departmentId: string; municipalityId: string; type: string; state: string;}
export const EMPTY_COMMUNITY_FILTERS: CommunityFilters = {query: '', departmentId: '', municipalityId: '', type: '', state: ''};
export function filterCommunities(rows: readonly CommunityDemo[], filters: CommunityFilters): readonly CommunityDemo[] {
  const normalize = (text: string) => text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return rows.filter(row => {
    const territory = communityTerritory(row.municipalityId);
    return normalize(`${row.name} ${row.description} ${territory.municipality} ${territory.department}`).includes(normalize(filters.query)) &&
      (!filters.departmentId || territory.departmentId === filters.departmentId) && (!filters.municipalityId || row.municipalityId === filters.municipalityId) &&
      (!filters.type || row.type === filters.type) && (!filters.state || (filters.state === 'active' ? row.active : !row.active));
  });
}

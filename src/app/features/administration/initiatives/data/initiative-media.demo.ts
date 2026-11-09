export type InitiativeMediaKind = 'imagen' | 'video' | 'documento';
export interface InitiativeMediaMeta {alt: string; description: string; order: number;}
export interface InitiativeMediaDemo extends InitiativeMediaMeta {id: string; programId: string; editionId: string | null; kind: InitiativeMediaKind; url: string; name: string; size: number | null; cover: boolean; origin: 'fixture' | 'local';}
export function initiativeFileKind(file: Pick<File, 'name' | 'type' | 'size'>): InitiativeMediaKind | null {
  if (!Number.isFinite(file.size) || file.size <= 0) return null;
  if (file.size <= 5 * 1024 * 1024 && /\.(jpe?g|png|webp)$/i.test(file.name) && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'imagen';
  if (file.size <= 25 * 1024 * 1024 && /\.(mp4|webm)$/i.test(file.name) && ['video/mp4', 'video/webm'].includes(file.type)) return 'video';
  if (file.size <= 10 * 1024 * 1024 && /\.pdf$/i.test(file.name) && file.type === 'application/pdf') return 'documento';
  return null;
}
export function validMediaMeta(value: InitiativeMediaMeta, kind: InitiativeMediaKind): boolean {
  return Number.isInteger(value.order) && value.order >= 0 && value.order <= 2147483647 && value.alt.length <= 250 && (kind !== 'imagen' || Boolean(value.alt.trim()));
}

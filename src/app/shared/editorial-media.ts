export type EditorialMediaKind = 'imagen' | 'video' | 'documento';

export interface EditorialMedia {
  id: string;
  kind: EditorialMediaKind;
  url: string;
  path: string;
  alt: string;
  description: string;
  cover: boolean;
  order: number;
  editionId: string | null;
}

const allowedTypes = new Map<string, EditorialMediaKind>([
  ['image/jpeg', 'imagen'], ['image/png', 'imagen'], ['image/webp', 'imagen'], ['image/gif', 'imagen'],
  ['video/mp4', 'video'], ['video/quicktime', 'video'], ['video/webm', 'video'], ['application/pdf', 'documento'],
]);

const allowedExtension = /\.(jpe?g|png|webp|gif|mp4|mov|webm|pdf)$/i;
export const EDITORIAL_FILE_LIMIT = 15 * 1024 * 1024;

export function editorialFileKind(file: Pick<File, 'name' | 'type' | 'size'>): EditorialMediaKind | null {
  if (!Number.isFinite(file.size) || file.size <= 0 || file.size > EDITORIAL_FILE_LIMIT || !allowedExtension.test(file.name)) return null;
  return allowedTypes.get(file.type.toLowerCase()) ?? null;
}

export function mapEditorialMedia(row: any): EditorialMedia {
  return {
    id: row.id ?? row.id_multimedia,
    kind: row.tipo_archivo ?? row.tipo ?? 'documento',
    url: row.url ?? row.url_archivo ?? row.ruta_archivo ?? '',
    path: row.ruta_archivo ?? '',
    alt: row.texto_alternativo ?? '',
    description: row.descripcion ?? '',
    cover: Boolean(row.es_portada),
    order: Number(row.orden ?? 0),
    editionId: row.edicion ?? row.id_edicion ?? null,
  };
}

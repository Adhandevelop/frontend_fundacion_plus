export interface PublicCaseMapProperties {
  id_caso: string;
  codigo: string;
  radicado_code: string;
  titulo: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica' | string;
  id_estado: string;
  estado: string;
  id_tipo_caso: string;
  tipo: string;
  categoria: string;
  naturaleza: string;
  id_comunidad: string;
  comunidad: string;
  id_municipio: string;
  municipio: string;
  id_departamento: string;
  departamento: string;
  longitud: number;
  latitud: number;
  fecha_creacion: string;
}

export interface PublicCaseMapFeature {
  type: 'Feature';
  id: string;
  geometry: {type: 'Point'; srid?: 4326; coordinates: [number, number]};
  properties: PublicCaseMapProperties;
}

export interface PublicCaseFeatureCollection {
  type: 'FeatureCollection';
  srid?: 4326;
  count: number;
  features: PublicCaseMapFeature[];
}

export interface PublicCaseMapFilters {
  search?: string;
  naturaleza?: string;
  categoria?: string;
  estado?: string;
  id_estado?: string;
  prioridad?: string;
  id_departamento?: string;
  id_municipio?: string;
  id_comunidad?: string;
  id_tipo_caso?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  bbox?: string;
}

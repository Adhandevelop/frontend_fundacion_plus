import {HttpClient, HttpParams} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {map} from 'rxjs';
import {API_BASE_URL} from '../../core/api/api.config';
import {PublicCaseFeatureCollection, PublicCaseMapFeature, PublicCaseMapFilters} from './map-cases.models';

const emptyCollection = (): PublicCaseFeatureCollection => ({type: 'FeatureCollection', count: 0, features: []});

function validFeature(value: unknown): value is PublicCaseMapFeature {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<PublicCaseMapFeature>;
  const coordinates = row.geometry?.coordinates;
  return row.type === 'Feature' && row.geometry?.type === 'Point' &&
    Array.isArray(coordinates) && coordinates.length >= 2 &&
    Number.isFinite(Number(coordinates[0])) && Number.isFinite(Number(coordinates[1])) &&
    !!row.properties?.id_caso && !!(row.properties.codigo || row.properties.radicado_code);
}

@Injectable({providedIn: 'root'})
export class MapCasesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  geojson(filters: PublicCaseMapFilters = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      const normalized = String(value ?? '').trim();
      if (normalized) params = params.set(key, normalized);
    }
    return this.http.get<PublicCaseFeatureCollection>(`${this.base}/public/cases/geojson/`, {params}).pipe(
      map(response => {
        if (!response || response.type !== 'FeatureCollection' || !Array.isArray(response.features)) return emptyCollection();
        const features = response.features.filter(validFeature).map(feature => ({
          ...feature,
          geometry: {...feature.geometry, coordinates: [Number(feature.geometry.coordinates[0]), Number(feature.geometry.coordinates[1])]},
        } as PublicCaseMapFeature));
        return {...response, count: Number.isFinite(Number(response.count)) ? Number(response.count) : features.length, features};
      }),
    );
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { API_BASE_URL } from './api.config';

export const INSTITUTION_SETTING_KEYS = {
  corporationName: 'institucion.nombre',
  acronym: 'institucion.sigla',
  representativeName: 'institucion.representante_nombre',
  representativeRole: 'institucion.representante_cargo',
  mission: 'institucion.mision',
} as const;

export interface InstitutionSettings {
  corporationName: string;
  acronym: string;
  representativeName: string;
  representativeRole: string;
  mission: string;
}

interface SiteSettingDto {
  id: string;
  id_configuracion: string;
  clave?: string;
  key?: string;
  valor?: unknown;
  value?: unknown;
  fecha_actualizacion: string;
}

type SiteSettingCollection = SiteSettingDto[] | {results: SiteSettingDto[]};

const DEFAULTS: InstitutionSettings = {
  corporationName: 'Corporación Pluralismo Social',
  acronym: 'PLUS',
  representativeName: 'JUAN DAVID MARTINEZ BOLAÑO',
  representativeRole: 'CEO de la Corporación Pluralismo Social',
  mission: 'Fortalecer la participación ciudadana, la veeduría social y el acompañamiento territorial de las comunidades mediante gestión transparente e iniciativas de impacto.',
};

@Injectable({providedIn: 'root'})
export class InstitutionSettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  get() {
    return this.list().pipe(map(rows => ({
      values: this.toValues(rows),
      updatedAt: rows.reduce<string | null>((latest, row) => !latest || row.fecha_actualizacion > latest ? row.fecha_actualizacion : latest, null),
    })));
  }

  save(values: InstitutionSettings): Observable<InstitutionSettings> {
    return this.list().pipe(
      map(rows => new Map(rows.map(row => [row.clave ?? row.key ?? '', row]))),
      map(existing => Object.entries(INSTITUTION_SETTING_KEYS).map(([field, key]) => {
        const value = values[field as keyof InstitutionSettings].trim();
        const row = existing.get(key);
        return row
          ? this.http.patch<SiteSettingDto>(`${this.base}/admin/settings/${encodeURIComponent(row.id_configuracion || row.id)}/`, {clave: key, valor: value})
          : this.http.post<SiteSettingDto>(`${this.base}/admin/settings/`, {clave: key, valor: value});
      })),
      switchMap(requests => forkJoin(requests)),
      map(rows => this.toValues(rows)),
    );
  }

  private list() {
    return this.http.get<SiteSettingCollection>(`${this.base}/admin/settings/`, {params: {page_size: 100}})
      .pipe(map(value => Array.isArray(value) ? value : value.results));
  }

  private toValues(rows: SiteSettingDto[]): InstitutionSettings {
    const settings = new Map(rows.map(row => [row.clave ?? row.key ?? '', row.valor ?? row.value]));
    const text = (key: string, fallback: string) => {
      const value = settings.get(key);
      return typeof value === 'string' && value.trim() ? value : fallback;
    };
    return {
      corporationName: text(INSTITUTION_SETTING_KEYS.corporationName, DEFAULTS.corporationName),
      acronym: text(INSTITUTION_SETTING_KEYS.acronym, DEFAULTS.acronym),
      representativeName: text(INSTITUTION_SETTING_KEYS.representativeName, DEFAULTS.representativeName),
      representativeRole: text(INSTITUTION_SETTING_KEYS.representativeRole, DEFAULTS.representativeRole),
      mission: text(INSTITUTION_SETTING_KEYS.mission, DEFAULTS.mission),
    };
  }
}

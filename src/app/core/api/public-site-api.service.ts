import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { shareReplay } from 'rxjs';
import { API_BASE_URL } from './api.config';

export type LegalDocumentType = 'tratamiento_datos' | 'terminos_uso' | 'radicacion_caso' | 'boletin';

export interface PublicLegalDocument {
  id: string;
  id_documento: string;
  tipo: LegalDocumentType;
  version: string;
  titulo: string;
  contenido: string;
  vigente: boolean;
  fecha_vigencia: string;
}

export interface PublicSiteInfo {
  institucion: unknown;
  configuracion: Record<string, unknown>;
  documentos_legales: PublicLegalDocument[];
}

@Injectable({providedIn: 'root'})
export class PublicSiteApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private readonly site$ = this.http.get<PublicSiteInfo>(`${this.base}/public/site/`).pipe(shareReplay({bufferSize: 1, refCount: true}));

  get() {return this.site$;}
}

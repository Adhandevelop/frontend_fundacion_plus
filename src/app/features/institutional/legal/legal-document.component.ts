import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { LegalDocumentType, PublicLegalDocument, PublicSiteApiService } from '../../../core/api/public-site-api.service';

const TYPES = new Set<LegalDocumentType>(['tratamiento_datos', 'terminos_uso', 'radicacion_caso', 'boletin']);

@Component({
  selector: 'plus-legal-document',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './legal-document.component.html',
})
export class LegalDocumentComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PublicSiteApiService);
  private readonly destroy = inject(DestroyRef);
  readonly loading = signal(true);
  readonly document = signal<PublicLegalDocument | null>(null);
  readonly error = signal('');

  constructor() {
    combineLatest([this.route.paramMap, this.api.get()]).pipe(
      map(([params, site]) => {
        const raw = params.get('tipo') ?? '';
        return TYPES.has(raw as LegalDocumentType) ? site.documentos_legales.find(item => item.tipo === raw && item.vigente) ?? null : null;
      }),
      takeUntilDestroyed(this.destroy),
    ).subscribe({
      next: document => {this.document.set(document); this.loading.set(false);},
      error: error => {this.error.set(apiErrorMessage(error)); this.loading.set(false);},
    });
  }
}

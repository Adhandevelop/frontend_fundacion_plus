import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PublicLegalDocument, PublicSiteApiService } from '../../../../core/api/public-site-api.service';

@Component({selector:'plus-site-footer', standalone:true, imports:[RouterLink], templateUrl:'./site-footer.component.html'})
export class SiteFooterComponent {
  private readonly api=inject(PublicSiteApiService);private readonly destroy=inject(DestroyRef);
  readonly legalDocuments=signal<PublicLegalDocument[]>([]);
  constructor(){this.api.get().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:site=>this.legalDocuments.set(site.documentos_legales.filter(document=>document.vigente))});}
}

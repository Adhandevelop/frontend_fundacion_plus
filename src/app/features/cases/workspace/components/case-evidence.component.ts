import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { DemoAudience, DemoEvidence } from '../data/case-workspace.demo';

@Component({
  selector: 'plus-case-demo-evidence', standalone: true, imports: [DecimalPipe],
  template: `<section class="dossier-panel space-y-5"><h2 class="text-headline-sm">Evidencias y documentos</h2><p class="text-body-sm">Se muestran nombres y tamaños de ejemplo. No hay archivos descargables ni transferencias al servidor.</p><div class="grid sm:grid-cols-2 gap-4">@for(item of items();track item.id){<article class="rounded-xl border border-slate-400/30 p-4 space-y-3"><span class="material-symbols-outlined text-[32px]" aria-hidden="true">{{item.name.toLowerCase().endsWith('.pdf') ? 'picture_as_pdf' : 'image'}}</span><h3 class="text-title-sm break-all">{{item.name}}</h3><p class="text-label-sm">{{item.size / 1024 | number:'1.0-0'}} KB · {{item.origin === 'example' ? 'Metadatos de ejemplo' : 'Seleccionado localmente'}}</p><p class="text-label-sm">{{item.visibility === 'public' ? 'Marcado como público en esta simulación' : 'Reservado al ciudadano y al equipo de ejemplo'}}</p>@if(audience() === 'admin'){<button type="button" class="dossier-button" (click)="toggle.emit(item.id)">{{item.visibility === 'public' ? 'Reservar en la demostración' : 'Marcar público en la demostración'}}</button>}</article>}@empty{<p class="text-body-sm">Este caso de ejemplo no tiene evidencias.</p>}</div></section>`,
})
export class CaseEvidenceWorkspaceComponent {
  readonly items = input.required<readonly DemoEvidence[]>();
  readonly audience = input.required<DemoAudience>();
  readonly toggle = output<number>();
}

import { Component, computed, inject, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CaseDescriptionComponent } from './components/description/description.component';
import { CaseEvidenceComponent } from './components/evidence/evidence.component';
import { CaseTimelineComponent } from './components/timeline/timeline.component';
import { CaseResultsComponent } from './components/results/results.component';
import { CaseParticipationComponent } from './components/participation/participation.component';
import { CaseSidebarComponent } from './components/sidebar/sidebar.component';

@Component({
 selector:'plus-public-case', standalone:true,
 imports:[RouterLink,CaseDescriptionComponent,CaseEvidenceComponent,CaseTimelineComponent,CaseResultsComponent,CaseParticipationComponent,CaseSidebarComponent],
 templateUrl:'./public-case.component.html', styleUrl:'./public-case.component.css',
 encapsulation:ViewEncapsulation.None,
})
export class PublicCaseComponent {
 private readonly route=inject(ActivatedRoute);
 private readonly params=toSignal(this.route.paramMap,{initialValue:this.route.snapshot.paramMap});
 readonly isDemoCase=computed(()=>this.params().get('radicado') === 'PLUS-2025-084');
 readonly shareMessage=signal('');
 async copyLink() {
  try { await navigator.clipboard.writeText(location.href); this.shareMessage.set('Enlace copiado.'); }
  catch { this.shareMessage.set('Puedes copiar el enlace desde la barra de direcciones del navegador.'); }
 }
}

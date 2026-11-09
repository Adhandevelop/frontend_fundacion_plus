import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { DEMO_VISIBILITY, DemoAudience, DemoHistory, historyForAudience } from '../data/case-workspace.demo';

@Component({
  selector: 'plus-case-demo-history', standalone: true, imports: [DatePipe],
  template: `<section class="dossier-panel"><h2 class="text-headline-sm mb-5">Seguimiento del caso</h2><ol class="space-y-5 border-l-2 border-yellow-400 pl-5">@for(item of visible();track item.id){<li class="relative"><span class="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-yellow-400"></span><p class="text-label-sm opacity-75">{{item.date | date:'dd/MM/yyyy HH:mm':'-0500'}} · {{labels[item.visibility]}}</p><h3 class="text-title-md mt-1">{{item.title}}</h3><p class="text-body-sm mt-2 whitespace-pre-wrap break-words">{{item.description}}</p></li>}@empty{<li>No hay avances visibles para esta vista.</li>}</ol></section>`,
})
export class CaseHistoryComponent {
  readonly items = input.required<readonly DemoHistory[]>();
  readonly audience = input.required<DemoAudience>();
  readonly labels = DEMO_VISIBILITY;
  readonly visible = computed(() => historyForAudience(this.items(), this.audience()));
}

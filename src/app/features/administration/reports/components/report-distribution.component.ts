import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ReportDistribution } from '../data/report-view.model';

@Component({selector: 'plus-report-distribution', standalone: true, imports: [DecimalPipe], template: `
  <section class="admin-panel border rounded-xl p-5 h-full space-y-4">
    <h2 class="text-title-md">{{title()}}</h2>
    <ul class="space-y-4">
      @for(item of items(); track item.label) {
        <li>
          <div class="flex justify-between gap-3 text-body-sm mb-2"><span>{{item.label}}</span><span class="shrink-0">{{item.count}} · {{item.percent | number:'1.0-1'}} %</span></div>
          <div class="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden" aria-hidden="true"><div class="h-full bg-yellow-400 rounded-full" [style.width.%]="item.percent"></div></div>
        </li>
      } @empty {<li class="text-body-sm py-5">No hay datos para los filtros seleccionados.</li>}
    </ul>
  </section>
`})
export class ReportDistributionComponent {
  readonly title = input.required<string>();
  readonly items = input.required<readonly ReportDistribution[]>();
}

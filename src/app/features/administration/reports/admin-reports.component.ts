import { Component, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminReportsDemoService } from './services/admin-reports-demo.service';
import { EMPTY_REPORT_FILTERS, ReportFilters, filterReportRows, reportDistribution } from './data/report-view.model';
import { ReportDistributionComponent } from './components/report-distribution.component';

@Component({selector: 'plus-admin-reports', standalone: true, imports: [RouterLink, ReportDistributionComponent], templateUrl: './admin-reports.component.html'})
export class AdminReportsComponent {
  readonly reports = inject(AdminReportsDemoService);
  private readonly document = inject(DOCUMENT);
  readonly filters = signal<ReportFilters>({...EMPTY_REPORT_FILTERS});
  readonly status = signal('');
  readonly filtered = computed(() => filterReportRows(this.reports.rows(), this.filters()));
  readonly territories = computed(() => [...new Set(this.reports.rows().map(row => row.territory))].sort());
  readonly categories = computed(() => [...new Set(this.reports.rows().map(row => row.category))].sort());
  readonly assignees = computed(() => [...new Set(this.reports.rows().map(row => row.assignee))].sort());
  readonly managementStates = ['Recibido', 'Asignado', 'En gestión', 'Resuelto', 'Cerrado'];
  readonly moderationStates = ['Pendiente', 'Aprobado', 'Rechazado'];
  readonly managementDistribution = computed(() => reportDistribution(this.filtered(), 'management'));
  readonly categoryDistribution = computed(() => reportDistribution(this.filtered(), 'category'));
  readonly metrics = computed(() => {
    const rows = this.filtered();
    return [{label: 'Casos incluidos', value: rows.length},
      {label: 'En gestión o por gestionar', value: rows.filter(row => !['Resuelto', 'Cerrado'].includes(row.management)).length},
      {label: 'Resueltos o cerrados', value: rows.filter(row => ['Resuelto', 'Cerrado'].includes(row.management)).length},
      {label: 'Publicación por revisar', value: rows.filter(row => row.moderation === 'Pendiente').length}];
  });
  change(key: keyof ReportFilters, value: string) {this.filters.update(current => ({...current, [key]: value})); this.status.set('');}
  reset() {this.filters.set({...EMPTY_REPORT_FILTERS}); this.status.set('');}
  download() {
    const rows = this.filtered();
    if (!rows.length) {this.status.set('No hay filas para descargar con estos filtros.'); return;}
    const url = URL.createObjectURL(new Blob([this.reports.csv(rows)], {type: 'text/csv;charset=utf-8'}));
    const anchor = this.document.createElement('a');
    anchor.href = url; anchor.download = 'plus-informe-DEMOSTRACION.csv';
    this.document.body.appendChild(anchor);
    try {anchor.click(); this.status.set(`Descarga CSV solicitada: ${rows.length} casos de ejemplo con los filtros actuales.`);}
    finally {anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);}
  }
}

import { Injectable, computed, inject } from '@angular/core';
import { ADMIN_CASES_DEMO } from '../../data/admin-cases.demo';
import { CaseWorkspaceDemoService } from '../../../cases/workspace/services/case-workspace-demo.service';
import { ReportRow } from '../data/report-view.model';
import { createCsv } from '../../../../shared/utils/csv';

@Injectable({providedIn: 'root'})
export class AdminReportsDemoService {
  private readonly workspace = inject(CaseWorkspaceDemoService);
  readonly rows = computed<readonly ReportRow[]>(() => ADMIN_CASES_DEMO.map(row => {
    const workflow = this.workspace.workflow(row.code);
    return {code: row.code, title: row.title, territory: row.territory, category: row.category, date: row.date,
      originalStatus: row.status, management: workflow.management, moderation: workflow.moderation,
      assignee: workflow.assignee, modified: this.workspace.modified(row.code)};
  }));
  csv(rows: readonly ReportRow[]): string {
    return createCsv([
      ['Contenido', 'Código de ejemplo', 'Título', 'Territorio', 'Categoría', 'Fecha del diseño', 'Estado del diseño', 'Gestión simulada', 'Publicación simulada', 'Responsable de ejemplo', 'Modificado en esta pestaña'],
      ...rows.map(row => ['DEMOSTRACIÓN · SIN VALIDEZ INSTITUCIONAL', row.code, row.title, row.territory, row.category, row.date, row.originalStatus, row.management, row.moderation, row.assignee, row.modified ? 'Sí' : 'No']),
    ]);
  }
}

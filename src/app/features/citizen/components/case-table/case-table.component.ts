import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CASES_DEMO, CitizenCaseDemo } from '../../data/cases.demo';
import { CaseWorkspaceDemoService } from '../../../cases/workspace/services/case-workspace-demo.service';

@Component({selector: 'plus-citizen-case-table', standalone: true, imports: [RouterLink], templateUrl: './case-table.component.html'})
export class CitizenCaseTableComponent {
  readonly demos = inject(CaseWorkspaceDemoService);
  readonly query = signal('');
  readonly status = signal('');
  readonly kind = signal('');
  readonly page = signal(1);
  readonly pageSize = 5;
  readonly selected = signal<CitizenCaseDemo | null>(null);
  readonly message = signal('');
  readonly statuses = ['En proceso', 'Pendiente de revisión', 'Resuelto', 'Requiere información'];
  readonly filtered = computed(() => CASES_DEMO.filter(item => {
    const text = this.normalize(`${item.code} ${item.title} ${item.territory}`);
    return text.includes(this.normalize(this.query().trim())) && (!this.status() || item.status === this.status()) && (!this.kind() || item.kind === this.kind());
  }));
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  readonly rows = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize));
  filter(field: 'query' | 'status' | 'kind', value: string) {this[field].set(value); this.page.set(1); this.selected.set(null);}
  navigate(delta: number) {this.page.update(value => Math.min(this.pages(), Math.max(1, value + delta)));}
  statusClass(status: string) {
    return {'En proceso': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200', 'Pendiente de revisión': 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200', 'Resuelto': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200', 'Requiere información': 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200'}[status];
  }
  open(item: CitizenCaseDemo) {this.selected.set(item); this.message.set('');}
  information() {this.message.set('El envío de información adicional no está disponible en la demostración.');}
  private normalize(value: string) {return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');}
}

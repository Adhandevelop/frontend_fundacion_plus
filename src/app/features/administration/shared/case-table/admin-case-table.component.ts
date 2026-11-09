import { Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ADMIN_CASES_DEMO, DASHBOARD_CASES_DEMO, AdminCaseDemo } from '../../data/admin-cases.demo';
import { CaseWorkspaceDemoService } from '../../../cases/workspace/services/case-workspace-demo.service';

@Component({selector: 'plus-admin-case-table', standalone: true, imports: [ReactiveFormsModule, RouterLink], templateUrl: './admin-case-table.component.html'})
export class AdminCaseTableComponent {
  readonly demos = inject(CaseWorkspaceDemoService);
  readonly compact = input(false);
  readonly query = signal('');
  readonly territory = signal('');
  readonly basin = signal('');
  readonly category = signal('');
  readonly state = signal('');
  readonly assignee = signal('');
  readonly page = signal(1);
  readonly selected = signal<AdminCaseDemo | null>(null);
  readonly message = signal('');
  readonly records = computed(() => this.compact() ? DASHBOARD_CASES_DEMO : ADMIN_CASES_DEMO);
  readonly columns = computed(() => this.compact() ? ['Código', 'Título del expediente', 'Jurisdicción', 'Estado', 'Término de ejemplo', 'Acciones'] : ['Código', 'Título y territorio', 'Categoría', 'Radicado', 'Estado', 'Responsable', 'Acción']);
  readonly territories = computed(() => [...new Set(this.records().map(row => row.territory))]);
  readonly basins = computed(() => [...new Set(this.records().map(row => row.territory.match(/\((Cuenca[^)]+)\)/i)?.[1]).filter((value): value is string => Boolean(value)))]);
  readonly categories = computed(() => [...new Set(this.records().map(row => row.category))]);
  readonly states = computed(() => [...new Set(this.records().map(row => row.status))]);
  readonly assignees = [...new Set(ADMIN_CASES_DEMO.map(row => row.assignee))];
  readonly filtered = computed(() => this.records().filter(row =>
    this.normalize(`${row.code} ${row.title} ${row.territory}`).includes(this.normalize(this.query().trim())) &&
    (!this.territory() || row.territory === this.territory()) && (!this.basin() || row.territory.includes(this.basin())) && (!this.category() || row.category === this.category()) &&
    (!this.state() || row.status === this.state()) && (!this.assignee() || row.assignee === this.assignee())));
  readonly pageSize = computed(() => this.compact() ? 4 : 5);
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  readonly visible = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize(), this.page() * this.pageSize()));
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly review = this.builder.group({assignee: ['', Validators.required], note: ['', Validators.maxLength(2000)]});
  change(key: 'query' | 'territory' | 'basin' | 'category' | 'state' | 'assignee', value: string) {this[key].set(value); this.page.set(1); this.selected.set(null);}
  reset() {this.query.set(''); this.territory.set(''); this.basin.set(''); this.category.set(''); this.state.set(''); this.assignee.set(''); this.page.set(1); this.selected.set(null); this.message.set('');}
  navigate(delta: number) {this.page.update(value => Math.min(this.pages(), Math.max(1, value + delta)));}
  open(row: AdminCaseDemo) {this.selected.set(row); this.review.reset({assignee: this.assignees.includes(row.assignee) ? row.assignee : '', note: ''}); this.message.set('');}
  validateReview() {this.review.markAllAsTouched(); this.message.set(this.review.invalid ? 'Revisa el responsable y la longitud de la nota.' : 'Revisión de ejemplo validada. No se ha asignado ni modificado el caso.');}
  statusClass(status: string) {
    if (/resuelto/i.test(status)) return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200';
    if (/requiere/i.test(status)) return 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200';
    if (/pendiente|revisión/i.test(status)) return 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200';
    return 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200';
  }
  private normalize(value: string) {return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');}
}

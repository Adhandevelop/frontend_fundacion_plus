import { Component, ElementRef, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuditDemoService } from '../../../core/demo/audit-demo.service';
import { AUDIT_ACTION_LABELS, AUDIT_ACTOR_LABELS, AuditDemoEvent, AuditDemoFilters, EMPTY_AUDIT_FILTERS, filterAuditEvents } from '../../../core/demo/audit-demo.model';
import { ADMIN_CASES_DEMO } from '../data/admin-cases.demo';

@Component({selector: 'plus-admin-audit', standalone: true, imports: [DatePipe, RouterLink], templateUrl: './admin-audit.component.html'})
export class AdminAuditComponent {
  readonly audit = inject(AuditDemoService);
  private readonly injector = inject(Injector);
  private readonly detail = viewChild<ElementRef<HTMLElement>>('auditDetail');
  private readonly route = inject(ActivatedRoute);
  private detailTrigger: HTMLElement | null = null;
  readonly actionLabels = AUDIT_ACTION_LABELS;
  readonly actorLabels = AUDIT_ACTOR_LABELS;
  readonly actions = Object.entries(AUDIT_ACTION_LABELS).map(([id, label]) => ({id, label}));
  readonly actors = Object.entries(AUDIT_ACTOR_LABELS).map(([id, label]) => ({id, label}));
  readonly filters = signal<AuditDemoFilters>({...EMPTY_AUDIT_FILTERS});
  readonly page = signal(1);
  readonly selectedId = signal<string | null>(null);
  readonly selected = computed(() => this.audit.events().find(event => event.id === this.selectedId()) ?? null);
  readonly invalidRange = computed(() => Boolean(this.filters().from && this.filters().to && this.filters().from > this.filters().to));
  readonly filtered = computed(() => filterAuditEvents(this.audit.events(), this.filters()));
  readonly pageSize = 10;
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  readonly visible = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize));
  readonly metrics = computed(() => {
    const events = this.filtered();
    return [{label: 'Eventos de la selección', value: events.length}, {label: 'Acciones en esta pestaña', value: events.filter(event => event.origin === 'local').length},
      {label: 'Casos de ejemplo relacionados', value: new Set(events.map(event => event.code)).size}];
  });
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => this.change('query', params.get('caso') ?? ''));
  }
  change(key: keyof AuditDemoFilters, value: string) {this.filters.update(current => ({...current, [key]: value})); this.page.set(1); this.selectedId.set(null);}
  resetFilters() {this.filters.set({...EMPTY_AUDIT_FILTERS}); this.page.set(1); this.selectedId.set(null);}
  navigate(delta: number) {this.page.update(page => Math.max(1, Math.min(this.pages(), page + delta))); this.selectedId.set(null);}
  open(event: AuditDemoEvent, trigger: Event) {
    this.detailTrigger = trigger.currentTarget as HTMLElement | null;
    this.selectedId.set(event.id);
    afterNextRender(() => this.detail()?.nativeElement.focus(), {injector: this.injector});
  }
  closeDetail() {this.selectedId.set(null); this.detailTrigger?.focus();}
  caseRoute(code: string) {return [ADMIN_CASES_DEMO.some(row => row.code === code) ? '/admin/casos' : '/ciudadano/casos', code];}
}

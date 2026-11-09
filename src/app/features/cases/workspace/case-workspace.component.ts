import { Component, computed, effect, inject, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CaseWorkspaceDemoService } from './services/case-workspace-demo.service';
import { DemoAudience } from './data/case-workspace.demo';
import { CaseHistoryComponent } from './components/case-history.component';
import { CaseMessagesComponent } from './components/case-messages.component';
import { CaseManagementComponent } from './components/case-management.component';
import { CaseContributionComponent } from './components/case-contribution.component';
import { CaseEvidenceWorkspaceComponent } from './components/case-evidence.component';

@Component({
  selector: 'plus-case-workspace', standalone: true,
  imports: [RouterLink, CaseHistoryComponent, CaseMessagesComponent, CaseManagementComponent, CaseContributionComponent, CaseEvidenceWorkspaceComponent],
  templateUrl: './case-workspace.component.html', styleUrl: './case-workspace.component.css', encapsulation: ViewEncapsulation.None,
})
export class CaseWorkspaceComponent {
  readonly store = inject(CaseWorkspaceDemoService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  private readonly query = toSignal(this.route.queryParamMap, {initialValue: this.route.snapshot.queryParamMap});
  readonly audience: DemoAudience = this.route.snapshot.data['audience'] === 'admin' ? 'admin' : 'citizen';
  readonly code = computed(() => this.params().get('radicado') ?? '');
  readonly identity = computed(() => this.store.identity(this.audience, this.code()));
  readonly workflow = computed(() => this.store.workflow(this.code()));
  readonly citizenAvailable = computed(() => Boolean(this.store.identity('citizen', this.code())));
  readonly list = this.audience === 'admin' ? '/admin/casos' : '/ciudadano/casos';
  readonly tab = signal('overview');
  readonly status = signal('');
  readonly resetting = signal(false);
  readonly tabs = [
    {id: 'overview', label: 'Resumen'}, {id: 'history', label: 'Seguimiento'},
    {id: 'evidence', label: 'Evidencias'}, {id: 'messages', label: 'Mensajes'},
    {id: this.audience === 'admin' ? 'management' : 'contribution', label: this.audience === 'admin' ? 'Gestión del caso' : 'Aportar información'},
  ];
  constructor() {
    effect(() => {
      this.code();
      const section = this.query().get('seccion');
      this.tab.set(section && this.tabs.some(item => item.id === section) ? section : 'overview');
      this.status.set(''); this.resetting.set(false);
    }, {allowSignalWrites: true});
  }
  select(tab: string) {this.tab.set(tab); this.status.set('');}
  contribute(value: {description: string; files: readonly File[]}) {this.store.contribute(this.code(), value.description, value.files);}
  reset() {this.store.reset(this.code(), this.audience); this.resetting.set(false); this.tab.set('overview'); this.status.set('Simulación de este caso restablecida en ambas vistas.');}
}

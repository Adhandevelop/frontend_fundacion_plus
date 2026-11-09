import { Component, computed, effect, inject, signal, untracked, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CitizenAreaDemoService } from '../services/citizen-area-demo.service';
import { CaseWorkspaceDemoService } from '../../cases/workspace/services/case-workspace-demo.service';
import { CaseMessagesComponent } from '../../cases/workspace/components/case-messages.component';
import { CASES_DEMO } from '../data/cases.demo';

@Component({
  selector: 'plus-citizen-messages', standalone: true, imports: [DatePipe, RouterLink, CaseMessagesComponent],
  templateUrl: './citizen-messages.component.html',
  styleUrl: '../../cases/workspace/case-workspace.component.css', encapsulation: ViewEncapsulation.None,
})
export class CitizenMessagesComponent {
  readonly area = inject(CitizenAreaDemoService);
  readonly cases = inject(CaseWorkspaceDemoService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.queryParamMap, {initialValue: this.route.snapshot.queryParamMap});
  readonly code = computed(() => this.params().get('caso') ?? CASES_DEMO[0].code);
  readonly query = signal('');
  readonly unreadOnly = signal(false);
  readonly selected = computed(() => this.area.conversations().find(item => item.code === this.code()) ?? null);
  readonly visible = computed(() => this.area.conversations().filter(item => {
    const text = this.normalize(`${item.code} ${item.title} ${item.territory}`);
    return text.includes(this.normalize(this.query().trim())) && (!this.unreadOnly() || item.unread > 0);
  }));
  constructor() {
    effect(() => {
      const code = this.code();
      if (CASES_DEMO.some(item => item.code === code)) {
        this.cases.workflow(code).messages;
        untracked(() => this.area.markConversationRead(code));
      }
    }, {allowSignalWrites: true});
  }
  private normalize(value: string) {return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');}
}

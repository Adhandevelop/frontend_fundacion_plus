import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { InitiativeActivitiesDemoService } from './services/initiative-activities-demo.service';
import { ACTIVITY_LABELS, ACTIVITY_STATES, filterActivities } from './data/initiative-activity.demo';

@Component({selector: 'plus-activity-list', standalone: true, imports: [DatePipe, RouterLink], templateUrl: './activity-list.component.html'})
export class ActivityListComponent {
  readonly store = inject(InitiativeActivitiesDemoService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  readonly programId = computed(() => this.params().get('programId') ?? ''); readonly editionId = computed(() => this.params().get('editionId') ?? '');
  readonly edition = computed(() => this.store.initiatives.edition(this.programId(), this.editionId()));
  readonly program = computed(() => this.store.initiatives.program(this.programId()));
  readonly labels = ACTIVITY_LABELS; readonly states = ACTIVITY_STATES;
  readonly query = signal(''); readonly state = signal(''); readonly page = signal(1);
  readonly filtered = computed(() => filterActivities(this.store.activities().filter(row => row.programId === this.programId() && row.editionId === this.editionId()), this.query(), this.state()));
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 5)));
  readonly visible = computed(() => this.filtered().slice((this.page() - 1) * 5, this.page() * 5));
  constructor() {effect(() => {this.programId(); this.editionId(); this.reset();}, {allowSignalWrites: true});}
  change(key: 'query' | 'state', value: string) {this[key].set(value); this.page.set(1);}
  reset() {this.query.set(''); this.state.set(''); this.page.set(1);}
  navigate(delta: number) {this.page.update(page => Math.max(1, Math.min(this.pages(), page + delta)));}
}

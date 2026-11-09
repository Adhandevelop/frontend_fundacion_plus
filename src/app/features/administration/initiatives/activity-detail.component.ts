import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { InitiativeActivitiesDemoService } from './services/initiative-activities-demo.service';
import { ACTIVITY_LABELS } from './data/initiative-activity.demo';

@Component({selector: 'plus-activity-detail', standalone: true, imports: [RouterLink, DatePipe], templateUrl: './activity-detail.component.html'})
export class ActivityDetailComponent {
  readonly store = inject(InitiativeActivitiesDemoService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  private readonly query = toSignal(this.route.queryParamMap, {initialValue: this.route.snapshot.queryParamMap});
  readonly programId = computed(() => this.params().get('programId') ?? ''); readonly editionId = computed(() => this.params().get('editionId') ?? '');
  readonly row = computed(() => this.store.find(this.programId(),this.editionId(),this.params().get('activityId') ?? ''));
  readonly saved = computed(() => this.query().get('resultado') === 'guardado'); readonly labels = ACTIVITY_LABELS;
}

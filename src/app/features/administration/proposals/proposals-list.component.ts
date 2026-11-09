import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InitiativeProposalsDemoService } from './services/initiative-proposals-demo.service';
import { PROPOSAL_LABELS, PROPOSAL_STATES, ProposalFilters, filterProposals } from './data/initiative-proposals.demo';

@Component({selector: 'plus-proposals-list', standalone: true, imports: [RouterLink, DatePipe], templateUrl: './proposals-list.component.html'})
export class ProposalsListComponent {
  readonly store = inject(InitiativeProposalsDemoService);
  private readonly route = inject(ActivatedRoute);
  readonly states = PROPOSAL_STATES; readonly labels = PROPOSAL_LABELS;
  readonly filters = signal<ProposalFilters>({query: '', state: '', requestedProgramId: ''});
  readonly filtered = computed(() => filterProposals(this.store.proposals(),this.filters()));
  readonly page = signal(1); readonly pages = computed(() => Math.max(1,Math.ceil(this.filtered().length / 5)));
  readonly visible = computed(() => this.filtered().slice((this.page()-1)*5,this.page()*5));
  readonly metrics = computed(() => [{label: 'Solicitudes de la selección', value: this.filtered().length}, {label: 'Pendientes o en revisión', value: this.filtered().filter(row => ['pendiente','en_revision'].includes(row.state)).length}, {label: 'Aprobadas en el ejemplo', value: this.filtered().filter(row => row.state === 'aprobada').length}]);
  constructor() {this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => this.change('requestedProgramId',params.get('programa') ?? ''));}
  change(key: keyof ProposalFilters, value: string) {this.filters.update(current => ({...current,[key]:value})); this.page.set(1);}
  reset() {this.filters.set({query:'',state:'',requestedProgramId:''}); this.page.set(1);}
  navigate(delta: number) {this.page.update(page => Math.max(1,Math.min(this.pages(),page+delta)));}
}

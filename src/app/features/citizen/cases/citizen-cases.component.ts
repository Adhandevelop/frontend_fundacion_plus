import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { CitizenCaseTableComponent } from '../components/case-table/case-table.component';
import { CitizenCasesApiService } from '../services/citizen-cases-api.service';
import { CitizenDashboard } from '../services/citizen-cases.models';
import { apiErrorMessage } from '../../../core/api/api-error';
@Component({selector:'plus-citizen-cases',standalone:true,imports:[RouterLink,CitizenCaseTableComponent],templateUrl:'./citizen-cases.component.html'})
export class CitizenCasesComponent {
  private readonly api=inject(CitizenCasesApiService);
  private readonly destroy=inject(DestroyRef);
  readonly dashboard=signal<CitizenDashboard|null>(null);
  readonly loading=signal(false);
  readonly error=signal('');
  constructor(){this.load();}
  load(){
    this.loading.set(true);this.error.set('');
    this.api.dashboard().pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>this.dashboard.set(value),error:error=>this.error.set(apiErrorMessage(error))});
  }
  metrics(){const value=this.dashboard();return [{label:'Total de casos',value:value?.total_cases,icon:'folder',hint:'Radicados de tu cuenta'},{label:'Pendientes de publicación',value:value?.pendientes_publicacion,icon:'hourglass_top',hint:'Por revisar para su publicación'},{label:'En gestión',value:value?.en_gestion,icon:'engineering',hint:'En revisión o en proceso'},{label:'Resueltos o cerrados',value:value?.resueltos_o_cerrados,icon:'verified',hint:'Gestiones concluidas'}];}
}

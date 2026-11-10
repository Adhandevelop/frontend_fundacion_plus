import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AdminCasesApiService } from './admin-cases-api.service';
import { AdminDashboard } from './admin-cases.models';
import { apiErrorMessage } from '../../../core/api/api-error';

@Component({selector:'plus-admin-case-summary',standalone:true,template:`
  @if(error()){<div class="admin-panel border rounded-xl p-4 mb-4 space-y-3" role="alert"><p>{{error()}}</p><button type="button" class="admin-button" (click)="load()">Reintentar indicadores</button></div>}
  <section class="grid sm:grid-cols-2 xl:grid-cols-5 gap-4" aria-label="Indicadores de casos de la plataforma" [attr.aria-busy]="loading()">
    @for(item of metrics();track item.label){<article class="admin-panel border rounded-xl border-l-4 border-l-yellow-400 p-4 space-y-3"><div class="flex justify-between gap-3"><h2 class="text-label-md">{{item.label}}</h2><span class="material-symbols-outlined" aria-hidden="true">{{item.icon}}</span></div><p class="text-display-lg">{{loading()?'…':item.value ?? '—'}}</p></article>}
  </section>
  @if(data();as value){<section class="admin-panel border rounded-xl p-5 mt-4 grid sm:grid-cols-2 xl:grid-cols-4 gap-4 text-body-sm" aria-label="Resumen institucional"><p>Comentarios pendientes: <strong>{{value.moderation_queues.pending_comments}}</strong></p><p>Propuestas pendientes: <strong>{{value.moderation_queues.pending_proposals}}</strong></p><p>Iniciativas publicadas: <strong>{{value.content.initiatives_published}}</strong></p><p>Noticias publicadas: <strong>{{value.content.news_published}}</strong></p></section>}
`})
export class AdminSummaryComponent {
  private readonly api=inject(AdminCasesApiService);
  private readonly destroy=inject(DestroyRef);
  readonly data=signal<AdminDashboard|null>(null);
  readonly loading=signal(true);
  readonly error=signal('');
  constructor(){this.load();}
  load(){this.loading.set(true);this.error.set('');this.api.dashboard().pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>this.data.set(value),error:error=>this.error.set(apiErrorMessage(error))});}
  metrics(){const value=this.data();return [{label:'Casos de plataforma',value:value?.cases.total,icon:'folder'},{label:'Pendientes de publicación',value:value?.moderation_queues.pending_cases,icon:'hourglass_top'},{label:'En gestión',value:value?(value.cases.by_estado_operativo['en_revision']??0)+(value.cases.by_estado_operativo['en_proceso']??0):undefined,icon:'engineering'},{label:'Resueltos o cerrados',value:value?(value.cases.by_estado_operativo['resuelto']??0)+(value.cases.by_estado_operativo['cerrado']??0):undefined,icon:'task_alt'},{label:'Correcciones abiertas',value:value?.cases.open_correction_requests,icon:'help'}];}
}

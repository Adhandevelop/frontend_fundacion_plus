import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe, DOCUMENT } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { AdminReportApiService, CaseReport, EMPTY_REPORT_CRITERIA, ReportCriteria } from './admin-report-api.service';
import { CitizenCasesApiService } from '../../citizen/services/citizen-cases-api.service';
import { CaseState, CaseType, caseStateLabel } from '../../citizen/services/citizen-cases.models';
import { ReportDistributionComponent } from './components/report-distribution.component';
import { apiErrorMessage } from '../../../core/api/api-error';

@Component({selector:'plus-admin-reports',standalone:true,imports:[DatePipe,RouterLink,ReactiveFormsModule,ReportDistributionComponent],templateUrl:'./admin-reports.component.html'})
export class AdminReportsComponent {
  private readonly api=inject(AdminReportApiService);
  private readonly catalogs=inject(CitizenCasesApiService);
  private readonly destroy=inject(DestroyRef);
  private readonly document=inject(DOCUMENT);
  private request?:Subscription;
  private revision=0;
  readonly form=inject(FormBuilder).nonNullable.group({...EMPTY_REPORT_CRITERIA});
  readonly applied=signal<ReportCriteria>({...EMPTY_REPORT_CRITERIA});
  readonly data=signal<CaseReport|null>(null);readonly loading=signal(true);readonly error=signal('');readonly catalogError=signal('');readonly downloading=signal(false);readonly status=signal('');
  readonly states=signal<CaseState[]>([]);readonly types=signal<CaseType[]>([]);
  readonly page=signal(1);readonly pageSize=10;readonly pages=computed(()=>Math.max(1,Math.ceil((this.data()?.count ?? 0)/this.pageSize)));
  readonly label=caseStateLabel;
  readonly managementDistribution=computed(()=>this.distribution(this.data()?.totals.by_estado ?? {},true));
  readonly categoryDistribution=computed(()=>this.distribution(this.data()?.totals.by_categoria ?? {}));
  constructor(){this.load();this.loadCatalogs();}
  loadCatalogs(){
    this.catalogError.set('');
    this.catalogs.states().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>this.states.set(value),error:error=>this.catalogError.set(apiErrorMessage(error))});
    this.catalogs.types().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>this.types.set(value),error:error=>this.catalogError.set(apiErrorMessage(error))});
  }
  load(){
    const revision=++this.revision;this.request?.unsubscribe();this.loading.set(true);this.error.set('');
    this.request=this.api.get(this.applied(),this.page(),this.pageSize).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.loading.set(false);})).subscribe({next:value=>{if(revision===this.revision)this.data.set(value);},error:error=>{if(revision===this.revision)this.error.set(apiErrorMessage(error));}});
  }
  apply(){if(this.downloading())return;const value=this.form.getRawValue();this.applied.set({...value,search:value.search.trim()});this.page.set(1);this.form.markAsPristine();this.status.set('');this.load();}
  reset(){this.form.reset(EMPTY_REPORT_CRITERIA);this.apply();}
  navigate(delta:number){if(this.loading() || this.downloading())return;this.page.update(value=>Math.max(1,Math.min(this.pages(),value+delta)));this.load();}
  metrics(){const totals=this.data()?.totals;return [{label:'Casos de la selección',value:totals?.total_cases ?? 0},{label:'En gestión',value:(totals?.by_estado['en_revision']??0)+(totals?.by_estado['en_proceso']??0)},{label:'Resueltos o cerrados',value:(totals?.by_estado['resuelto']??0)+(totals?.by_estado['cerrado']??0)},{label:'Pendientes de publicación',value:totals?.by_estado_publicacion['pendiente'] ?? 0}];}
  private distribution(values:Record<string,number>,state=false){const total=this.data()?.totals.total_cases ?? 0;return Object.entries(values).map(([label,count])=>({label:state?this.label(label):label,count,percent:total?count/total*100:0})).sort((a,b)=>b.count-a.count || a.label.localeCompare(b.label,'es'));}
  download(){
    if(this.loading() || this.downloading() || this.error() || !this.data()?.totals.total_cases)return;
    const criteria={...this.applied()};this.downloading.set(true);this.status.set('');
    this.api.csv(criteria).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.downloading.set(false))).subscribe({next:blob=>{
      if(blob.type.includes('json')){this.status.set('El servidor no devolvió un archivo CSV.');return;}
      const url=URL.createObjectURL(blob),anchor=this.document.createElement('a');anchor.href=url;anchor.download='plus-informe-casos.csv';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);this.status.set('Descarga solicitada para toda la selección aplicada.');
    },error:error=>this.status.set(apiErrorMessage(error))});
  }
}

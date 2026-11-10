import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, startWith, Subject, switchMap } from 'rxjs';
import { CitizenCasesApiService } from '../../services/citizen-cases-api.service';
import { CasePage, CaseState, caseStateLabel } from '../../services/citizen-cases.models';
import { apiErrorMessage } from '../../../../core/api/api-error';

@Component({selector:'plus-citizen-case-table',standalone:true,imports:[RouterLink,DatePipe],templateUrl:'./case-table.component.html'})
export class CitizenCaseTableComponent {
  private readonly api=inject(CitizenCasesApiService);
  private readonly destroy=inject(DestroyRef);
  private readonly refresh=new Subject<void>();
  private readonly searches=new Subject<string>();
  readonly query=signal('');
  readonly status=signal('');
  readonly publication=signal('');
  readonly page=signal(1);
  readonly pageSize=5;
  readonly loading=signal(true);
  readonly error=signal('');
  readonly stateError=signal('');
  readonly states=signal<CaseState[]>([]);
  readonly result=signal<CasePage>({count:0,next:null,previous:null,results:[]});
  readonly pages=computed(()=>Math.max(1,Math.ceil(this.result().count/this.pageSize)));
  readonly label=caseStateLabel;
  constructor(){
    this.searches.pipe(debounceTime(250),distinctUntilChanged(),takeUntilDestroyed(this.destroy)).subscribe(()=>{this.page.set(1);this.reload();});
    this.refresh.pipe(startWith(undefined),switchMap(()=>{
      this.loading.set(true);this.error.set('');
      return this.api.list({page:this.page(),page_size:this.pageSize,search:this.query().trim(),estado:this.status(),estado_publicacion:this.publication()}).pipe(catchError(error=>{this.error.set(apiErrorMessage(error));return of(null);}),finalize(()=>this.loading.set(false)));
    }),takeUntilDestroyed(this.destroy)).subscribe(value=>{if(value)this.result.set(value);});
    this.loadStates();
  }
  loadStates(){this.stateError.set('');this.api.states().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:states=>this.states.set(states),error:error=>this.stateError.set(apiErrorMessage(error))});}
  filter(field:'query'|'status'|'publication',value:string){this[field].set(value);if(field==='query')this.searches.next(value);else{this.page.set(1);this.reload();}}
  reload(){this.refresh.next();}
  navigate(delta:number){this.page.update(value=>Math.max(1,Math.min(this.pages(),value+delta)));this.reload();}
  statusClass(value:string){return ({pendiente:'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',en_revision:'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',en_proceso:'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',resuelto:'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',cerrado:'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'} as Record<string,string>)[value] ?? '';}
}

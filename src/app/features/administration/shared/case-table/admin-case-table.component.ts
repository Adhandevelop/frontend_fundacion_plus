import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, Subject, switchMap } from 'rxjs';
import { AdminCasesApiService } from '../../cases/admin-cases-api.service';
import { AdminCasePage } from '../../cases/admin-cases.models';
import { CitizenCasesApiService } from '../../../citizen/services/citizen-cases-api.service';
import { CaseState, CaseType, caseStateLabel } from '../../../citizen/services/citizen-cases.models';
import { AccountApiService, Department, Municipality } from '../../../../core/api/account-api.service';
import { apiErrorMessage } from '../../../../core/api/api-error';

@Component({selector:'plus-admin-case-table',standalone:true,imports:[DatePipe,RouterLink],templateUrl:'./admin-case-table.component.html'})
export class AdminCaseTableComponent implements OnInit {
  private readonly api=inject(AdminCasesApiService);
  private readonly catalogs=inject(CitizenCasesApiService);
  private readonly territories=inject(AccountApiService);
  private readonly destroy=inject(DestroyRef);
  private readonly refresh=new Subject<void>();
  private readonly searches=new Subject<string>();
  private territoryRevision=0;
  readonly compact=input(false);
  readonly query=signal('');readonly state=signal('');readonly priority=signal('');readonly publication=signal('');readonly category=signal('');readonly department=signal('');readonly municipality=signal('');
  readonly states=signal<CaseState[]>([]);readonly types=signal<CaseType[]>([]);readonly departments=signal<Department[]>([]);readonly municipalities=signal<Municipality[]>([]);
  readonly page=signal(1);readonly pageSize=computed(()=>this.compact()?5:10);
  readonly result=signal<AdminCasePage>({count:0,next:null,previous:null,results:[]});
  readonly pages=computed(()=>Math.max(1,Math.ceil(this.result().count/this.pageSize())));
  readonly loading=signal(true);readonly error=signal('');readonly catalogError=signal('');
  readonly label=caseStateLabel;
  constructor(){
    this.searches.pipe(debounceTime(250),distinctUntilChanged(),takeUntilDestroyed(this.destroy)).subscribe(()=>{this.page.set(1);this.reload();});
    this.refresh.pipe(switchMap(()=>{
      this.loading.set(true);this.error.set('');
      return this.api.list({page:this.page(),page_size:this.pageSize(),search:this.query().trim(),estado:this.state(),prioridad:this.priority(),estado_publicacion:this.publication(),id_tipo_caso:this.category(),id_departamento:this.department(),id_municipio:this.municipality()}).pipe(catchError(error=>{this.error.set(apiErrorMessage(error));return of(null);}),finalize(()=>this.loading.set(false)));
    }),takeUntilDestroyed(this.destroy)).subscribe(value=>{if(value)this.result.set(value);});
  }
  ngOnInit(){this.reload();this.loadCatalogs();}
  loadCatalogs(){
    this.catalogError.set('');
    this.catalogs.states().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>this.states.set(value),error:error=>this.catalogError.set(apiErrorMessage(error))});
    this.catalogs.types().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>this.types.set(value),error:error=>this.catalogError.set(apiErrorMessage(error))});
    this.territories.departments().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>this.departments.set(value),error:error=>this.catalogError.set(apiErrorMessage(error))});
  }
  change(key:'query'|'state'|'priority'|'publication'|'category'|'department'|'municipality',value:string){
    this[key].set(value);this.page.set(1);
    if(key==='query'){this.searches.next(value);return;}
    if(key==='department'){
      const revision=++this.territoryRevision;this.municipality.set('');this.municipalities.set([]);
      if(value)this.territories.municipalities(value).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:items=>{if(revision===this.territoryRevision)this.municipalities.set(items);},error:error=>{if(revision===this.territoryRevision)this.catalogError.set(apiErrorMessage(error));}});
    }
    this.reload();
  }
  reset(){++this.territoryRevision;this.query.set('');this.state.set('');this.priority.set('');this.publication.set('');this.category.set('');this.department.set('');this.municipality.set('');this.municipalities.set([]);this.page.set(1);this.reload();}
  reload(){this.refresh.next();}
  navigate(delta:number){if(this.loading())return;this.page.update(value=>Math.max(1,Math.min(this.pages(),value+delta)));this.reload();}
}

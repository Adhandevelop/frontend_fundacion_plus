import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { AdminAuditApiService, AuditEvent, AuditSelection } from './admin-audit-api.service';
import { auditCaseId, auditDateMatches, auditMetadata } from './audit-presentation';
import { apiErrorMessage } from '../../../core/api/api-error';

@Component({selector:'plus-admin-audit',standalone:true,imports:[DatePipe,RouterLink],templateUrl:'./admin-audit.component.html'})
export class AdminAuditComponent {
  private readonly api=inject(AdminAuditApiService);
  private readonly destroy=inject(DestroyRef);
  private request?:Subscription;private detailRequest?:Subscription;
  private revision=0;private detailRevision=0;
  readonly data=signal<AuditSelection|null>(null);readonly loading=signal(true);readonly error=signal('');
  readonly source=signal('');readonly query=signal('');readonly action=signal('');readonly result=signal('');readonly from=signal('');readonly to=signal('');readonly caseScope=signal('');
  readonly page=signal(1);readonly pageSize=10;
  readonly selected=signal<AuditEvent|null>(null);readonly detailLoading=signal(false);readonly detailError=signal('');readonly fields=signal<{label:string;value:string}[]>([]);
  readonly invalidRange=computed(()=>!!(this.from() && this.to() && this.from()>this.to()));
  readonly filtered=computed(()=>this.invalidRange()?[]:(this.data()?.results ?? []).filter(event=>{
    const text=this.normalize(`${event.event_ref} ${event.action} ${event.module} ${event.entity_id ?? ''} ${event.actor_nombre ?? ''} ${event.description ?? ''}`);
    return text.includes(this.normalize(this.query().trim())) && (!this.action() || event.action===this.action()) && (!this.result() || event.result===this.result()) && (!this.caseScope() || auditCaseId(event)===this.caseScope() || text.includes(this.normalize(this.caseScope()))) && auditDateMatches(event,this.from(),this.to());
  }));
  readonly actions=computed(()=>[...new Set(this.data()?.results.map(item=>item.action) ?? [])].sort());
  readonly results=computed(()=>[...new Set(this.data()?.results.map(item=>item.result) ?? [])].sort());
  readonly pages=computed(()=>Math.max(1,Math.ceil(this.filtered().length/this.pageSize)));
  readonly visible=computed(()=>this.filtered().slice((this.page()-1)*this.pageSize,this.page()*this.pageSize));
  readonly caseId=auditCaseId;
  readonly sources=[{value:'',label:'Todas las fuentes'},{value:'eventos',label:'Eventos'},{value:'accesos',label:'Accesos'},{value:'casos',label:'Casos'},{value:'permisos',label:'Permisos'},{value:'seguridad',label:'Seguridad'}];
  constructor(){
    inject(ActivatedRoute).queryParamMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params=>{this.caseScope.set(params.get('caso') ?? '');this.page.set(1);this.closeDetail();});
    this.load();
  }
  load(){
    const revision=++this.revision;this.request?.unsubscribe();this.closeDetail();this.loading.set(true);this.error.set('');this.page.set(1);
    this.request=this.api.list(this.source()).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.loading.set(false);})).subscribe({next:value=>{if(revision===this.revision)this.data.set(value);},error:error=>{if(revision===this.revision)this.error.set(apiErrorMessage(error));}});
  }
  change(key:'query'|'action'|'result'|'from'|'to',value:string){this[key].set(value);this.page.set(1);this.closeDetail();}
  changeSource(value:string){this.source.set(value);this.action.set('');this.result.set('');this.load();}
  reset(){this.query.set('');this.action.set('');this.result.set('');this.from.set('');this.to.set('');this.caseScope.set('');this.page.set(1);this.closeDetail();}
  navigate(delta:number){this.page.update(value=>Math.max(1,Math.min(this.pages(),value+delta)));this.closeDetail();}
  open(event:AuditEvent){
    const revision=++this.detailRevision;this.detailRequest?.unsubscribe();this.selected.set(event);this.fields.set([]);this.detailLoading.set(true);this.detailError.set('');
    this.detailRequest=this.api.detail(event.event_ref).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.detailRevision)this.detailLoading.set(false);})).subscribe({next:value=>{if(revision===this.detailRevision)this.fields.set(auditMetadata(value));},error:error=>{if(revision===this.detailRevision)this.detailError.set(apiErrorMessage(error));}});
    if(typeof document!=='undefined')setTimeout(()=>document.getElementById('audit-detail')?.focus(),0);
  }
  closeDetail(){++this.detailRevision;this.detailRequest?.unsubscribe();this.selected.set(null);this.fields.set([]);this.detailError.set('');this.detailLoading.set(false);}
  private normalize(value:string){return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
}

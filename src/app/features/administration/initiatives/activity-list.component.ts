import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { ACTIVITY_LABELS, AdminInitiative, AdminInitiativeActivity, AdminInitiativesApiService, InitiativeActivityState } from './services/admin-initiatives-api.service';

@Component({selector:'plus-activity-list',standalone:true,imports:[DatePipe,RouterLink],templateUrl:'./activity-list.component.html'})
export class ActivityListComponent {
 private readonly api=inject(AdminInitiativesApiService);private readonly destroy=inject(DestroyRef);private readonly route=inject(ActivatedRoute);readonly programId=this.route.snapshot.paramMap.get('programId')??'';readonly editionId=this.route.snapshot.paramMap.get('editionId')??'';readonly labels=ACTIVITY_LABELS;readonly states=Object.keys(ACTIVITY_LABELS) as InitiativeActivityState[];
 readonly program=signal<AdminInitiative|null>(null);readonly rows=signal<AdminInitiativeActivity[]>([]);readonly loading=signal(true);readonly error=signal('');readonly query=signal('');readonly state=signal('');readonly page=signal(1);readonly pageSize=5;readonly filtered=computed(()=>{const q=this.query().trim().toLowerCase();return this.rows().filter(row=>(!this.state()||row.state===this.state())&&`${row.title} ${row.description} ${row.place}`.toLowerCase().includes(q));});readonly pages=computed(()=>Math.max(1,Math.ceil(this.filtered().length/this.pageSize)));readonly visible=computed(()=>this.filtered().slice((this.page()-1)*this.pageSize,this.page()*this.pageSize));readonly edition=computed(()=>this.program()?.editions.find(row=>row.id===this.editionId)??null);
 constructor(){forkJoin({program:this.api.detail(this.programId),activities:this.api.activities(this.editionId)}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>{this.program.set(value.program);this.rows.set(value.activities);},error:error=>this.error.set(apiErrorMessage(error))});}
 get annual(){return this.edition()!;}
 change(key:'query'|'state',value:string){this[key].set(value);this.page.set(1);}reset(){this.query.set('');this.state.set('');this.page.set(1);}navigate(delta:number){this.page.update(value=>Math.max(1,Math.min(this.pages(),value+delta)));}
}

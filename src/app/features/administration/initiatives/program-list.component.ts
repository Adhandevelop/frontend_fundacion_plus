import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminInitiative, AdminInitiativesApiService, INITIATIVE_PUBLICATION_LABELS, INITIATIVE_STATE_LABELS, InitiativePublication } from './services/admin-initiatives-api.service';

@Component({selector:'plus-admin-programs',standalone:true,imports:[RouterLink],templateUrl:'./program-list.component.html'})
export class ProgramListComponent {
 private readonly api=inject(AdminInitiativesApiService);private readonly destroy=inject(DestroyRef);readonly stateLabels=INITIATIVE_STATE_LABELS;readonly publicationLabels=INITIATIVE_PUBLICATION_LABELS;readonly publications=Object.keys(INITIATIVE_PUBLICATION_LABELS) as InitiativePublication[];
 readonly rows=signal<AdminInitiative[]>([]);readonly count=signal(0);readonly page=signal(1);readonly pageSize=10;readonly pages=computed(()=>Math.max(1,Math.ceil(this.count()/this.pageSize)));readonly publication=signal('');readonly query=signal('');readonly loading=signal(false);readonly error=signal('');
 readonly visible=computed(()=>{const term=this.normalize(this.query());return term?this.rows().filter(row=>this.normalize(`${row.title} ${row.slug} ${row.category} ${row.summary}`).includes(term)):this.rows();});
 constructor(){this.load();}
 load(page=1){this.loading.set(true);this.error.set('');this.api.list(this.publication(),page,this.pageSize).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>{this.rows.set(value.results);this.count.set(value.count);this.page.set(page);},error:error=>this.error.set(apiErrorMessage(error))});}
 changePublication(value:string){this.publication.set(value);this.load(1);}
 navigate(delta:number){this.load(Math.max(1,Math.min(this.pages(),this.page()+delta)));}
 private normalize(value:string){return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
}

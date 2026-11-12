import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { ACTIVITY_LABELS, AdminInitiativeActivity, AdminInitiativesApiService } from './services/admin-initiatives-api.service';

@Component({selector:'plus-activity-detail',standalone:true,imports:[RouterLink,DatePipe],templateUrl:'./activity-detail.component.html'})
export class ActivityDetailComponent {
 private readonly api=inject(AdminInitiativesApiService);private readonly destroy=inject(DestroyRef);private readonly route=inject(ActivatedRoute);readonly programId=this.route.snapshot.paramMap.get('programId')??'';readonly editionId=this.route.snapshot.paramMap.get('editionId')??'';readonly id=this.route.snapshot.paramMap.get('activityId')??'';readonly labels=ACTIVITY_LABELS;readonly row=signal<AdminInitiativeActivity|null>(null);readonly loading=signal(true);readonly error=signal('');readonly saved=this.route.snapshot.queryParamMap.get('resultado')==='guardado';
 constructor(){this.api.activity(this.id).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:row=>{if(row.editionId===this.editionId)this.row.set(row);else this.error.set('La actividad no pertenece a la edición indicada.');},error:error=>this.error.set(apiErrorMessage(error))});}
 get activity(){return this.row()!;}
}

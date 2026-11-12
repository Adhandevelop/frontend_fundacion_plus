import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminCaseTableComponent } from '../shared/case-table/admin-case-table.component';
import { AdminCasesApiService } from './admin-cases-api.service';
import { AdminFollowedCase } from './admin-cases.models';

@Component({selector:'plus-admin-personal-cases',standalone:true,imports:[RouterLink,DatePipe,AdminCaseTableComponent],templateUrl:'./admin-personal-cases.component.html'})
export class AdminPersonalCasesComponent {
 private readonly api=inject(AdminCasesApiService);private readonly destroy=inject(DestroyRef);
 readonly tab=signal<'created'|'followed'>('created');readonly followed=signal<AdminFollowedCase[]>([]);readonly loading=signal(false);readonly error=signal('');readonly removing=signal('');
 select(value:'created'|'followed'){this.tab.set(value);if(value==='followed'&&!this.followed().length)this.loadFollowed();}
 loadFollowed(){this.loading.set(true);this.error.set('');this.api.followedCases().pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>this.followed.set(value.results.filter(row=>row.activo)),error:error=>this.error.set(apiErrorMessage(error))});}
 remove(id:string){if(this.removing())return;this.removing.set(id);this.api.unfollow(id).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.removing.set(''))).subscribe({next:()=>this.followed.update(rows=>rows.filter(row=>row.id_caso!==id)),error:error=>this.error.set(apiErrorMessage(error))});}
}

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { CitizenCasesApiService } from '../services/citizen-cases-api.service';
import { FollowedCase } from '../services/citizen-cases.models';

@Component({selector:'plus-followed-cases',standalone:true,imports:[RouterLink,DatePipe],templateUrl:'./followed-cases.component.html'})
export class FollowedCasesComponent {
  private readonly api=inject(CitizenCasesApiService);private readonly destroy=inject(DestroyRef);
  readonly rows=signal<FollowedCase[]>([]);readonly loading=signal(true);readonly removing=signal('');readonly error=signal('');readonly status=signal('');
  constructor(){this.load();}
  load(){this.loading.set(true);this.error.set('');this.api.followedCases().pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:rows=>this.rows.set(rows.filter(row=>row.activo)),error:error=>this.error.set(apiErrorMessage(error))});}
  remove(row:FollowedCase){if(this.removing())return;this.removing.set(row.id_caso);this.status.set('');this.api.unfollow(row.id_caso).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.removing.set(''))).subscribe({next:()=>{this.rows.update(rows=>rows.filter(item=>item.id_caso!==row.id_caso));this.status.set(`Dejaste de seguir el caso ${row.codigo}.`);},error:error=>this.status.set(apiErrorMessage(error))});}
}

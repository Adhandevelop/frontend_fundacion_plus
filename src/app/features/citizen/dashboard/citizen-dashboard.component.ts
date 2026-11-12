import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { CitizenCase, CitizenDashboard, caseStateLabel } from '../services/citizen-cases.models';
import { CitizenCasesApiService } from '../services/citizen-cases-api.service';

@Component({selector:'plus-citizen-dashboard',standalone:true,imports:[RouterLink],templateUrl:'./citizen-dashboard.component.html'})
export class CitizenDashboardComponent {
 private readonly api=inject(CitizenCasesApiService);private readonly destroy=inject(DestroyRef);readonly auth=inject(AuthService);readonly loading=signal(true);readonly error=signal('');readonly dashboard=signal<CitizenDashboard|null>(null);readonly recent=signal<CitizenCase[]>([]);readonly stateLabel=caseStateLabel;
 constructor(){forkJoin({dashboard:this.api.dashboard(),cases:this.api.list({page:1,page_size:5,search:'',estado:'',estado_publicacion:''})}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>{this.dashboard.set(value.dashboard);this.recent.set(value.cases.results);},error:error=>this.error.set(apiErrorMessage(error))});}
}

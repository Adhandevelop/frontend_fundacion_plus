import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminInitiative, AdminInitiativesApiService, INITIATIVE_PUBLICATION_LABELS, INITIATIVE_STATE_LABELS, InitiativePublication } from './services/admin-initiatives-api.service';

@Component({selector:'plus-program-detail',standalone:true,imports:[RouterLink],templateUrl:'./program-detail.component.html'})
export class ProgramDetailComponent {
 private readonly api=inject(AdminInitiativesApiService);private readonly route=inject(ActivatedRoute);private readonly destroy=inject(DestroyRef);readonly id=this.route.snapshot.paramMap.get('id')??'';readonly record=signal<AdminInitiative|null>(null);readonly loading=signal(true);readonly saving=signal(false);readonly error=signal('');readonly pending=signal<InitiativePublication|null>(null);readonly labels=INITIATIVE_STATE_LABELS;readonly publicationLabels=INITIATIVE_PUBLICATION_LABELS;
 constructor(){this.load(this.route.snapshot.queryParamMap.get('resultado')==='guardado'?'Programa guardado correctamente.':'');}
 load(message=''){this.loading.set(true);this.error.set(message);this.api.detail(this.id).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>this.record.set(value),error:error=>this.error.set(apiErrorMessage(error))});}
 confirm(){const target=this.pending();if(!target||this.saving())return;this.saving.set(true);this.error.set('');this.api.transition(this.id,target).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.saving.set(false))).subscribe({next:value=>{this.record.set(value);this.pending.set(null);this.error.set(`Estado actualizado a ${this.publicationLabels[target]}.`);},error:error=>this.error.set(apiErrorMessage(error))});}
 feature(){const row=this.record();if(!row||row.publication!=='publicada'||this.saving())return;this.saving.set(true);this.api.transition(this.id,row.publication,!row.featured).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.saving.set(false))).subscribe({next:value=>{this.record.set(value);this.error.set(value.featured?'Programa destacado.':'Programa retirado de destacados.');},error:error=>this.error.set(apiErrorMessage(error))});}
}

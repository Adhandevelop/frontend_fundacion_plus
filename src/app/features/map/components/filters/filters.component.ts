import {Component, DestroyRef, EventEmitter, inject, Output, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {forkJoin} from 'rxjs';
import {AccountApiService, Community, Department, Municipality} from '../../../../core/api/account-api.service';
import {apiErrorMessage} from '../../../../core/api/api-error';
import {CaseState, CaseType} from '../../../citizen/services/citizen-cases.models';
import {CitizenCasesApiService} from '../../../citizen/services/citizen-cases-api.service';
import {PublicCaseMapFilters} from '../../map-cases.models';

@Component({selector:'plus-map-filters',standalone:true,imports:[ReactiveFormsModule],templateUrl:'./filters.component.html'})
export class MapFiltersComponent {
 private readonly builder=inject(FormBuilder).nonNullable;private readonly account=inject(AccountApiService);private readonly cases=inject(CitizenCasesApiService);private readonly destroy=inject(DestroyRef);
 private municipalityRevision=0;private communityRevision=0;
 @Output() filtersApplied=new EventEmitter<PublicCaseMapFilters>();
 readonly departments=signal<Department[]>([]);readonly municipalities=signal<Municipality[]>([]);readonly communities=signal<Community[]>([]);readonly types=signal<CaseType[]>([]);readonly states=signal<CaseState[]>([]);
 readonly loading=signal(true);readonly catalogError=signal('');readonly message=signal('');
 readonly form=this.builder.group({department:'',municipality:'',community:'',type:'',nature:'',state:'',priority:'',from:'',to:''});
 constructor(){this.loadCatalogs();}
 loadCatalogs(){this.loading.set(true);this.catalogError.set('');forkJoin({departments:this.account.departments(),types:this.cases.types(),states:this.cases.states()}).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{this.departments.set(value.departments);this.types.set(value.types.filter(item=>item.activo));this.states.set(value.states);this.loading.set(false);},error:error=>{this.catalogError.set(apiErrorMessage(error));this.loading.set(false);}});}
 departmentChanged(){const revision=++this.municipalityRevision;++this.communityRevision;this.form.patchValue({municipality:'',community:''});this.municipalities.set([]);this.communities.set([]);const id=this.form.controls.department.value;if(!id)return;this.account.municipalities(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{if(revision===this.municipalityRevision)this.municipalities.set(value);},error:error=>{if(revision===this.municipalityRevision)this.catalogError.set(apiErrorMessage(error));}});}
 municipalityChanged(){const revision=++this.communityRevision;this.form.patchValue({community:''});this.communities.set([]);const id=this.form.controls.municipality.value;if(!id)return;this.account.communities(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{if(revision===this.communityRevision)this.communities.set(value);},error:error=>{if(revision===this.communityRevision)this.catalogError.set(apiErrorMessage(error));}});}
 apply(){const value=this.form.getRawValue();if(value.from&&value.to&&value.from>value.to){this.message.set('La fecha inicial debe ser anterior o igual a la fecha final.');return;}const selectedType=this.types().find(item=>item.id_tipo_caso===value.type);this.filtersApplied.emit({id_departamento:value.department,id_municipio:value.municipality,id_comunidad:value.community,id_tipo_caso:value.type,naturaleza:value.nature||selectedType?.naturaleza||'',id_estado:value.state,prioridad:value.priority,fecha_desde:value.from,fecha_hasta:value.to});this.message.set('Filtros aplicados a los casos públicos.');}
 reset(){this.form.reset();this.municipalities.set([]);this.communities.set([]);this.message.set('Filtros restablecidos.');this.filtersApplied.emit({});}
}

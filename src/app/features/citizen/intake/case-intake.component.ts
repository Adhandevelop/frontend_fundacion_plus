import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { IntakeSummaryComponent } from './summary/intake-summary.component';
import { IntakeFieldsComponent } from './fields/intake-fields.component';
import { IntakeSupportComponent } from './support/intake-support.component';
import { IntakeStepperComponent } from './stepper/intake-stepper.component';
import { EMPTY_INTAKE, IntakeForm, IntakeViewValue } from './intake-view.model';
import { CaseDraftService } from '../services/case-draft.service';
import { CaseSubmissionService } from '../services/case-submission.service';
import { CitizenCasesApiService } from '../services/citizen-cases-api.service';
import { CaseType } from '../services/citizen-cases.models';
import { AccountApiService, Department, Municipality, Community } from '../../../core/api/account-api.service';
import { apiErrorMessage } from '../../../core/api/api-error';

@Component({selector: 'plus-case-intake', standalone: true, imports: [RouterLink,IntakeSummaryComponent, IntakeFieldsComponent, IntakeSupportComponent, IntakeStepperComponent], templateUrl: './case-intake.component.html'})
export class CaseIntakeComponent {
  private readonly builder=inject(FormBuilder).nonNullable;
  private readonly drafts=inject(CaseDraftService);
  private readonly submission=inject(CaseSubmissionService);
  private readonly api=inject(CitizenCasesApiService);
  private readonly territories=inject(AccountApiService);
  private readonly destroy=inject(DestroyRef);
  private readonly router=inject(Router);
  private municipalityRevision=0;
  private communityRevision=0;
  readonly step=signal(1);
  readonly truth=signal(false);
  readonly consent=signal(false);
  readonly pending=signal(false);
  readonly completed=signal(false);
  readonly uncertain=signal(false);
  readonly loading=signal(true);
  readonly catalogError=signal('');
  readonly types=signal<CaseType[]>([]);
  readonly departments=signal<Department[]>([]);
  readonly municipalities=signal<Municipality[]>([]);
  readonly communities=signal<Community[]>([]);
  readonly files=signal<readonly File[]>(this.drafts.draft()?.files ?? []);
  readonly message=signal('');
  readonly draftMessage=signal(this.drafts.draft()?'Borrador temporal restaurado':'Sin guardar');
  private readonly initial=this.drafts.draft()?.value ?? EMPTY_INTAKE;
  readonly form: IntakeForm=this.builder.group({
    kind:[this.initial.kind,Validators.required],priority:[this.initial.priority,Validators.required],
    title:[this.initial.title,[Validators.required,Validators.maxLength(200),Validators.pattern(/\S/)]],
    category:[this.initial.category,Validators.required],
    description:[this.initial.description,[Validators.required,Validators.maxLength(5000),Validators.pattern(/\S/)]],
    families:[this.initial.families,[Validators.required,Validators.min(0),Validators.pattern(/^\d+$/)]],
    months:[this.initial.months,[Validators.required,Validators.min(0),Validators.pattern(/^\d+$/)]],
    department:[this.initial.department,Validators.required],municipality:[this.initial.municipality,Validators.required],community:[this.initial.community,Validators.required],
    latitude:[this.initial.latitude,[Validators.min(-90),Validators.max(90)]],longitude:[this.initial.longitude,[Validators.min(-180),Validators.max(180)]],
  });
  private readonly groups:(keyof IntakeViewValue)[][]=[['kind'],['title','category','description','families','months'],['department','municipality','community','latitude','longitude'],[]];
  constructor(){
    this.submission.clear();
    this.loadCatalogs();
  }
  loadCatalogs(){
    this.loading.set(true);this.catalogError.set('');
    forkJoin({types:this.api.types(),departments:this.territories.departments()}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>{
      this.types.set(value.types.filter(item=>item.activo));this.departments.set(value.departments);
      if(this.initial.department)this.loadMunicipalities(this.initial.department);
      if(this.initial.municipality)this.loadCommunities(this.initial.municipality);
    },error:error=>this.catalogError.set(apiErrorMessage(error))});
  }
  changeKind(){this.form.controls.category.setValue('');}
  changeDepartment(){this.form.patchValue({municipality:'',community:''});this.communities.set([]);++this.communityRevision;this.loadMunicipalities(this.form.controls.department.value);}
  changeMunicipality(){this.form.controls.community.setValue('');this.loadCommunities(this.form.controls.municipality.value);}
  private loadMunicipalities(id:string){
    const revision=++this.municipalityRevision;this.municipalities.set([]);if(!id)return;
    this.territories.municipalities(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:items=>{if(revision===this.municipalityRevision)this.municipalities.set(items);},error:error=>{if(revision===this.municipalityRevision)this.message.set(apiErrorMessage(error));}});
  }
  private loadCommunities(id:string){
    const revision=++this.communityRevision;this.communities.set([]);if(!id)return;
    this.territories.communities(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:items=>{if(revision===this.communityRevision)this.communities.set(items);},error:error=>{if(revision===this.communityRevision)this.message.set(apiErrorMessage(error));}});
  }
  availableTypes(){return this.types().filter(type=>type.naturaleza===this.form.controls.kind.value);}
  summaryValue():IntakeViewValue{
    const value=this.form.getRawValue();
    return {...value,kind:({'problematica':'Problemática comunitaria','proyecto_iniciativa':'Proyecto / Iniciativa','otro':'Otro'} as Record<string,string>)[value.kind] ?? value.kind,category:this.types().find(item=>item.id_tipo_caso===value.category)?.nombre ?? 'Sin seleccionar',department:this.departments().find(item=>item.id_departamento===value.department)?.nombre ?? 'Sin seleccionar',municipality:this.municipalities().find(item=>item.id_municipio===value.municipality)?.nombre ?? 'Sin seleccionar',community:this.communities().find(item=>item.id_comunidad===value.community)?.nombre ?? 'Sin seleccionar'};
  }
  goTo(step:number){if(this.pending())return;this.step.set(Math.min(5,Math.max(1,step)));this.message.set('');}
  previous(){this.goTo(this.step()-1);}
  next(){
    const controls=(this.groups[this.step()-1] ?? []).map(key=>this.form.controls[key]);controls.forEach(control=>control.markAsTouched());
    if(controls.some(control=>control.invalid)){this.message.set('Revisa los campos obligatorios y las cantidades de este paso.');return;}
    if(this.step()===3 && !this.validTerritory()){this.message.set('Selecciona un territorio del catálogo y marca una ubicación en el mapa o déjala sin seleccionar.');return;}
    this.goTo(this.step()+1);
  }
  saveDraft(){if(this.pending() || this.completed())return;this.drafts.save(this.form.getRawValue(),this.files());this.draftMessage.set('Borrador temporal guardado');this.message.set('El borrador está en memoria de esta sesión. Se pierde al recargar; todavía no se ha radicado.');}
  private validTerritory(){
    const value=this.form.getRawValue();
    const lat=value.latitude!==null,lon=value.longitude!==null;
    return lat===lon && this.departments().some(item=>item.id_departamento===value.department) && this.municipalities().some(item=>item.id_municipio===value.municipality) && this.communities().some(item=>item.id_comunidad===value.community);
  }
  submit(){
    if(this.pending() || this.uncertain() || this.completed())return;
    this.form.markAllAsTouched();
    if(this.form.invalid){const index=this.groups.findIndex(keys=>keys.some(key=>this.form.controls[key].invalid));this.step.set(index+1);this.message.set('Corrige los campos señalados antes de radicar.');return;}
    if(!this.validTerritory() || !this.availableTypes().some(item=>item.id_tipo_caso===this.form.controls.category.value)){this.step.set(3);this.message.set('Revisa el tipo de caso, el territorio y la ubicación seleccionada en el mapa.');return;}
    if(!this.truth() || !this.consent()){this.message.set('Debes confirmar la información y autorizar el tratamiento de datos para radicar.');return;}
    const value=this.form.getRawValue();
    this.pending.set(true);this.message.set('Enviando el caso y sus anexos…');
    this.submission.submit({titulo:value.title.trim(),descripcion:value.description.trim(),id_tipo_caso:value.category,id_comunidad:value.community,prioridad:value.priority,familias_afectadas:value.families,meses_afectacion:value.months,acepta_tratamiento_datos:true,...(value.latitude!==null && value.longitude!==null?{latitud:value.latitude,longitud:value.longitude}:{})},this.files()).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.pending.set(false))).subscribe({next:()=>{
      this.completed.set(true);this.drafts.clear();this.files.set([]);void this.router.navigate(['/ciudadano/casos/confirmacion']);
    },error:error=>{
      if(error instanceof HttpErrorResponse && (error.status===0 || error.status>=500)){this.uncertain.set(true);this.message.set('No se pudo confirmar el resultado. Consulta Mis casos antes de volver a radicar para evitar duplicados.');}
      else this.message.set(apiErrorMessage(error));
    }});
  }
}

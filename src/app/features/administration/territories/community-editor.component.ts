import { canAccessAdminSection } from '../../../core/auth/admin-access.policy';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, forkJoin, of, Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { Department } from '../../../core/api/account-api.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { FormErrorSummaryComponent, FormIssue, focusFormTarget } from '../../../shared/forms/form-error-summary.component';
import { AdminCommunity, AdminTerritoriesApiService, COMMUNITY_TYPES, CommunityType, CommunityWrite, TerritoryMunicipality } from './admin-territories-api.service';

interface CommunityReview {id: string | null; payload: CommunityWrite; municipality: string; department: string}

@Component({selector: 'plus-community-editor', standalone: true, imports: [ReactiveFormsModule, RouterLink, FormErrorSummaryComponent], templateUrl: './community-editor.component.html'})
export class CommunityEditorComponent {
  private readonly api = inject(AdminTerritoriesApiService);
  private readonly auth = inject(AuthService);
  private readonly destroy = inject(DestroyRef);
  private readonly router = inject(Router);
  private request?: Subscription;
  private revision = 0;
  readonly id = signal<string | null>(null);
  readonly record = signal<AdminCommunity | null>(null);
  readonly departments = signal<Department[]>([]);
  readonly allMunicipalities = signal<TerritoryMunicipality[]>([]);
  readonly departmentId = signal('');
  readonly municipalities = computed(() => this.allMunicipalities().filter(item => item.id_departamento === this.departmentId()));
  readonly canManage = computed(() => canAccessAdminSection(this.auth.user(), 'territories'));
  readonly types = COMMUNITY_TYPES;
  readonly loading = signal(true); readonly saving = signal(false); readonly uncertain = signal(false); readonly completed = signal(false);
  readonly error = signal(''); readonly status = signal(''); readonly review = signal<CommunityReview | null>(null);
  readonly submitted = signal(false);
  readonly form = inject(FormBuilder).nonNullable.group({
    municipalityId: ['', Validators.required],
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)]],
    type: ['vereda' as CommunityType, Validators.required], description: '',
  });
  constructor() {
    inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params => {
      this.id.set(params.get('id')); this.record.set(null); this.completed.set(false); this.uncertain.set(false); this.saving.set(false);
      this.status.set(''); this.load();
    });
  }
  load() {
    if (this.saving() || this.uncertain() || this.completed()) return;
    const revision = ++this.revision;
    this.request?.unsubscribe(); this.loading.set(true); this.error.set(''); this.review.set(null); this.submitted.set(false);
    const id = this.id();
    this.request = forkJoin({departments: this.api.departments(), municipalities: this.api.municipalities(), record: id ? this.api.get(id) : of(null)}).pipe(
      takeUntilDestroyed(this.destroy), finalize(() => {if (revision === this.revision) this.loading.set(false);}),
    ).subscribe({next: value => {
      if (revision !== this.revision) return;
      this.departments.set(value.departments); this.allMunicipalities.set(value.municipalities); this.record.set(value.record);
      const row = value.record;
      this.departmentId.set(value.municipalities.find(item => item.id_municipio === row?.id_municipio)?.id_departamento ?? '');
      this.form.reset({municipalityId: row?.id_municipio ?? '', name: row?.nombre ?? '', type: row?.tipo ?? 'vereda', description: row?.descripcion ?? ''});
    }, error: error => {if (revision === this.revision) this.error.set(apiErrorMessage(error));}});
  }
  changeDepartment(id: string) {
    if (this.saving() || this.review() || this.uncertain() || this.completed()) return;
    this.departmentId.set(id); this.form.controls.municipalityId.setValue(''); this.form.controls.municipalityId.markAsDirty();
  }
  save() {
    if (!this.canManage() || this.loading() || this.error() || this.saving() || this.uncertain() || this.completed() || this.review()) return;
    this.submitted.set(true); this.form.markAllAsTouched(); const value = this.form.getRawValue();
    const municipality = this.municipalities().find(item => item.id_municipio === value.municipalityId);
    const department = this.departments().find(item => item.id_departamento === this.departmentId());
    if (this.validationIssues().length || !department || !municipality || (this.id() && !this.record())) {
      this.status.set(''); focusFormTarget('community-editor-errors'); return;
    }
    this.status.set('');
    this.review.set({id: this.id(), municipality: municipality.nombre, department: department.nombre,
      payload: {id_municipio: municipality.id_municipio, nombre: value.name.trim(), tipo: value.type, descripcion: value.description.trim()}});
    if (typeof document !== 'undefined') setTimeout(() => document.getElementById('community-review')?.focus(), 0);
  }
  validationIssues():FormIssue[]{
    const value=this.form.getRawValue(),result:FormIssue[]=[];
    if(!this.departments().some(item=>item.id_departamento===this.departmentId()))result.push({field:'department',label:'Departamento',message:'Selecciona un departamento del catálogo.'});
    if(!this.municipalities().some(item=>item.id_municipio===value.municipalityId))result.push({field:'municipalityId',label:'Municipio',message:'Selecciona un municipio del departamento elegido.'});
    if(this.form.controls.name.invalid)result.push({field:'name',label:'Nombre',message:'Escribe un nombre con contenido, de hasta 150 caracteres.'});
    if(!this.types.includes(value.type))result.push({field:'type',label:'Tipo',message:'Selecciona un tipo de comunidad disponible.'});
    return result;
  }
  fieldError(field:'department'|keyof typeof this.form.controls){return (this.submitted() || (field!=='department' && this.form.controls[field].touched))?this.validationIssues().find(issue=>issue.field===field)?.message??'':'';}
  cancel() {if (!this.saving()) {this.review.set(null);focusFormTarget('community-editor-submit');}}
  confirm() {
    const decision = this.review();
    if (!decision || !this.canManage() || this.saving() || this.loading() || this.error() || this.uncertain() || this.completed() || decision.id !== this.id()) return;
    const revision = this.revision; this.saving.set(true); this.status.set('');
    const operation = decision.id ? this.api.update(decision.id, {...decision.payload}) : this.api.create({...decision.payload});
    operation.pipe(takeUntilDestroyed(this.destroy), finalize(() => {if (revision === this.revision) this.saving.set(false);})).subscribe({
      next: value => {
        if (revision !== this.revision) return;
        this.record.set(value); this.completed.set(true); this.review.set(null); this.form.markAsPristine();
        this.status.set('Comunidad guardada. Puedes consultar su ficha en el directorio.');
        void this.router.navigate(['/admin/comunidades', value.id_comunidad]).catch(() => false);
      }, error: error => {
        if (revision !== this.revision) return;
        this.review.set(null); const uncertain = error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500);
        this.uncertain.set(uncertain);
        this.status.set(uncertain ? 'No se pudo confirmar el resultado. Consulta el directorio y la ficha antes de volver a guardar; la operación pudo completarse.' : apiErrorMessage(error));
      },
    });
  }
}

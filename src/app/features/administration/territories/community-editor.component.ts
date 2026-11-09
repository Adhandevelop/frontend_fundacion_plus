import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TerritoriesDemoService } from './services/territories-demo.service';
import { COMMUNITY_TYPES, DEPARTMENTS_DEMO, MUNICIPALITIES_DEMO, CommunityType, communityTerritory } from './data/territories.demo';

@Component({selector: 'plus-community-editor', standalone: true, imports: [ReactiveFormsModule, RouterLink], templateUrl: './community-editor.component.html'})
export class CommunityEditorComponent {
  readonly store = inject(TerritoriesDemoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  readonly id = computed(() => this.params().get('id'));
  readonly record = computed(() => this.id() ? this.store.find(this.id()!) : null);
  readonly missing = computed(() => this.id() !== null && !this.record());
  readonly departments = DEPARTMENTS_DEMO;
  readonly types = COMMUNITY_TYPES;
  readonly departmentId = signal('');
  readonly municipalities = computed(() => MUNICIPALITIES_DEMO.filter(item => item.departmentId === this.departmentId()));
  readonly status = signal('');
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly form = this.builder.group({municipalityId: ['', Validators.required], name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)]], type: this.builder.control<CommunityType>('vereda', Validators.required), description: ['']});
  constructor() {
    effect(() => {
      const row = this.record();
      this.departmentId.set(row ? communityTerritory(row.municipalityId).departmentId : '');
      this.form.reset({municipalityId: row?.municipalityId ?? '', name: row?.name ?? '', type: row?.type ?? 'vereda', description: row?.description ?? ''}); this.status.set('');
    }, {allowSignalWrites: true});
  }
  changeDepartment(value: string) {this.departmentId.set(value); this.form.controls.municipalityId.setValue(''); this.form.controls.municipalityId.markAsDirty();}
  save() {
    this.form.markAllAsTouched(); const value = this.form.getRawValue();
    if (this.missing() || this.form.invalid || !this.municipalities().some(item => item.id === value.municipalityId)) {this.status.set('Revisa nombre, tipo y selección coherente de departamento y municipio.'); return;}
    const result = this.store.save(value, this.id() ?? undefined);
    if (!result.ok) {this.status.set(result.error === 'duplicate' ? 'Ya existe un ejemplo con ese municipio, tipo y nombre.' : 'No se pudo guardar el ejemplo. Revisa el registro y sus campos.'); return;}
    void this.router.navigate(['/admin/comunidades', result.id], {queryParams: {resultado: this.id() ? 'editado' : 'creado'}});
  }
}

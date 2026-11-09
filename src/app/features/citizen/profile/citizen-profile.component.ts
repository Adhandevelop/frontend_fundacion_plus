import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CitizenAreaDemoService } from '../services/citizen-area-demo.service';

@Component({selector: 'plus-citizen-profile', standalone: true, imports: [ReactiveFormsModule], templateUrl: './citizen-profile.component.html'})
export class CitizenProfileComponent implements OnDestroy {
  readonly area = inject(CitizenAreaDemoService);
  private readonly builder = inject(FormBuilder).nonNullable;
  private readonly initial = this.area.profile();
  private draftPhoto: string | null = null;
  readonly photo = signal<string | null>(this.initial.photoUrl);
  readonly status = signal('');
  readonly confirmingReset = signal(false);
  readonly form = this.builder.group({
    name: [this.initial.name, [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)]],
    email: [this.initial.email, [Validators.required, Validators.email, Validators.maxLength(254)]],
    phone: [this.initial.phone, Validators.pattern(/^(?=.*\d)[+()\d\s.-]{7,30}$/)],
    department: [this.initial.department, Validators.maxLength(100)],
    municipality: [this.initial.municipality, Validators.maxLength(100)],
    community: [this.initial.community, Validators.maxLength(150)],
    caseUpdates: [this.initial.caseUpdates], messageAlerts: [this.initial.messageAlerts], bulletin: [this.initial.bulletin],
  });
  invalid(name: 'name' | 'email' | 'phone') {return this.form.controls[name].touched && this.form.controls[name].invalid;}
  selectPhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; input.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024) {this.status.set('Selecciona una imagen JPG o PNG de hasta 2 MB para esta demostración.'); return;}
    this.releaseDraftPhoto();
    this.draftPhoto = URL.createObjectURL(file); this.photo.set(this.draftPhoto);
    this.status.set('Fotografía seleccionada localmente. No se ha subido.');
  }
  removePhoto() {this.releaseDraftPhoto(); this.photo.set(null); this.status.set('Fotografía quitada del formulario. Guarda los cambios de ejemplo para aplicar esta selección.');}
  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {this.status.set('Revisa el nombre, correo, teléfono y la longitud de los campos.'); return;}
    const value = this.form.getRawValue();
    this.area.saveProfile({...value, name: value.name.trim(), email: value.email.trim(), phone: value.phone.trim(), photoUrl: this.photo()});
    this.draftPhoto = null; this.form.markAsPristine();
    this.status.set('Perfil de ejemplo actualizado en memoria. No se modificó ninguna cuenta ni se activaron envíos.');
  }
  cancel() {
    this.releaseDraftPhoto(); const profile = this.area.profile(); this.form.reset(profile); this.photo.set(profile.photoUrl);
    this.status.set('Cambios del formulario descartados.');
  }
  reset() {
    this.releaseDraftPhoto(); this.area.resetProfile(); this.form.reset(this.area.profile()); this.photo.set(null); this.confirmingReset.set(false);
    this.status.set('Datos iniciales del perfil de demostración restaurados.');
  }
  ngOnDestroy() {this.releaseDraftPhoto();}
  private releaseDraftPhoto() {if (this.draftPhoto) {URL.revokeObjectURL(this.draftPhoto); this.draftPhoto = null;}}
}

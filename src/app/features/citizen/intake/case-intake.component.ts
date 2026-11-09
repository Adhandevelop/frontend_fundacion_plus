import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IntakeSummaryComponent } from './summary/intake-summary.component';
import { IntakeFieldsComponent } from './fields/intake-fields.component';
import { IntakeSupportComponent } from './support/intake-support.component';
import { IntakeStepperComponent } from './stepper/intake-stepper.component';
import { EMPTY_INTAKE, INTAKE_EXAMPLE, IntakeForm, IntakeViewValue } from './intake-view.model';
import { CaseDraftService } from '../services/case-draft.service';
import { CaseSubmissionDemoService } from '../services/case-submission-demo.service';

@Component({selector: 'plus-case-intake', standalone: true, imports: [IntakeSummaryComponent, IntakeFieldsComponent, IntakeSupportComponent, IntakeStepperComponent], templateUrl: './case-intake.component.html'})
export class CaseIntakeComponent {
  private readonly builder = inject(FormBuilder).nonNullable;
  private readonly drafts = inject(CaseDraftService);
  private readonly submission = inject(CaseSubmissionDemoService);
  private readonly router = inject(Router);
  readonly step = signal(this.drafts.draft() ? 5 : 1);
  readonly confirmingExample = signal(false);
  readonly truth = signal(false);
  readonly consent = signal(false);
  readonly files = signal<readonly File[]>(this.drafts.draft()?.files ?? []);
  readonly message = signal(this.drafts.draft() ? 'Borrador temporal restaurado. No se ha enviado.' : 'Completa los pasos o carga el ejemplo del diseño. No se enviará el caso.');
  readonly draftMessage = signal(this.drafts.draft() ? 'Borrador temporal restaurado' : 'Sin guardar');
  private readonly initial = this.drafts.draft()?.value ?? EMPTY_INTAKE;
  readonly form: IntakeForm = this.builder.group({
    kind: [this.initial.kind, Validators.required], priority: [this.initial.priority, Validators.required],
    title: [this.initial.title, [Validators.required, Validators.maxLength(200), Validators.pattern(/\S/)]],
    category: [this.initial.category, [Validators.required, Validators.pattern(/\S/)]],
    description: [this.initial.description, [Validators.required, Validators.maxLength(5000), Validators.pattern(/\S/)]],
    families: [this.initial.families, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    months: [this.initial.months, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    department: [this.initial.department, [Validators.required, Validators.pattern(/\S/)]],
    municipality: [this.initial.municipality, [Validators.required, Validators.pattern(/\S/)]],
    community: [this.initial.community, [Validators.required, Validators.pattern(/\S/)]],
    latitude: [this.initial.latitude, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: [this.initial.longitude, [Validators.required, Validators.min(-180), Validators.max(180)]],
  });
  private readonly groups: (keyof IntakeViewValue)[][] = [
    ['kind', 'priority'], ['title', 'category', 'description', 'families', 'months'],
    ['department', 'municipality', 'community', 'latitude', 'longitude'], [],
  ];
  goTo(step: number) {this.step.set(Math.min(5, Math.max(1, step))); this.message.set('');}
  previous() {this.goTo(this.step() - 1);}
  requestExample() {if (this.form.dirty || this.files().length || this.drafts.draft()) this.confirmingExample.set(true); else this.loadExample();}
  loadExample() {this.form.reset(INTAKE_EXAMPLE); this.files.set([]); this.truth.set(false); this.consent.set(false); this.step.set(5); this.confirmingExample.set(false); this.draftMessage.set('Ejemplo cargado · Sin guardar'); this.message.set('Ejemplo del diseño cargado. Los anexos propios anteriores se quitaron de este formulario.');}
  next() {
    const controls = (this.groups[this.step() - 1] ?? []).map(key => this.form.controls[key]);
    controls.forEach(control => control.markAsTouched());
    if (controls.some(control => control.invalid)) {this.message.set('Revisa los campos obligatorios, cantidades y coordenadas de este paso.'); return;}
    this.goTo(this.step() + 1);
  }
  saveDraft() {this.drafts.save(this.form.getRawValue(), this.files()); this.draftMessage.set('Borrador temporal guardado'); this.message.set('Guardado en memoria de esta pestaña. Se perderá al recargar o cerrar la aplicación. No se ha enviado.');}
  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {const index = this.groups.findIndex(keys => keys.some(key => this.form.controls[key].invalid)); this.step.set(index + 1); this.message.set('Corrige los campos del formulario antes de continuar.'); return;}
    if (!this.truth() || !this.consent()) {this.message.set('Marca ambas declaraciones para validar la demostración. No se registra ninguna aceptación real.'); return;}
    this.drafts.save(this.form.getRawValue(), this.files());
    this.submission.create(this.form.getRawValue(), this.files());
    void this.router.navigate(['/ciudadano/casos/confirmacion']);
  }
}

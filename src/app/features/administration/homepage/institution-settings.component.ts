import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { InstitutionSettings, InstitutionSettingsApiService } from '../../../core/api/institution-settings-api.service';
import { apiErrorMessage } from '../../../core/api/api-error';

@Component({
  selector: 'plus-institution-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './institution-settings.component.html',
})
export class InstitutionSettingsComponent {
  private readonly api = inject(InstitutionSettingsApiService);
  private readonly destroy = inject(DestroyRef);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly status = signal('');
  readonly updatedAt = signal<string | null>(null);
  model: InstitutionSettings = {corporationName: '', acronym: '', representativeName: '', representativeRole: '', mission: ''};

  constructor() {
    this.api.get().pipe(takeUntilDestroyed(this.destroy), finalize(() => this.loading.set(false))).subscribe({
      next: result => {this.model = result.values; this.updatedAt.set(result.updatedAt);},
      error: error => this.error.set(apiErrorMessage(error)),
    });
  }

  save() {
    if (this.saving()) return;
    const values = Object.values(this.model);
    if (values.some(value => !value.trim())) {this.error.set('Completa todos los campos institucionales.'); return;}
    this.saving.set(true); this.error.set(''); this.status.set('');
    this.api.save(this.model).pipe(takeUntilDestroyed(this.destroy), finalize(() => this.saving.set(false))).subscribe({
      next: values => {this.model = values; this.updatedAt.set(new Date().toISOString()); this.status.set('La información institucional quedó actualizada en la página pública.');},
      error: error => this.error.set(apiErrorMessage(error)),
    });
  }
}

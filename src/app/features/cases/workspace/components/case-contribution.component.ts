import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({selector: 'plus-case-demo-contribution', standalone: true, imports: [ReactiveFormsModule], templateUrl: './case-contribution.component.html'})
export class CaseContributionComponent {
  readonly request = input('');
  readonly disabled = input(false);
  readonly add = output<{description: string; files: readonly File[]}>();
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly form = this.builder.group({description: ['', [Validators.required, Validators.pattern(/\S/), Validators.minLength(20), Validators.maxLength(2000)]]});
  readonly files = signal<readonly File[]>([]);
  readonly status = signal('');
  select(event: Event) {
    const target = event.target as HTMLInputElement;
    const accepted: File[] = []; const rejected: string[] = [];
    for (const file of Array.from(target.files ?? [])) {
      if (/\.(jpe?g|png|pdf)$/i.test(file.name) && file.size <= 15 * 1024 * 1024) accepted.push(file);
      else rejected.push(file.name);
    }
    const unique = new Map(this.files().map(file => [file.name + file.size + file.lastModified, file]));
    for (const file of accepted) unique.set(file.name + file.size + file.lastModified, file);
    this.files.set([...unique.values()]); target.value = '';
    this.status.set(rejected.length ? `No se aceptaron: ${rejected.join(', ')}. Usa JPG, PNG o PDF de hasta 15 MB.` : 'Archivos seleccionados localmente. No se han subido.');
  }
  remove(index: number) {this.files.update(files => files.filter((_, i) => i !== index));}
  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.disabled()) {this.status.set('Escribe entre 20 y 2000 caracteres. El caso cerrado no admite aportes en esta demostración.'); return;}
    this.add.emit({description: this.form.controls.description.value.trim(), files: this.files()});
    this.form.reset(); this.files.set([]); this.status.set('Aporte añadido al historial de ejemplo. No se envió información ni archivos.');
  }
}

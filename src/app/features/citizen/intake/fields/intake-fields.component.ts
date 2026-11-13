import { Component, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IntakeForm } from '../intake-view.model';
import { CaseType } from '../../services/citizen-cases.models';
import { Community, Department, Municipality } from '../../../../core/api/account-api.service';
import { LocationPickerComponent } from '../location-picker/location-picker.component';

@Component({
  selector: 'plus-intake-fields', standalone: true, imports: [ReactiveFormsModule,LocationPickerComponent],
  templateUrl: './intake-fields.component.html',
})
export class IntakeFieldsComponent {
  readonly form = input.required<IntakeForm>();
  readonly step = input.required<number>();
  readonly files = input<readonly File[]>([]);
  readonly types = input<CaseType[]>([]);
  readonly departments = input<Department[]>([]);
  readonly municipalities = input<Municipality[]>([]);
  readonly communities = input<Community[]>([]);
  readonly kindChanged = output<void>();
  readonly departmentChanged = output<void>();
  readonly municipalityChanged = output<void>();
  readonly filesChanged = output<readonly File[]>();
  readonly fileMessage = signal('');
  selectFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    const valid: File[] = [];
    const rejected: string[] = [];
    for (const file of selected) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(extension ?? '') || file.size > 15 * 1024 * 1024) rejected.push(file.name);
      else valid.push(file);
    }
    const unique = new Map(this.files().map(file => [file.name + ':' + file.size + ':' + file.lastModified, file]));
    for (const file of valid) unique.set(file.name + ':' + file.size + ':' + file.lastModified, file);
    this.filesChanged.emit([...unique.values()]);
    this.fileMessage.set(rejected.length ? `No se aceptaron: ${rejected.join(', ')}. Usa JPG, PNG, WEBP o PDF de hasta 15 MB.` : 'Archivos seleccionados para subir al radicar.');
    input.value = '';
  }
  remove(index: number) {this.filesChanged.emit(this.files().filter((_, i) => i !== index));}
  setLocation(value:{latitude:number;longitude:number}|null){this.form().patchValue({latitude:value?.latitude??null,longitude:value?.longitude??null});}
}

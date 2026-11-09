import { Injectable, signal } from '@angular/core';
import { IntakeViewValue } from '../intake/intake-view.model';

export interface CaseSubmissionPreview {
  value: IntakeViewValue;
  files: readonly {name: string; size: number}[];
  validatedAt: string;
}

@Injectable({providedIn: 'root'})
export class CaseSubmissionDemoService {
  readonly preview = signal<CaseSubmissionPreview | null>(null);
  create(value: IntakeViewValue, files: readonly File[]) {
    this.preview.set({value: {...value}, files: files.map(file => ({name: file.name, size: file.size})), validatedAt: new Date().toISOString()});
  }
  clear() {this.preview.set(null);}
}

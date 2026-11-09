import { Injectable, signal } from '@angular/core';
import { IntakeViewValue } from '../intake/intake-view.model';

@Injectable({providedIn: 'root'})
export class CaseDraftService {
  readonly draft = signal<{value: IntakeViewValue; files: readonly File[]} | null>(null);
  save(value: IntakeViewValue, files: readonly File[]) {
    this.draft.set({value: {...value}, files: [...files]});
  }
  clear() {this.draft.set(null);}
}

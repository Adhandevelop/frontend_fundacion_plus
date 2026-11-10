import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { IntakeViewValue } from '../intake/intake-view.model';

@Injectable({providedIn: 'root'})
export class CaseDraftService {
  private readonly auth = inject(AuthService);
  private readonly state = signal<{owner:string; value: IntakeViewValue; files: readonly File[]} | null>(null);
  readonly draft = computed(() => this.state()?.owner === this.auth.user()?.id_usuario ? this.state() : null);
  save(value: IntakeViewValue, files: readonly File[]) {
    this.state.set({owner:this.auth.user()?.id_usuario ?? '',value: {...value}, files: [...files]});
  }
  clear() {this.state.set(null);}
}

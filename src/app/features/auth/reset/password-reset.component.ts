import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordToggleComponent } from '../shared/password-toggle.component';
import { AuthFieldErrorComponent } from '../shared/auth-field-error.component';
import { matchingPasswords } from '../shared/matching-passwords.validator';

@Component({selector: 'plus-password-reset', standalone: true, imports: [RouterLink, ReactiveFormsModule, PasswordToggleComponent, AuthFieldErrorComponent], templateUrl: './password-reset.component.html'})
export class PasswordResetComponent {
  private readonly builder = inject(FormBuilder).nonNullable;
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.queryParamMap, {initialValue: this.route.snapshot.queryParamMap});
  readonly scenario = computed(() => {
    const value = this.params().get('escenario') ?? 'valido';
    return ['valido', 'vencido'].includes(value) ? value : 'invalido';
  });
  readonly completed = signal(false);
  readonly status = signal('');
  readonly form = this.builder.group({password: ['', [Validators.required, Validators.minLength(8)]], confirmation: ['', Validators.required]}, {validators: matchingPasswords});
  constructor() {effect(() => {this.scenario(); this.form.reset(); this.completed.set(false); this.status.set('');}, {allowSignalWrites: true});}
  submit() {
    this.form.markAllAsTouched();
    if (this.scenario() !== 'valido' || this.form.invalid) {this.status.set('Revisa la longitud y la coincidencia de las contraseñas.'); return;}
    this.form.reset(); this.completed.set(true); this.status.set('');
  }
}

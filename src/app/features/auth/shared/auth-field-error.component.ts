import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { authControlError } from './auth-form-feedback';

@Component({
  selector: 'plus-auth-field-error',
  standalone: true,
  template: `@if (control().touched && (control().invalid || extraError())) {<p [id]="errorId() || null" class="auth-error">{{ error() }}</p>}`,
})
export class AuthFieldErrorComponent {
  readonly control = input.required<AbstractControl>();
  readonly errorId = input('');
  readonly extraError = input('');
  error() {
    return authControlError(this.control(),this.extraError());
  }
}

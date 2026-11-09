import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'plus-auth-field-error',
  standalone: true,
  template: `@if (control().touched && control().invalid) {<p class="auth-error" role="status">{{ error() }}</p>}`,
})
export class AuthFieldErrorComponent {
  readonly control = input.required<AbstractControl>();
  error() {
    const errors = this.control().errors;
    if (errors?.['required']) return 'Este campo es obligatorio.';
    if (errors?.['email']) return 'Introduce un correo electrónico válido.';
    if (errors?.['minlength']) return `Utiliza al menos ${errors['minlength'].requiredLength} caracteres.`;
    if (errors?.['maxlength']) return `Utiliza como máximo ${errors['maxlength'].requiredLength} caracteres.`;
    if (errors?.['pattern']) return 'Introduce un valor válido.';
    return 'Revisa este campo.';
  }
}

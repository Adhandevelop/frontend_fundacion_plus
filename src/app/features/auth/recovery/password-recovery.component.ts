import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFieldErrorComponent } from '../shared/auth-field-error.component';

@Component({selector: 'plus-password-recovery', standalone: true, imports: [RouterLink, ReactiveFormsModule, AuthFieldErrorComponent], templateUrl: './password-recovery.component.html'})
export class PasswordRecoveryComponent {
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly form = this.builder.group({email: ['', [Validators.required, Validators.email]]});
  readonly submitted = signal(false);
  submit() {this.form.markAllAsTouched(); if (this.form.invalid) return; this.form.reset(); this.submitted.set(true);}
}

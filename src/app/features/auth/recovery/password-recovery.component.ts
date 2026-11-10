import { AuthIconComponent } from '../shared/auth-icon.component';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFieldErrorComponent } from '../shared/auth-field-error.component';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { finalize } from 'rxjs';
import { authFieldError, authFormIssues } from '../shared/auth-form-feedback';
import { FormErrorSummaryComponent, focusFormTarget } from '../../../shared/forms/form-error-summary.component';

@Component({selector: 'plus-password-recovery', standalone: true, imports: [RouterLink, ReactiveFormsModule, AuthFieldErrorComponent, FormErrorSummaryComponent,AuthIconComponent], templateUrl: './password-recovery.component.html'})
export class PasswordRecoveryComponent {
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly form = this.builder.group({email: ['', [Validators.required, Validators.email]]});
  readonly submitted = signal(false);
  private readonly auth = inject(AuthService);
  readonly pending = signal(false);
  readonly status = signal('');
  readonly attempted = signal(false);
  validationIssues(){return authFormIssues(this.form,[['email','Correo electrónico']]);}
  fieldError(field:string){return authFieldError(this.form,field);}
  submit() {
    if(this.pending())return;
    this.attempted.set(true);this.form.markAllAsTouched(); if (this.form.invalid) {focusFormTarget('recovery-errors');return;}
    this.pending.set(true);this.status.set('');
    this.auth.requestPasswordReset(this.form.controls.email.value.trim()).pipe(finalize(()=>this.pending.set(false))).subscribe({
      next:()=>{this.form.reset();this.submitted.set(true);},error:error=>this.status.set(apiErrorMessage(error)),
    });
  }
}

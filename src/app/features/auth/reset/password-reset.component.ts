import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { PasswordToggleComponent } from '../shared/password-toggle.component';
import { AuthFieldErrorComponent } from '../shared/auth-field-error.component';
import { matchingPasswords } from '../shared/matching-passwords.validator';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/api/api-error';

@Component({selector: 'plus-password-reset', standalone: true, imports: [RouterLink, ReactiveFormsModule, PasswordToggleComponent, AuthFieldErrorComponent], templateUrl: './password-reset.component.html'})
export class PasswordResetComponent {
  private readonly builder = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private payload: {uid?: string; token: string} = {token: ''};
  readonly valid = signal(false);
  readonly checking = signal(true);
  readonly completed = signal(false);
  readonly pending = signal(false);
  readonly status = signal('');
  readonly form = this.builder.group({password: ['', [Validators.required, Validators.minLength(8)]], confirmation: ['', Validators.required]}, {validators: matchingPasswords});
  constructor() {
    inject(ActivatedRoute).queryParamMap.pipe(
      tap(() => {this.valid.set(false);this.completed.set(false);this.form.reset();this.status.set('');}),
      switchMap(params => {
        this.checking.set(true);
        const token=params.get('token') ?? '';const uid=params.get('uid');
        this.payload=uid ? {uid,token} : {token};
        if(!token){this.checking.set(false);return of({valid:false});}
        return this.auth.validateReset(this.payload).pipe(catchError(error=>{this.status.set(apiErrorMessage(error));return of({valid:false});}),finalize(()=>this.checking.set(false)));
      }), takeUntilDestroyed(inject(DestroyRef)),
    ).subscribe(result=>this.valid.set(result.valid));
  }
  submit() {
    if(this.pending() || !this.valid())return;
    this.form.markAllAsTouched();if(this.form.invalid)return;
    this.pending.set(true);this.status.set('');
    const value=this.form.getRawValue();
    this.auth.confirmReset({...this.payload,new_password:value.password,new_password_confirm:value.confirmation}).pipe(finalize(()=>this.pending.set(false))).subscribe({
      next:()=>{this.form.reset();this.completed.set(true);},error:error=>this.status.set(apiErrorMessage(error)),
    });
  }
}

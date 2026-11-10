import { AuthIconComponent } from '../shared/auth-icon.component';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordToggleComponent } from '../shared/password-toggle.component';
import { AuthFieldErrorComponent } from '../shared/auth-field-error.component';
import { authFieldError, authFormIssues } from '../shared/auth-form-feedback';
import { FormErrorSummaryComponent, focusFormTarget } from '../../../shared/forms/form-error-summary.component';
@Component({selector:'plus-login',standalone:true,imports:[RouterLink,ReactiveFormsModule,PasswordToggleComponent,AuthFieldErrorComponent,FormErrorSummaryComponent,AuthIconComponent],templateUrl:'./login.component.html'})
export class LoginComponent {
 private readonly builder=inject(FormBuilder).nonNullable;
 private readonly auth=inject(AuthService);
 private readonly router=inject(Router);
 private readonly route=inject(ActivatedRoute);
 readonly form=this.builder.group({email:['',[Validators.required,Validators.email]],password:['',Validators.required],remember:[false]});
 readonly message=signal('');
 readonly pending=signal(false);
 readonly attempted=signal(false);
 validationIssues(){return authFormIssues(this.form,[['email','Correo electrónico'],['password','Contraseña']]);}
 fieldError(field:string){return authFieldError(this.form,field);}
 constructor(){if(this.route.snapshot.queryParamMap.has('sessionError'))this.message.set('No se pudo verificar tu sesión. Intenta iniciar sesión de nuevo.');}
 submit(){
  if(this.pending())return;
  this.attempted.set(true);this.form.markAllAsTouched();if(this.form.invalid){this.message.set('');focusFormTarget('login-errors');return;}
  const value=this.form.getRawValue();this.pending.set(true);this.message.set('');
  this.auth.login(value.email.trim(),value.password,value.remember).pipe(finalize(()=>this.pending.set(false))).subscribe({
   next:()=>{this.form.controls.password.reset();const target=this.route.snapshot.queryParamMap.get('returnUrl');
    const safe=target && /^\/(?:ciudadano|admin)(?:\/|\?|$)/.test(target) && (target.startsWith('/admin') ? this.auth.canAdmin() : this.auth.canCitizen());
    void this.router.navigateByUrl(safe ? target : this.auth.defaultRoute());},
   error:error=>this.message.set(apiErrorMessage(error)),
  });
 }
}

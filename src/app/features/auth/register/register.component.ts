import { AuthIconComponent } from '../shared/auth-icon.component';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordToggleComponent } from '../shared/password-toggle.component';
import { AuthFieldErrorComponent } from '../shared/auth-field-error.component';
import { authFieldError, authFormIssues } from '../shared/auth-form-feedback';
import { FormErrorSummaryComponent, focusFormTarget } from '../../../shared/forms/form-error-summary.component';
@Component({selector:'plus-register',standalone:true,imports:[RouterLink,ReactiveFormsModule,PasswordToggleComponent,AuthFieldErrorComponent,FormErrorSummaryComponent,AuthIconComponent],templateUrl:'./register.component.html'})
export class RegisterComponent {
 private readonly builder=inject(FormBuilder).nonNullable;
 private readonly auth=inject(AuthService);
 private readonly router=inject(Router);
 readonly form=this.builder.group({name:['',[Validators.required,Validators.maxLength(100),Validators.pattern(/\S/)]],surname:['',[Validators.required,Validators.maxLength(100),Validators.pattern(/\S/)]],phone:['',Validators.maxLength(20)],email:['',[Validators.required,Validators.email,Validators.maxLength(150)]],password:['',[Validators.required,Validators.minLength(8)]],confirmation:['',Validators.required],consent:[false,Validators.requiredTrue]},{validators:group=>group.get('password')?.value === group.get('confirmation')?.value ? null : {passwordMismatch:true}});
 readonly message=signal('');
 readonly pending=signal(false);
 readonly attempted=signal(false);
 validationIssues(){return authFormIssues(this.form,[['name','Nombres'],['surname','Apellidos'],['phone','Teléfono'],['email','Correo electrónico'],['password','Contraseña'],['confirmation','Confirmación'],['consent','Tratamiento de datos']]);}
 fieldError(field:string){return authFieldError(this.form,field);}
 submit(){
  if(this.pending())return;
  this.attempted.set(true);this.form.markAllAsTouched();if(this.form.invalid){this.message.set('');focusFormTarget('register-errors');return;}
  const value=this.form.getRawValue();this.pending.set(true);this.message.set('');
  this.auth.register({nombres:value.name.trim(),apellidos:value.surname.trim(),correo:value.email.trim(),telefono:value.phone.trim(),password:value.password,acepta_tratamiento_datos:value.consent}).pipe(finalize(()=>this.pending.set(false))).subscribe({
   next:()=>{this.form.reset();void this.router.navigateByUrl('/ciudadano/perfil');},error:error=>this.message.set(apiErrorMessage(error)),
  });
 }
 passwordProgress(){return Math.min(100,this.form.controls.password.value.length / 8 * 100);}
 passwordHint(){return this.form.controls.password.value.length >= 8 ? 'Longitud mínima cumplida' : 'Pendiente';}
}

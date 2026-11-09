import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordToggleComponent } from '../shared/password-toggle.component';
import { AuthFieldErrorComponent } from '../shared/auth-field-error.component';
@Component({selector:'plus-login',standalone:true,imports:[RouterLink,ReactiveFormsModule,PasswordToggleComponent,AuthFieldErrorComponent],templateUrl:'./login.component.html'})
export class LoginComponent {
 private readonly builder=inject(FormBuilder).nonNullable;
 readonly form=this.builder.group({email:['',[Validators.required,Validators.email]],password:['',Validators.required],remember:[false]});
 readonly message=signal('');
 submit(){this.form.markAllAsTouched();if(this.form.invalid){this.message.set('Revisa los campos señalados antes de continuar.');return;}this.message.set('Datos de ejemplo válidos. No se ha iniciado sesión.');}
}

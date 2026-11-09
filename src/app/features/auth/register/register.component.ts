import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordToggleComponent } from '../shared/password-toggle.component';
import { AuthFieldErrorComponent } from '../shared/auth-field-error.component';
@Component({selector:'plus-register',standalone:true,imports:[RouterLink,ReactiveFormsModule,PasswordToggleComponent,AuthFieldErrorComponent],templateUrl:'./register.component.html'})
export class RegisterComponent {
 private readonly builder=inject(FormBuilder).nonNullable;
 readonly form=this.builder.group({name:['',[Validators.required,Validators.maxLength(150),Validators.pattern(/\S/)]],email:['',[Validators.required,Validators.email]],password:['',[Validators.required,Validators.minLength(8)]],confirmation:['',Validators.required],affiliation:['ciudadano'],consent:[false,Validators.requiredTrue],notifications:[false]},{validators:group=>group.get('password')?.value === group.get('confirmation')?.value ? null : {passwordMismatch:true}});
 readonly message=signal('');
 submit(){this.form.markAllAsTouched();if(this.form.invalid){this.message.set('Revisa los campos señalados antes de continuar.');return;}this.message.set('Datos de ejemplo válidos. No se ha creado ninguna cuenta.');}
 confirmationError(){return this.form.controls.confirmation.touched && this.form.hasError('passwordMismatch') ? 'Las contraseñas deben coincidir.' : '';}
 passwordProgress(){return Math.min(100,this.form.controls.password.value.length / 8 * 100);}
 passwordHint(){return this.form.controls.password.value.length >= 8 ? 'Longitud mínima cumplida' : 'Pendiente';}
}

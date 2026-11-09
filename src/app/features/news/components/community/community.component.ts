import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({selector:'plus-news-community',standalone:true,imports:[RouterLink,ReactiveFormsModule],templateUrl:'./community.component.html'})
export class CommunityComponent {private readonly builder=inject(FormBuilder).nonNullable;readonly form=this.builder.group({name:['',[Validators.required,Validators.pattern(/\S/)]],email:['',[Validators.required,Validators.email]],consent:[false,Validators.requiredTrue]});readonly message=signal('');subscribe(){this.form.markAllAsTouched();this.message.set(this.form.invalid?'Revisa el nombre, el correo y el consentimiento.':'Datos de ejemplo válidos. No se ha enviado ni registrado la suscripción.');}}

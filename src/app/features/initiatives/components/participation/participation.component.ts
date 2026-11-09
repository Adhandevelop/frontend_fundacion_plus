import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({selector:'plus-initiative-participation',standalone:true,imports:[ReactiveFormsModule],templateUrl:'./participation.component.html'})
export class InitiativeParticipationComponent {
private readonly builder=inject(FormBuilder).nonNullable;
readonly form=this.builder.group({name:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(150)]],phone:['',[Validators.required,Validators.pattern(/^(?=.*\d)[+()\d\s.-]{7,25}$/)]],territory:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(200)]],initiative:['Dulcemanía (Niñez y Veeduría en Halloween)',Validators.required],title:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(200)]],description:['',[Validators.required,Validators.maxLength(2000),Validators.pattern(/\S/)]],consent:[false,Validators.requiredTrue]});
readonly message=signal('');
submit(){this.form.markAllAsTouched();this.message.set(this.form.invalid?'Revisa nombre, título, territorio, teléfono, descripción y aceptación del ejemplo.':'Postulación de ejemplo validada. No se ha enviado ni registrado, ni se guardó un consentimiento real; ningún equipo ha sido notificado.');}
}

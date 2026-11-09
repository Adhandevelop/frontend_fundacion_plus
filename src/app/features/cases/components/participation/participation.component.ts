import { Component,inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({selector:'plus-case-participation',standalone:true,imports:[ReactiveFormsModule],templateUrl:'./participation.component.html'})
export class CaseParticipationComponent {
private readonly builder = inject(FormBuilder).nonNullable;
 readonly form = this.builder.group({contribution:['',[Validators.required,Validators.minLength(20),Validators.maxLength(2000), Validators.pattern(/\S/)]]});
 readonly message = signal('');
 submit() {
   this.form.markAllAsTouched();
   const text = this.form.controls.contribution.value.trim();
   this.message.set(this.form.invalid || text.length < 20
     ? 'Escribe un aporte de entre 20 y 2000 caracteres.'
     : 'Aporte de ejemplo validado. No se ha enviado, guardado ni publicado.');
 }

}

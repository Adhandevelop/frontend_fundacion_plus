import { Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { InitiativeDemo } from '../../data/initiatives.demo';
import { InitiativesApiService } from '../../initiatives-api.service';
@Component({selector:'plus-initiative-participation',standalone:true,imports:[ReactiveFormsModule],templateUrl:'./participation.component.html'})
export class InitiativeParticipationComponent {
private readonly builder=inject(FormBuilder).nonNullable;
private readonly api=inject(InitiativesApiService);
readonly initiatives=input<readonly InitiativeDemo[]>([]);
readonly selectableInitiatives=computed(()=>this.initiatives().filter(item=>!item.demo));
readonly form=this.builder.group({name:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(150)]],phone:['',[Validators.required,Validators.pattern(/^(?=.*\d)[+()\d\s.-]{7,25}$/)]],territory:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(200)]],initiative:[''],title:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(200)]],description:['',[Validators.required,Validators.maxLength(2000),Validators.pattern(/\S/)]],consent:[false,Validators.requiredTrue]});
readonly message=signal('');
readonly pending=signal(false);
submit(){this.form.markAllAsTouched();this.message.set('');if(this.form.invalid){this.message.set('Revisa nombre, título, territorio, teléfono, descripción y la autorización de tratamiento de datos.');return;}this.pending.set(true);this.api.propose(this.form.getRawValue()).pipe(finalize(()=>this.pending.set(false))).subscribe({next:value=>{const reference=value?.id_propuesta??value?.id;this.message.set(`Postulación recibida${reference?` con referencia ${reference}`:''}. El equipo de PLUS podrá revisarla.`);this.form.reset({name:'',phone:'',territory:'',initiative:'',title:'',description:'',consent:false});},error:error=>this.message.set(apiErrorMessage(error))});}
}

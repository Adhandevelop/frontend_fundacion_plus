import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { NewsApiService } from '../../news-api.service';
import { apiErrorMessage } from '../../../../core/api/api-error';
@Component({selector:'plus-news-community',standalone:true,imports:[RouterLink,ReactiveFormsModule],templateUrl:'./community.component.html'})
export class CommunityComponent {private readonly builder=inject(FormBuilder).nonNullable;private readonly api=inject(NewsApiService);readonly form=this.builder.group({name:['',[Validators.required,Validators.pattern(/\S/)]],email:['',[Validators.required,Validators.email]],consent:[false,Validators.requiredTrue]});readonly message=signal('');readonly pending=signal(false);subscribe(){this.form.markAllAsTouched();if(this.form.invalid||this.pending()){this.message.set('Revisa el nombre, el correo y el consentimiento.');return;}this.pending.set(true);this.message.set('');const value=this.form.getRawValue();this.api.subscribe(value.name,value.email).pipe(finalize(()=>this.pending.set(false))).subscribe({next:response=>{this.form.reset();this.message.set(response.mensaje||response.message||'Revisa tu correo para confirmar la suscripción.');},error:error=>this.message.set(apiErrorMessage(error))});}}

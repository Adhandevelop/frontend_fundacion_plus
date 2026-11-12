import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../core/api/api-error';
import { NewsApiService } from './news-api.service';

type Action='confirm'|'unsubscribe';
@Component({selector:'plus-newsletter-action',standalone:true,imports:[RouterLink,ReactiveFormsModule],templateUrl:'./newsletter-action.component.html'})
export class NewsletterActionComponent {
  private readonly api=inject(NewsApiService);private readonly route=inject(ActivatedRoute);private readonly destroy=inject(DestroyRef);
  readonly action=(this.route.snapshot.data['action']??'confirm') as Action;
  readonly token=signal('');readonly pending=signal(false);readonly complete=signal(false);readonly error=signal('');readonly message=signal('');
  readonly form=inject(FormBuilder).nonNullable.group({email:['',[Validators.required,Validators.email,Validators.maxLength(150)]]});
  constructor(){this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params=>{this.token.set((params.get('token')??'').trim());const email=(params.get('correo')??params.get('email')??'').trim();this.form.controls.email.setValue(email);this.complete.set(false);this.error.set('');this.message.set('');if(this.action==='confirm')this.submit();});}
  submit(){if(this.pending()||this.complete())return;if(!this.token()){this.error.set('El enlace no contiene un token válido. Solicita un nuevo correo de suscripción.');return;}if(this.action==='unsubscribe'){this.form.markAllAsTouched();if(this.form.invalid){this.error.set('Escribe el mismo correo con el que realizaste la suscripción.');return;}}
    this.pending.set(true);this.error.set('');const request=this.action==='confirm'?this.api.confirmSubscription(this.token()):this.api.unsubscribe(this.token(),this.form.controls.email.value);
    request.pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.pending.set(false))).subscribe({next:response=>{this.complete.set(true);this.message.set(response.message||response.mensaje||(this.action==='confirm'?'Tu suscripción fue confirmada.':'La suscripción fue dada de baja.'));},error:error=>this.error.set(apiErrorMessage(error))});
  }
}

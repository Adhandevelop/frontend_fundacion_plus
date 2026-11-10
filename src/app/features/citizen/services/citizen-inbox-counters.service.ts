import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { CitizenCasesApiService } from './citizen-cases-api.service';

@Injectable({providedIn:'root'})
export class CitizenInboxCountersService {
  private readonly auth=inject(AuthService);
  private readonly api=inject(CitizenCasesApiService);
  private readonly destroy=inject(DestroyRef);
  private request?:Subscription;
  private readonly state=signal<{owner:string;messages:number;notifications:number}|null>(null);
  private readonly current=computed(()=>this.auth.canCitizen() && this.state()?.owner===this.auth.user()?.id_usuario?this.state():null);
  readonly messages=computed(()=>this.current()?.messages ?? null);
  readonly notifications=computed(()=>this.current()?.notifications ?? null);
  refresh(){
    this.request?.unsubscribe();
    const owner=this.auth.user()?.id_usuario;
    if(!owner || !this.auth.canCitizen()){this.state.set(null);return;}
    this.request=this.api.dashboard().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{
      if(this.auth.user()?.id_usuario===owner && this.auth.canCitizen())this.state.set({owner,messages:value.unread_messages,notifications:value.unread_notifications});
    },error:()=>{if(this.auth.user()?.id_usuario===owner)this.state.set(null);}});
  }
}

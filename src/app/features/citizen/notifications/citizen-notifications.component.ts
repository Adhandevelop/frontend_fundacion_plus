import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { CitizenCommunicationApiService } from '../services/citizen-communication-api.service';
import { CitizenInboxCountersService } from '../services/citizen-inbox-counters.service';
import { CitizenNotification, NotificationPage } from '../services/citizen-communication.models';

@Component({selector:'plus-citizen-notifications',standalone:true,imports:[DatePipe],templateUrl:'./citizen-notifications.component.html'})
export class CitizenNotificationsComponent {
  readonly counters=inject(CitizenInboxCountersService);
  private readonly api=inject(CitizenCommunicationApiService);
  private readonly destroy=inject(DestroyRef);
  private readonly router=inject(Router);
  private revision=0;
  readonly unreadOnly=signal(false);
  readonly page=signal(1);
  readonly pageSize=10;
  readonly result=signal<NotificationPage>({count:0,next:null,previous:null,results:[]});
  readonly pages=computed(()=>Math.max(1,Math.ceil(this.result().count/this.pageSize)));
  readonly unreadIds=computed(()=>this.result().results.filter(item=>!item.leida).map(item=>item.id_notificacion));
  readonly loading=signal(true);
  readonly pending=signal(false);
  readonly error=signal('');
  readonly status=signal('');
  constructor(){this.load();this.counters.refresh();}
  load(){
    const revision=++this.revision;this.loading.set(true);this.error.set('');
    this.api.notifications(this.page(),this.pageSize,this.unreadOnly()).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.revision)this.loading.set(false);})).subscribe({next:value=>{if(revision===this.revision)this.result.set(value);},error:error=>{
      if(revision!==this.revision)return;
      if(error instanceof HttpErrorResponse && error.status===404 && this.page()>1){this.page.set(1);this.load();return;}
      this.error.set(apiErrorMessage(error));
    }});
  }
  filter(unread:boolean){if(this.pending())return;this.unreadOnly.set(unread);this.page.set(1);this.load();}
  navigate(delta:number){if(this.pending() || this.loading())return;this.page.update(value=>Math.max(1,Math.min(this.pages(),value+delta)));this.load();}
  mark(item:CitizenNotification,open=false){
    if(this.pending())return;
    if(item.leida){if(open)this.go(item);return;}
    this.pending.set(true);this.status.set('');
    this.api.readNotification(item.id_notificacion).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.pending.set(false))).subscribe({next:()=>{
      this.counters.refresh();this.status.set('Notificación marcada como leída.');
      if(open)this.go(item);else this.load();
    },error:error=>this.status.set(apiErrorMessage(error))});
  }
  markPage(){
    const ids=this.unreadIds();if(!ids.length || this.pending() || this.loading())return;
    this.pending.set(true);this.status.set('');
    this.api.readNotifications(ids).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.pending.set(false))).subscribe({next:value=>{
      this.status.set(`${value.marked_read_count} notificaciones marcadas como leídas.`);this.counters.refresh();this.load();
    },error:error=>this.status.set(apiErrorMessage(error))});
  }
  private go(item:CitizenNotification){
    if(!this.canOpen(item))return;
    if(item.tipo==='mensaje_privado')void this.router.navigate(['/ciudadano/mensajes'],{queryParams:{caso:item.caso}});
    else void this.router.navigate(['/ciudadano/casos',item.caso],{queryParams:{seccion:item.tipo==='solicitud_correccion'?'contribution':'history'}});
  }
  canOpen(item:CitizenNotification){return !!item.caso && ['mensaje_privado','solicitud_correccion','moderacion_caso','asignacion_caso','estado_caso','seguimiento_caso','aporte_ciudadano'].includes(item.tipo);}
  label(kind:string){return ({mensaje_privado:'Mensaje privado',solicitud_correccion:'Información solicitada',moderacion_caso:'Publicación',asignacion_caso:'Asignación',estado_caso:'Estado del caso',seguimiento_caso:'Seguimiento',aporte_ciudadano:'Aporte',comentario_moderado:'Moderación de comentario',sistema:'Sistema'} as Record<string,string>)[kind] ?? kind;}
}

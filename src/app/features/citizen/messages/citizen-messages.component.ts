import { Component, computed, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { CitizenCasesApiService } from '../services/citizen-cases-api.service';
import { CitizenCase } from '../services/citizen-cases.models';
import { CitizenCommunicationApiService } from '../services/citizen-communication-api.service';
import { CitizenInboxCountersService } from '../services/citizen-inbox-counters.service';
import { Conversation, groupCaseThreads, PrivateMessage } from '../services/citizen-communication.models';

@Component({selector:'plus-citizen-messages',standalone:true,imports:[DatePipe,RouterLink,ReactiveFormsModule],templateUrl:'./citizen-messages.component.html',styleUrl:'../../cases/workspace/case-workspace.component.css',encapsulation:ViewEncapsulation.None})
export class CitizenMessagesComponent {
  readonly auth=inject(AuthService);
  readonly counters=inject(CitizenInboxCountersService);
  private readonly api=inject(CitizenCommunicationApiService);
  private readonly cases=inject(CitizenCasesApiService);
  private readonly destroy=inject(DestroyRef);
  private readonly drafts=new Map<string,string>();
  private readonly sendErrors=new Map<string,string>();
  private readonly pendingCases=signal<ReadonlySet<string>>(new Set());
  private readonly uncertainCases=signal<ReadonlySet<string>>(new Set());
  private inboxRevision=0;
  private threadRevision=0;
  private inboxRequest?:Subscription;
  private threadRequest?:Subscription;
  private reference='';
  readonly conversations=signal<Conversation[]>([]);
  readonly threads=computed(()=>groupCaseThreads(this.conversations()));
  readonly query=signal('');
  readonly unreadOnly=signal(false);
  readonly visible=computed(()=>this.threads().filter(item=>{
    const text=this.normalize(`${item.caso_codigo} ${item.caso_titulo} ${item.participantes.join(' ')}`);
    return text.includes(this.normalize(this.query().trim())) && (!this.unreadOnly() || item.unread_count>0);
  }));
  readonly generalCount=computed(()=>this.conversations().filter(item=>!item.id_caso).length);
  readonly inboxLoading=signal(true);
  readonly inboxError=signal('');
  readonly threadLoading=signal(false);
  readonly threadError=signal('');
  readonly selected=signal<CitizenCase|null>(null);
  readonly messages=signal<PrivateMessage[]>([]);
  readonly status=signal('');
  readonly sending=computed(()=>this.pendingCases().has(this.selected()?.id_caso ?? ''));
  readonly uncertain=computed(()=>this.uncertainCases().has(this.selected()?.id_caso ?? ''));
  readonly form=inject(FormBuilder).nonNullable.group({content:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(5000)]]});
  constructor(){
    this.loadInbox();this.counters.refresh();
    inject(ActivatedRoute).queryParamMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params=>{
      this.saveDraft();this.reference=params.get('caso') ?? '';this.selected.set(null);this.messages.set([]);this.form.reset();this.status.set('');this.loadThread();
    });
  }
  loadInbox(){
    const revision=++this.inboxRevision;this.inboxLoading.set(true);this.inboxError.set('');
    this.inboxRequest?.unsubscribe();
    this.inboxRequest=this.api.conversations().pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.inboxRevision)this.inboxLoading.set(false);})).subscribe({next:value=>{if(revision===this.inboxRevision)this.conversations.set(value);},error:error=>{if(revision===this.inboxRevision)this.inboxError.set(apiErrorMessage(error));}});
  }
  loadThread(){
    this.saveDraft();const revision=++this.threadRevision;this.threadError.set('');
    this.threadRequest?.unsubscribe();
    if(!this.reference){this.threadLoading.set(false);return;}
    this.threadLoading.set(true);
    this.threadRequest=forkJoin({caso:this.cases.detail(this.reference),messages:this.api.messages(this.reference)}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.threadRevision)this.threadLoading.set(false);})).subscribe({next:({caso,messages})=>{
      if(revision!==this.threadRevision)return;
      const owner=this.auth.user()?.id_usuario;
      const own=messages.filter(item=>item.caso===caso.id_caso && (item.remitente===owner || item.destinatario===owner)).sort((a,b)=>Date.parse(a.fecha_envio)-Date.parse(b.fecha_envio));
      this.selected.set(caso);this.messages.set(own);this.form.controls.content.setValue(this.drafts.get(caso.id_caso) ?? '');this.status.set(this.sendErrors.get(caso.id_caso) ?? '');
      const received=own.filter(item=>item.destinatario===owner && !item.fecha_lectura).map(item=>item.id_mensaje);
      this.counters.refresh();this.loadInbox();
      if(received.length)this.api.readMessages(caso.id_caso,received).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:()=>{this.counters.refresh();this.loadInbox();},error:error=>{if(revision===this.threadRevision)this.status.set('No se pudo confirmar la lectura: '+apiErrorMessage(error));}});
    },error:error=>{if(revision===this.threadRevision)this.threadError.set(apiErrorMessage(error));}});
  }
  saveDraft(){const id=this.selected()?.id_caso;if(id)this.drafts.set(id,this.form.controls.content.value);}
  canSend(){return this.selected()?.allowed_actions.includes('message') ?? false;}
  send(){
    const caso=this.selected();if(!caso || !this.canSend() || this.sending() || this.uncertain() || this.threadLoading())return;
    this.form.markAllAsTouched();if(this.form.invalid)return;
    const content=this.form.controls.content.value.trim(),id=caso.id_caso;
    this.drafts.set(id,content);this.pendingCases.update(value=>new Set([...value,id]));this.sendErrors.delete(id);this.status.set('');
    this.api.send(id,content).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.pendingCases.update(value=>{const next=new Set(value);next.delete(id);return next;}))).subscribe({next:()=>{
      this.drafts.delete(id);this.counters.refresh();this.loadInbox();
      if(this.selected()?.id_caso===id){this.form.reset();this.loadThread();this.status.set('Mensaje enviado.');}
    },error:error=>{
      // Do not automatically resend: the server may have saved a message whose response was lost.
      const text=apiErrorMessage(error);this.sendErrors.set(id,text);
      const uncertain=!(error instanceof HttpErrorResponse) || error.status===0 || error.status>=500;
      if(uncertain)this.uncertainCases.update(value=>new Set([...value,id]));
      if(this.selected()?.id_caso===id)this.status.set(text+(uncertain?' Revisa el hilo antes de enviar otro mensaje.':''));
    }});
  }
  discardDraft(){const id=this.selected()?.id_caso;if(!id || this.sending())return;this.form.reset();this.drafts.delete(id);this.sendErrors.delete(id);this.uncertainCases.update(value=>{const next=new Set(value);next.delete(id);return next;});this.status.set('Borrador descartado. No se ha reenviado ningún mensaje.');}
  private normalize(value:string){return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
}

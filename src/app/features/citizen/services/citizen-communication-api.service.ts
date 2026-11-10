import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api.config';
import { CitizenNotification, Conversation, NotificationPage, PrivateMessage } from './citizen-communication.models';

@Injectable({providedIn:'root'})
export class CitizenCommunicationApiService {
  private readonly http=inject(HttpClient);
  private readonly base=inject(API_BASE_URL);
  private messagesUrl(id:string){return `${this.base}/cases/${encodeURIComponent(id)}/messages/`;}
  conversations(){return this.http.get<Conversation[]>(`${this.base}/me/conversations/`);}
  messages(id:string){return this.http.get<PrivateMessage[]>(this.messagesUrl(id));}
  send(id:string,contenido:string){return this.http.post<PrivateMessage>(this.messagesUrl(id),{contenido});}
  readMessages(id:string,messageIds:readonly string[]){
    if(!messageIds.length)return throwError(()=>new Error('No hay mensajes para marcar.'));
    return this.http.put<{marked_read:number;unread_remaining:number}>(this.messagesUrl(id)+'read/',{message_ids:[...new Set(messageIds)]});
  }
  notifications(page:number,pageSize:number,unread:boolean){
    return this.http.get<NotificationPage|CitizenNotification[]>(`${this.base}/me/notifications/`,{params:{page,page_size:pageSize,...(unread?{leida:'false'}:{})}}).pipe(map(value=>Array.isArray(value)?{count:value.length,next:null,previous:null,results:value}:value));
  }
  readNotification(id:string){return this.http.patch<CitizenNotification>(`${this.base}/me/notifications/${encodeURIComponent(id)}/`,{leida:true});}
  readNotifications(ids:readonly string[]){
    // The server treats an omitted/empty list as "all"; never send an empty selection.
    if(!ids.length)return throwError(()=>new Error('No hay avisos para marcar.'));
    return this.http.post<{marked_read_count:number;unread_remaining:number}>(`${this.base}/me/notifications/mark-read/`,{ids:[...new Set(ids)]});
  }
}

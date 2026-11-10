export interface Conversation {
  id_caso:string|null; caso_codigo:string|null; caso_titulo:string;
  counterpart:{id_usuario:string;nombre:string;rol:string};
  last_message:{id_mensaje:string;contenido:string;fecha_envio:string;remitente:string};
  unread_count:number;
}
export interface CaseThread {
  id_caso:string; caso_codigo:string; caso_titulo:string; participantes:string[];
  last_message:Conversation['last_message']; unread_count:number;
}
export interface PrivateMessage {
  id_mensaje:string; caso:string; remitente:string; remitente_nombre:string;
  destinatario:string; destinatario_nombre:string; contenido:string; fecha_envio:string; fecha_lectura:string|null;
}
export interface CitizenNotification {
  id_notificacion:string; caso:string|null; caso_codigo?:string|null;
  titulo:string; mensaje:string; tipo:string; leida:boolean; fecha_creacion:string;
}
export interface NotificationPage {count:number;next:string|null;previous:string|null;results:CitizenNotification[]}
export function groupCaseThreads(conversations:Conversation[]):CaseThread[] {
  const groups=new Map<string,CaseThread>();
  for(const item of conversations){
    if(!item.id_caso)continue;
    const previous=groups.get(item.id_caso);
    if(!previous){groups.set(item.id_caso,{id_caso:item.id_caso,caso_codigo:item.caso_codigo ?? '',caso_titulo:item.caso_titulo,participantes:[item.counterpart.nombre],last_message:item.last_message,unread_count:item.unread_count});continue;}
    previous.unread_count+=item.unread_count;
    if(!previous.participantes.includes(item.counterpart.nombre))previous.participantes.push(item.counterpart.nombre);
    if(Date.parse(item.last_message.fecha_envio)>Date.parse(previous.last_message.fecha_envio))previous.last_message=item.last_message;
  }
  return [...groups.values()].sort((a,b)=>Date.parse(b.last_message.fecha_envio)-Date.parse(a.last_message.fecha_envio));
}

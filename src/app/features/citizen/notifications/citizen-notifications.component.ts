import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CitizenAreaDemoService, CitizenNotificationDemo } from '../services/citizen-area-demo.service';

@Component({selector: 'plus-citizen-notifications', standalone: true, imports: [DatePipe, RouterLink], templateUrl: './citizen-notifications.component.html'})
export class CitizenNotificationsComponent {
  readonly area = inject(CitizenAreaDemoService);
  readonly kind = signal('');
  readonly unreadOnly = signal(false);
  readonly visible = computed(() => this.area.notifications().filter(item => (!this.kind() || item.kind === this.kind()) && (!this.unreadOnly() || !item.read)));
  destination(item: CitizenNotificationDemo) {return item.kind === 'message' ? ['/ciudadano/mensajes'] : ['/ciudadano/casos', item.code];}
  params(item: CitizenNotificationDemo) {return item.kind === 'message' ? {caso: item.code} : {seccion: item.kind === 'correction' ? 'contribution' : 'history'};}
  label(kind: string) {return kind === 'message' ? 'Mensaje' : kind === 'correction' ? 'Información solicitada' : 'Seguimiento';}
}

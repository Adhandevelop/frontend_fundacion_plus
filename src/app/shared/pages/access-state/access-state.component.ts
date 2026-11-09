import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({selector: 'plus-access-state', standalone: true, imports: [RouterLink], templateUrl: './access-state.component.html'})
export class AccessStateComponent {
  private readonly kind = inject(ActivatedRoute).snapshot.data['kind'] as string;
  readonly state = this.kind === 'expired' ? {
    icon: 'schedule', label: 'Estado de acceso', title: 'Tu sesión ha vencido',
    text: 'No se pudo renovar tu sesión. Inicia sesión de nuevo para continuar.', route: '/login', action: 'Ir a iniciar sesión',
  } : this.kind === 'forbidden' ? {
    icon: 'lock', label: '403 · Acceso restringido', title: 'Acceso no permitido',
    text: 'Tu cuenta no tiene permisos para acceder a esta sección.', route: '/', action: 'Volver al portal',
  } : {
    icon: 'travel_explore', label: '404 · Página no encontrada', title: 'No encontramos esta página',
    text: 'La dirección puede haber cambiado o no corresponder a una página disponible de PLUS.', route: '/', action: 'Volver al inicio',
  };
}

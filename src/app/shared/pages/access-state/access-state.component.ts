import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({selector: 'plus-access-state', standalone: true, imports: [RouterLink], templateUrl: './access-state.component.html'})
export class AccessStateComponent {
  private readonly kind = inject(ActivatedRoute).snapshot.data['kind'] as string;
  readonly state = this.kind === 'expired' ? {
    icon: 'schedule', label: 'Estado de acceso · Demostración', title: 'Tu sesión ha vencido',
    text: 'Este ejemplo muestra el estado que aparecerá cuando termine una sesión. Actualmente no hay una sesión real que renovar.', route: '/login', action: 'Ir a iniciar sesión',
  } : this.kind === 'forbidden' ? {
    icon: 'lock', label: '403 · Vista de demostración', title: 'Acceso no permitido',
    text: 'Este ejemplo representa una sección restringida a perfiles autorizados. No se han comprobado permisos ni se han modificado tus accesos.', route: '/', action: 'Volver al portal',
  } : {
    icon: 'travel_explore', label: '404 · Página no encontrada', title: 'No encontramos esta página',
    text: 'La dirección puede haber cambiado o no corresponder a una página disponible de PLUS.', route: '/', action: 'Volver al inicio',
  };
}

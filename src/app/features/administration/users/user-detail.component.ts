import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { UsersDemoService } from './services/users-demo.service';
import { DEMO_ROLES } from './data/users.demo';

@Component({selector: 'plus-demo-user-detail', standalone: true, imports: [RouterLink], templateUrl: './user-detail.component.html'})
export class UserDetailComponent {
  readonly store = inject(UsersDemoService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  private readonly query = toSignal(this.route.queryParamMap, {initialValue: this.route.snapshot.queryParamMap});
  readonly id = computed(() => this.params().get('id') ?? '');
  readonly user = computed(() => this.store.find(this.id()));
  readonly roles = computed(() => DEMO_ROLES.filter(role => this.user()?.roles.includes(role.id)));
  readonly confirming = signal(false);
  readonly status = signal('');
  constructor() {
    effect(() => {
      this.id(); const result = this.query().get('resultado');
      this.confirming.set(false);
      this.status.set(result === 'creado' ? 'Registro de ejemplo creado en memoria. No se creó ninguna cuenta.' : result === 'editado' ? 'Cambios de ejemplo guardados en memoria. No se modificaron permisos reales.' : '');
    }, {allowSignalWrites: true});
  }
  changeState() {
    const user = this.user(); if (!user) return;
    this.store.setActive(user.id, !user.active); this.confirming.set(false);
    this.status.set('Estado del registro de ejemplo actualizado. No se bloquearon cuentas ni se revocaron sesiones.');
  }
}

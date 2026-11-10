import { canAccessAdminSection } from '../../../core/auth/admin-access.policy';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminCommunity, AdminTerritoriesApiService } from './admin-territories-api.service';

@Component({selector: 'plus-community-detail', standalone: true, imports: [RouterLink], templateUrl: './community-detail.component.html'})
export class CommunityDetailComponent {
  private readonly api = inject(AdminTerritoriesApiService);
  private readonly auth = inject(AuthService);
  private readonly destroy = inject(DestroyRef);
  private request?: Subscription;
  private revision = 0;
  readonly id = signal('');
  readonly record = signal<AdminCommunity | null>(null);
  readonly canManage = computed(() => canAccessAdminSection(this.auth.user(), 'territories'));
  readonly loading = signal(true); readonly saving = signal(false); readonly uncertain = signal(false);
  readonly error = signal(''); readonly status = signal('');
  readonly review = signal<{id: string; name: string; active: boolean} | null>(null);
  constructor() {
    inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params => {
      this.id.set(params.get('id') ?? ''); this.record.set(null); this.status.set(''); this.saving.set(false); this.uncertain.set(false); this.load();
    });
  }
  load() {
    if (this.saving()) return;
    const revision = ++this.revision;
    this.request?.unsubscribe(); this.review.set(null); this.loading.set(true); this.error.set('');
    this.request = this.api.get(this.id()).pipe(takeUntilDestroyed(this.destroy), finalize(() => {if (revision === this.revision) this.loading.set(false);})).subscribe({
      next: value => {if (revision === this.revision) {this.record.set(value); this.uncertain.set(false);}},
      error: error => {if (revision === this.revision) this.error.set(apiErrorMessage(error));},
    });
  }
  prepareState() {
    const row = this.record();
    if (!row || !this.canManage() || this.loading() || this.error() || this.saving() || this.uncertain()) return;
    this.review.set({id: row.id_comunidad, name: row.nombre, active: !row.activo}); this.status.set('');
    if (typeof document !== 'undefined') setTimeout(() => document.getElementById('community-state')?.focus(), 0);
  }
  changeState() {
    const decision = this.review();
    if (!decision || !this.canManage() || this.saving() || this.uncertain() || this.loading() || this.error() || decision.id !== this.record()?.id_comunidad) return;
    const revision = this.revision; this.saving.set(true);
    this.api.setActive(decision.id, decision.active).pipe(takeUntilDestroyed(this.destroy), finalize(() => {if (revision === this.revision) this.saving.set(false);})).subscribe({
      next: () => {if (revision === this.revision) {this.saving.set(false); this.status.set('Estado guardado.'); this.load();}},
      error: error => {
        if (revision !== this.revision) return;
        this.review.set(null); const uncertain = error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500);
        this.uncertain.set(uncertain); this.status.set(uncertain ? 'No se pudo confirmar el resultado. Actualiza y revisa el estado antes de repetir la acción.' : apiErrorMessage(error));
      },
    });
  }
}

import { canAccessAdminSection } from '../../../core/auth/admin-access.policy';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminTerritoriesApiService, COMMUNITY_TYPES, CommunityFilters, CommunityPage, TerritoryMunicipality } from './admin-territories-api.service';

@Component({selector: 'plus-admin-communities', standalone: true, imports: [RouterLink, ReactiveFormsModule], templateUrl: './communities-list.component.html'})
export class CommunitiesListComponent {
  private readonly api = inject(AdminTerritoriesApiService);
  private readonly auth = inject(AuthService);
  private readonly destroy = inject(DestroyRef);
  private request?: Subscription;
  private revision = 0;
  readonly canManage = computed(() => canAccessAdminSection(this.auth.user(), 'territories'));
  readonly types = COMMUNITY_TYPES;
  readonly form = inject(FormBuilder).nonNullable.group({municipio: '', tipo: '', activo: ''});
  readonly applied = signal<CommunityFilters>({municipio: '', tipo: '', activo: ''});
  readonly municipalities = signal<TerritoryMunicipality[]>([]);
  readonly catalogError = signal('');
  readonly data = signal<CommunityPage | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly pages = computed(() => Math.max(1, Math.ceil((this.data()?.count ?? 0) / this.pageSize)));
  constructor() {this.load(); this.loadCatalog();}
  loadCatalog() {
    this.catalogError.set('');
    this.api.municipalities().pipe(takeUntilDestroyed(this.destroy)).subscribe({next: rows => this.municipalities.set(rows), error: error => this.catalogError.set(apiErrorMessage(error))});
  }
  load() {
    const revision = ++this.revision;
    this.request?.unsubscribe(); this.loading.set(true); this.error.set('');
    this.request = this.api.list(this.applied(), this.page(), this.pageSize).pipe(
      takeUntilDestroyed(this.destroy), finalize(() => {if (revision === this.revision) this.loading.set(false);}),
    ).subscribe({next: value => {if (revision === this.revision) this.data.set(value);}, error: error => {
      if (revision !== this.revision) return;
      if (error instanceof HttpErrorResponse && error.status === 404 && this.page() > 1) {this.page.set(1); this.load(); return;}
      this.error.set(apiErrorMessage(error));
    }});
  }
  apply() {this.applied.set(this.form.getRawValue()); this.form.markAsPristine(); this.page.set(1); this.load();}
  reset() {this.form.reset({municipio: '', tipo: '', activo: ''}); this.apply();}
  navigate(delta: number) {if (!this.loading()) {this.page.update(value => Math.max(1, Math.min(this.pages(), value + delta))); this.load();}}
}

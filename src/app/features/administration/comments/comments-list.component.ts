import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AdminCommentsApiService, COMMENT_LABELS, COMMENT_STATES, CommentFilters, CommentPage, UUID_PATTERN } from './admin-comments-api.service';

@Component({selector: 'plus-comments-list', standalone: true, imports: [RouterLink, DatePipe, ReactiveFormsModule], templateUrl: './comments-list.component.html'})
export class CommentsListComponent {
  private readonly api = inject(AdminCommentsApiService);
  private readonly destroy = inject(DestroyRef);
  private request?: Subscription;
  private revision = 0;
  readonly labels = COMMENT_LABELS;
  readonly states = COMMENT_STATES;
  readonly form = inject(FormBuilder).nonNullable.group({estado_moderacion: '', caso: ['', Validators.pattern(UUID_PATTERN)]});
  readonly applied = signal<CommentFilters>({estado_moderacion: '', caso: ''});
  readonly data = signal<CommentPage | null>(null);
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly pages = computed(() => Math.max(1, Math.ceil((this.data()?.count ?? 0) / this.pageSize)));
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    inject(ActivatedRoute).queryParamMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params => {
      this.form.reset({estado_moderacion: '', caso: params.get('caso') ?? ''});
      this.apply();
    });
  }
  apply() {
    this.form.controls.caso.setValue(this.form.controls.caso.value.trim());
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      ++this.revision; this.request?.unsubscribe(); this.loading.set(false); this.data.set(null);
      this.error.set('El filtro de caso debe ser su identificador UUID. Puedes abrir la cola desde un expediente o limpiar el filtro.');
      return;
    }
    this.applied.set(this.form.getRawValue()); this.page.set(1); this.form.markAsPristine(); this.load();
  }
  load() {
    const revision = ++this.revision;
    this.request?.unsubscribe(); this.loading.set(true); this.error.set('');
    this.request = this.api.list(this.applied(), this.page(), this.pageSize).pipe(
      takeUntilDestroyed(this.destroy), finalize(() => {if (revision === this.revision) this.loading.set(false);}),
    ).subscribe({
      next: value => {if (revision === this.revision) this.data.set(value);},
      error: error => {
        if (revision !== this.revision) return;
        if (error instanceof HttpErrorResponse && error.status === 404 && this.page() > 1) {this.page.set(1); this.load(); return;}
        this.error.set(apiErrorMessage(error));
      },
    });
  }
  reset() {this.form.reset({estado_moderacion: '', caso: ''}); this.apply();}
  navigate(delta: number) {
    if (this.loading()) return;
    this.page.update(page => Math.max(1, Math.min(this.pages(), page + delta))); this.load();
  }
}

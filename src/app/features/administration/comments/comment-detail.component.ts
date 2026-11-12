import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { canAccessAdminSection } from '../../../core/auth/admin-access.policy';
import { AdminComment, AdminCommentsApiService, COMMENT_LABELS, COMMENT_STATES, CommentDecision, CommentHistoryItem, CommentState } from './admin-comments-api.service';

interface DecisionReview {id: string; caseCode: string; previous: CommentState; payload: CommentDecision}

@Component({selector: 'plus-comment-detail', standalone: true, imports: [RouterLink, DatePipe, ReactiveFormsModule], templateUrl: './comment-detail.component.html'})
export class CommentDetailComponent {
  private readonly api = inject(AdminCommentsApiService);
  private readonly auth = inject(AuthService);
  private readonly destroy = inject(DestroyRef);
  private request?: Subscription;
  private revision = 0;
  readonly id = signal('');
  readonly row = signal<AdminComment | null>(null);
  readonly history=signal<CommentHistoryItem[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly status = signal('');
  readonly uncertain = signal(false);
  readonly review = signal<DecisionReview | null>(null);
  readonly labels = COMMENT_LABELS;
  readonly canModerate = computed(() => canAccessAdminSection(this.auth.user(), 'comments'));
  readonly actions = computed(() => {
    const state = this.row()?.estado_moderacion;
    return this.canModerate() && state && COMMENT_STATES.includes(state) ? COMMENT_STATES.filter(value => value !== state) : [];
  });
  readonly form = inject(FormBuilder).nonNullable.group({reason: ['', Validators.maxLength(2000)], notifyReason: false});

  constructor() {
    inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params => {
      this.id.set(params.get('id') ?? ''); this.row.set(null); this.review.set(null); this.form.reset();
      this.status.set(''); this.uncertain.set(false); this.saving.set(false); this.load();
    });
  }
  load() {
    if (this.saving()) return;
    const revision = ++this.revision;
    this.request?.unsubscribe(); this.review.set(null); this.loading.set(true); this.error.set('');
    this.request = forkJoin({comment:this.api.get(this.id()),history:this.api.history(this.id())}).pipe(
      takeUntilDestroyed(this.destroy), finalize(() => {if (revision === this.revision) this.loading.set(false);}),
    ).subscribe({next: value => {
      if (revision !== this.revision) return;
      this.row.set(value.comment);this.history.set(value.history.results??value.history.history??[]); this.uncertain.set(false);
    }, error: error => {if (revision === this.revision) this.error.set(apiErrorMessage(error));}});
  }
  begin(target: CommentState) {
    const row = this.row();
    if (!row || this.loading() || this.error() || this.saving() || this.uncertain() || this.review() || !this.actions().includes(target)) return;
    this.form.markAllAsTouched(); const reason = this.form.controls.reason.value.trim();
    if (this.form.invalid || (target !== 'aprobado' && reason.length < 10) || (this.form.controls.notifyReason.value && !reason)) {
      this.status.set('Escribe un motivo de 10 a 2000 caracteres para rechazar, ocultar o devolver a revisión. Para compartir un motivo debes escribirlo.'); return;
    }
    this.status.set('');
    this.review.set({id: row.id_comentario, caseCode: row.caso_codigo, previous: row.estado_moderacion, payload: {estado_moderacion: target, motivo: reason, notificar_motivo: this.form.controls.notifyReason.value}});
    if (typeof document !== 'undefined') setTimeout(() => document.getElementById('comment-decision')?.focus(), 0);
  }
  cancel() {if (!this.saving()) this.review.set(null);}
  confirm() {
    const decision = this.review();
    if (!decision || this.saving() || this.uncertain() || this.loading() || this.error() || !this.canModerate() || this.row()?.id_comentario !== decision.id) return;
    const revision = this.revision;
    this.saving.set(true); this.status.set('');
    this.api.moderate(decision.id, {...decision.payload}).pipe(
      takeUntilDestroyed(this.destroy), finalize(() => {if (revision === this.revision) this.saving.set(false);}),
    ).subscribe({next: () => {
      if (revision !== this.revision) return;
      this.saving.set(false); this.review.set(null); this.form.reset(); this.status.set('Decisión guardada. Consultando el estado del comentario…'); this.load();
    }, error: error => {
      if (revision !== this.revision) return;
      this.review.set(null);
      const uncertain = error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500);
      this.uncertain.set(uncertain);
      this.status.set(uncertain ? 'No se pudo confirmar el resultado. Actualiza y revisa el estado y la auditoría antes de realizar otra acción.' : apiErrorMessage(error));
    }});
  }
}

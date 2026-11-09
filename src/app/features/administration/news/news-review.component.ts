import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditorialNewsDemoService } from './services/editorial-news-demo.service';
import { EDITORIAL_LABELS, EditorialState } from './data/editorial-news.demo';
import { EditorialPreviewComponent } from './components/editorial-preview.component';

@Component({selector: 'plus-news-review', standalone: true, imports: [RouterLink, DatePipe, ReactiveFormsModule, EditorialPreviewComponent], templateUrl: './news-review.component.html'})
export class NewsReviewComponent {
  readonly store = inject(EditorialNewsDemoService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  private readonly query = toSignal(this.route.queryParamMap, {initialValue: this.route.snapshot.queryParamMap});
  readonly id = computed(() => this.params().get('id') ?? '');
  readonly record = computed(() => this.store.find(this.id()));
  readonly labels = EDITORIAL_LABELS;
  readonly pending = signal<EditorialState | null>(null);
  readonly status = signal('');
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly rejection = this.builder.group({reason: ['', [Validators.required, Validators.pattern(/\S/), Validators.minLength(10), Validators.maxLength(2000)]]});
  constructor() {effect(() => {this.id(); const result = this.query().get('resultado'); this.pending.set(null); this.rejection.reset(); this.status.set(result === 'guardado' ? 'Borrador guardado en memoria. No se publicó ninguna noticia.' : '');}, {allowSignalWrites: true});}
  confirm() {
    const target = this.pending(); if (!target) return;
    if (target === 'rechazada') {this.rejection.markAllAsTouched(); if (this.rejection.invalid || this.rejection.controls.reason.value.trim().length < 10) {this.status.set('Explica el rechazo con entre 10 y 2000 caracteres.'); return;}}
    if (!this.store.transition(this.id(), target, this.rejection.controls.reason.value)) {this.status.set('No se pudo aplicar esa transición al ejemplo. Revisa su estado y contenido.'); return;}
    this.pending.set(null); this.rejection.reset(); this.status.set('Estado actualizado solo en la demostración administrativa. El portal público no cambió.');
  }
  feature() {this.status.set(this.store.feature(this.id()) ? 'Destacado actualizado solo en este catálogo de ejemplo.' : 'Solo los ejemplos publicados pueden destacarse.');}
}

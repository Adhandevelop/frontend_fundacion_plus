import { Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EDITORIAL_CATEGORIES } from './data/editorial-news.demo';
import { EditorialNewsDemoService } from './services/editorial-news-demo.service';
import { EditorialPreviewComponent } from './components/editorial-preview.component';

@Component({selector: 'plus-news-editor', standalone: true, imports: [RouterLink, ReactiveFormsModule, EditorialPreviewComponent], templateUrl: './news-editor.component.html'})
export class NewsEditorComponent implements OnDestroy {
  readonly store = inject(EditorialNewsDemoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  readonly id = computed(() => this.params().get('id'));
  readonly record = computed(() => this.id() ? this.store.find(this.id()!) : null);
  readonly missing = computed(() => this.id() !== null && !this.record());
  readonly categories = EDITORIAL_CATEGORIES;
  readonly preview = signal(false);
  readonly status = signal('');
  private draftCover: string | null = null;
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly form = this.builder.group({title: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]], slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), Validators.maxLength(220)]], category: ['', Validators.required], summary: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(1000)]], body: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(30000)]], imageUrl: [''], imageAlt: ['', Validators.maxLength(250)]});
  constructor() {effect(() => {const row = this.record(); this.releaseDraft(); this.form.reset({title: row?.title ?? '', slug: row?.slug ?? '', category: row?.category ?? '', summary: row?.summary ?? '', body: row?.body ?? '', imageUrl: row?.imageUrl ?? '', imageAlt: row?.imageAlt ?? ''}); this.preview.set(false); this.status.set('');}, {allowSignalWrites: true});}
  generateSlug() {this.form.controls.slug.setValue(this.form.controls.title.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 220).replace(/-$/, '')); this.form.controls.slug.markAsDirty();}
  selectCover(event: Event) {
    const input = event.target as HTMLInputElement; const file = input.files?.[0]; input.value = ''; if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {this.status.set('Selecciona JPG, PNG o WebP de hasta 5 MB para esta previsualización local.'); return;}
    this.releaseDraft(); this.draftCover = URL.createObjectURL(file); this.form.controls.imageUrl.setValue(this.draftCover); this.form.markAsDirty(); this.status.set('Portada seleccionada en esta pestaña. Añade un texto alternativo. No se ha subido.');
  }
  removeCover() {this.releaseDraft(); this.form.patchValue({imageUrl: '', imageAlt: ''}); this.form.markAsDirty();}
  save() {
    this.form.markAllAsTouched(); const value = this.form.getRawValue();
    if (this.missing() || this.form.invalid || value.imageUrl && !value.imageAlt.trim()) {this.status.set('Revisa los campos obligatorios, sus límites y el texto alternativo de la portada.'); return;}
    const result = this.store.save(value, this.id() ?? undefined);
    if (!result.ok) {this.status.set(result.error === 'duplicate' ? 'Ese slug ya existe en el catálogo editorial de ejemplo.' : 'No se pudo guardar. Revisa los campos del borrador.'); return;}
    this.draftCover = null;
    void this.router.navigate(['/admin/noticias', result.id], {queryParams: {resultado: 'guardado'}});
  }
  ngOnDestroy() {this.releaseDraft();}
  private releaseDraft() {if (this.draftCover) {URL.revokeObjectURL(this.draftCover); this.draftCover = null;}}
}

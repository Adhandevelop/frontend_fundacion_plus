import { Component, ElementRef, Injector, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InitiativeMediaDemoService } from './services/initiative-media-demo.service';
import { InitiativeMediaDemo, initiativeFileKind } from './data/initiative-media.demo';

@Component({selector: 'plus-initiative-media', standalone: true, imports: [RouterLink, ReactiveFormsModule, DecimalPipe], templateUrl: './initiative-media.component.html'})
export class InitiativeMediaComponent {
  readonly store = inject(InitiativeMediaDemoService);
  private readonly injector = inject(Injector);
  private readonly editor = viewChild<ElementRef<HTMLElement>>('mediaEditor');
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  readonly programId = computed(() => this.params().get('programId') ?? ''); readonly editionId = computed(() => this.params().get('editionId'));
  readonly valid = computed(() => this.store.validScope(this.programId(),this.editionId()));
  readonly program = computed(() => this.store.initiatives.program(this.programId())); readonly edition = computed(() => this.editionId() ? this.store.initiatives.edition(this.programId(),this.editionId()!) : null);
  readonly back = computed(() => this.editionId() ? ['/admin/iniciativas',this.programId(),'ediciones',this.editionId()] : ['/admin/iniciativas',this.programId()]);
  readonly kind = signal(''); readonly query = signal(''); readonly status = signal('');
  readonly rows = computed(() => {
    const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return this.store.scoped(this.programId(),this.editionId()).filter(row => (!this.kind() || row.kind === this.kind()) && normalize(`${row.name} ${row.alt} ${row.description}`).includes(normalize(this.query().trim())));
  });
  readonly selectedFile = signal<File | null>(null); readonly editing = signal<string | null>(null); readonly removing = signal<string | null>(null);
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly form = this.builder.group({alt: ['', Validators.maxLength(250)], description: [''], order: [0, [Validators.required, Validators.min(0), Validators.max(2147483647), Validators.pattern(/^\d+$/)]]});
  constructor() {effect(() => {this.programId(); this.editionId(); this.resetEditor(); this.kind.set(''); this.query.set(''); this.removing.set(null); this.status.set('');}, {allowSignalWrites: true});}
  select(event: Event) {const input = event.target as HTMLInputElement; const file = input.files?.[0]; input.value = ''; if (!file) return; if (!initiativeFileKind(file)) {this.status.set('Archivo no admitido: revisa formato, extensión, tipo y tamaño.'); return;} this.selectedFile.set(file); this.status.set('Archivo seleccionado. Completa los metadatos y añádelo a la galería temporal.');}
  edit(row: InitiativeMediaDemo) {this.editing.set(row.id); this.selectedFile.set(null); this.form.reset({alt: row.alt, description: row.description, order: row.order}); this.status.set('Metadatos cargados en el formulario.'); afterNextRender(() => this.editor()?.nativeElement.focus(), {injector: this.injector});}
  resetEditor() {this.editing.set(null); this.selectedFile.set(null); this.form.reset();}
  save() {
    this.form.markAllAsTouched(); const meta = this.form.getRawValue(); const id = this.editing(); const file = this.selectedFile();
    if (this.form.invalid || !this.valid()) {this.status.set('Revisa metadatos y orden entero no negativo.'); return;}
    const ok = id ? this.store.edit(this.programId(),this.editionId(),id,meta) : Boolean(file && this.store.add(this.programId(),this.editionId(),file,meta));
    if (!ok) {this.status.set('Selecciona un archivo válido y añade texto alternativo si es una imagen.'); return;}
    this.resetEditor(); this.status.set('Galería temporal actualizada. No se subieron ni publicaron archivos.');
  }
  cover(id: string) {this.status.set(this.store.setCover(this.programId(),this.editionId(),id) ? 'Portada de ejemplo actualizada solo para este ámbito.' : 'Solo una imagen de este ámbito puede ser portada.');}
  remove() {const id = this.removing(); if (!id) return; const ok = this.store.remove(this.programId(),this.editionId(),id); if (this.editing() === id) this.resetEditor(); this.removing.set(null); this.status.set(ok ? 'Medio retirado de la galería temporal.' : 'No se encontró el medio en este ámbito.');}
}

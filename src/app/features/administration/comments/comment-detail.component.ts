import { Component, ElementRef, Injector, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommentModerationDemoService } from './services/comment-moderation-demo.service';
import { COMMENT_LABELS, CommentState, commentActions } from './data/comments.demo';

@Component({selector:'plus-comment-detail',standalone:true,imports:[RouterLink,DatePipe,ReactiveFormsModule],templateUrl:'./comment-detail.component.html'})
export class CommentDetailComponent {
  readonly store = inject(CommentModerationDemoService);
  private readonly route = inject(ActivatedRoute); private readonly injector = inject(Injector);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('decisionPanel');
  private readonly params = toSignal(this.route.paramMap,{initialValue:this.route.snapshot.paramMap});
  readonly id = computed(() => this.params().get('id') ?? ''); readonly row = computed(() => this.store.find(this.id()));
  readonly actions = computed(() => this.row() ? commentActions(this.row()!.state) : []);
  readonly preview = computed(() => {const row=this.row();return row ? this.store.publicPreview(row.caseCode).find(item => item.id === row.id) ?? null : null;});
  readonly labels = COMMENT_LABELS; readonly pending = signal<CommentState | null>(null); readonly status = signal('');
  private revisionAtOpen = 0; private trigger: HTMLElement | null = null;
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly form = this.builder.group({reason:['',Validators.maxLength(2000)]});
  constructor() {effect(() => {this.id();this.pending.set(null);this.form.reset();this.status.set('');},{allowSignalWrites:true});}
  actionLabel(state:CommentState) {return state === 'aprobado' ? 'Aprobar ejemplo' : state === 'rechazado' ? 'Rechazar ejemplo' : state === 'oculto' ? 'Ocultar ejemplo aprobado' : 'Volver a revisión pendiente';}
  begin(target:CommentState,event:Event) {const row=this.row();if(!row)return;this.trigger=event.currentTarget as HTMLElement|null;this.revisionAtOpen=row.revision;this.pending.set(target);this.form.reset();this.status.set('');afterNextRender(() => this.panel()?.nativeElement.focus(),{injector:this.injector});}
  cancel() {this.pending.set(null);this.trigger?.focus();}
  confirm() {
    const target=this.pending();if(!target)return;this.form.markAllAsTouched();const reason=this.form.controls.reason.value;
    if(this.form.invalid || target !== 'aprobado' && reason.trim().length < 10){this.status.set('Explica la decisión con entre 10 y 2000 caracteres. La nota de aprobación es opcional.');return;}
    const result=this.store.moderate(this.id(),target,reason,this.revisionAtOpen);
    if(!result.ok){this.status.set(result.error === 'conflict' ? 'El comentario cambió desde que abriste la acción. Cancela y vuelve a revisar su estado.' : 'No se pudo aplicar la decisión. Revisa estado y motivo.');return;}
    this.pending.set(null);this.form.reset();this.status.set('Decisión guardada en memoria. No se publicó contenido ni se notificó al autor.');
  }
}

import { DatePipe } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DemoAudience, DemoMessage } from '../data/case-workspace.demo';

@Component({
  selector: 'plus-case-demo-messages', standalone: true, imports: [ReactiveFormsModule, DatePipe],
  template: `<section class="dossier-panel space-y-5"><h2 class="text-headline-sm">Conversación privada de ejemplo</h2><p class="text-body-sm">Estos mensajes de demostración no aparecen en la ficha pública.</p><div class="space-y-3 max-h-[450px] overflow-y-auto" aria-label="Conversación del caso">@for(item of items();track item.id){<article class="rounded-xl border border-slate-400/30 p-4" [class.dossier-own-message]="item.sender === audience()"><p class="text-label-sm font-semibold">{{item.sender === 'admin' ? 'Equipo PLUS · Ejemplo' : 'Ciudadano · Ejemplo'}} · {{item.date | date:'dd/MM/yyyy HH:mm':'-0500'}}</p><p class="text-body-sm mt-2 whitespace-pre-wrap break-words">{{item.text}}</p></article>}</div><form [formGroup]="form" (ngSubmit)="submit()" class="space-y-3"><label class="dossier-field">Mensaje<textarea formControlName="text" rows="4" maxlength="2000" aria-describedby="message-demo-help"></textarea></label><p id="message-demo-help" class="text-body-sm">Se añade únicamente a la conversación en memoria. No se envía a ninguna persona.</p><button type="submit" class="dossier-primary">Añadir mensaje de ejemplo</button><p role="status" class="text-body-sm">{{status()}}</p></form></section>`,
})
export class CaseMessagesComponent {
  readonly items = input.required<readonly DemoMessage[]>();
  readonly audience = input.required<DemoAudience>();
  readonly add = output<string>();
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly form = this.builder.group({text: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(2000)]]});
  readonly status = signal('');
  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {this.status.set('Escribe un mensaje de hasta 2000 caracteres.'); return;}
    this.add.emit(this.form.controls.text.value.trim()); this.form.reset(); this.status.set('Mensaje añadido a la demostración. No se ha enviado.');
  }
}

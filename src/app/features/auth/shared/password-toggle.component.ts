import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'plus-password-toggle',
  standalone: true,
  host: {class: 'absolute inset-y-0 right-0 flex items-center'},
  template: `<button type="button" class="h-full min-w-11 px-3 flex items-center justify-center" [attr.aria-label]="visible() ? 'Ocultar contraseña' : 'Mostrar contraseña'" [attr.aria-controls]="target().id" [attr.aria-pressed]="visible()" (click)="toggle()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>@if(visible()){<path d="M3 3l18 18"/>}</svg></button>`,
})
export class PasswordToggleComponent {
  readonly target = input.required<HTMLInputElement>();
  readonly visible = signal(false);
  toggle() {
    this.visible.update(value => !value);
    this.target().type = this.visible() ? 'text' : 'password';
  }
}

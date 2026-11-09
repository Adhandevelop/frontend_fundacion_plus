import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'plus-password-toggle',
  standalone: true,
  host: {class: 'absolute inset-y-0 right-0 flex items-center'},
  template: `<button type="button" class="h-full px-3 flex items-center justify-center" [attr.aria-label]="visible() ? 'Ocultar contraseña' : 'Mostrar contraseña'" [attr.aria-pressed]="visible()" (click)="toggle()"><span class="material-symbols-outlined text-[20px]" aria-hidden="true">{{ visible() ? 'visibility_off' : 'visibility' }}</span></button>`,
})
export class PasswordToggleComponent {
  readonly target = input.required<HTMLInputElement>();
  readonly visible = signal(false);
  toggle() {
    this.visible.update(value => !value);
    this.target().type = this.visible() ? 'text' : 'password';
  }
}

import { Component, input, output } from '@angular/core';

@Component({
  selector: 'plus-intake-stepper', standalone: true,
  template: `<nav aria-label="Pasos de radicación" class="py-5 overflow-x-auto"><ol class="flex justify-between gap-4 min-w-[660px]">@for(label of labels; track $index) {<li class="flex-1 text-center"><button type="button" (click)="selectStep.emit($index+1)" [attr.aria-current]="step() === $index+1 ? 'step' : null" class="flex flex-col items-center gap-2 w-full"><span class="w-10 h-10 rounded-full border-2 border-yellow-400 flex items-center justify-center font-bold" [class.bg-primary-container]="step() >= $index+1" [class.text-black]="step() >= $index+1">{{ $index+1 }}</span><span class="text-body-sm">{{ label }}</span></button></li>}</ol></nav>`,
})
export class IntakeStepperComponent {
  readonly labels = ['Tipo de caso', 'Información básica', 'Ubicación territorial', 'Evidencias y anexos', 'Confirmación'];
  readonly step = input.required<number>();
  readonly selectStep = output<number>();
}

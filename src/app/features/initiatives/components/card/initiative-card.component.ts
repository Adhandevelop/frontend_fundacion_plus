import { Component, input, output } from '@angular/core';
import { InitiativeDemo } from '../../data/initiatives.demo';

@Component({selector: 'plus-initiative-card', standalone: true, templateUrl: './initiative-card.component.html'})
export class InitiativeCardComponent {
  readonly initiative = input.required<InitiativeDemo>();
  readonly gallery = output<InitiativeDemo>();
}

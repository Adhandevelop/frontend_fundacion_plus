import { Component, input, output } from '@angular/core';
import { InitiativeDemo } from '../../data/initiatives.demo';

@Component({selector:'plus-initiative-featured',standalone:true,templateUrl:'./featured.component.html'})
export class FeaturedInitiativeComponent {readonly initiative=input.required<InitiativeDemo>();readonly gallery=output<InitiativeDemo>();}

import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IntakeViewValue } from '../intake-view.model';
@Component({selector:'plus-intake-summary',standalone:true,imports:[DecimalPipe],templateUrl:'./intake-summary.component.html'})
export class IntakeSummaryComponent {readonly data=input.required<IntakeViewValue>();readonly files=input<readonly File[]>([]);readonly truth=input(false);readonly consent=input(false);readonly truthChanged=output<boolean>();readonly consentChanged=output<boolean>();readonly edit=output<number>();}

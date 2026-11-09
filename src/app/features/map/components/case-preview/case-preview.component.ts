import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({selector:'plus-map-case-preview',standalone:true,imports:[RouterLink],templateUrl:'./case-preview.component.html'})
export class MapCasePreviewComponent {
readonly dismiss = output<void>();
readonly dismissible = input(true);
}

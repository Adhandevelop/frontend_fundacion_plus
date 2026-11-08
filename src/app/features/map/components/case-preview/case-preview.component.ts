import { Component, input, output } from '@angular/core';

@Component({selector:'plus-map-case-preview',standalone:true,templateUrl:'./case-preview.component.html'})
export class MapCasePreviewComponent {
readonly dismiss = output<void>();
readonly dismissible = input(true);
}

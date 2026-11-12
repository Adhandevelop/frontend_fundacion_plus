import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapCanvasComponent } from '../../../map/components/canvas/canvas.component';

@Component({selector:'plus-case-map', standalone:true, imports:[RouterLink,MapCanvasComponent], templateUrl:'./case-map.component.html'})
export class CaseMapComponent {  }

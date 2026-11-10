import { Component, signal, inject, input } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme.service';
import { MapCasePreviewComponent } from '../case-preview/case-preview.component';
@Component({selector:'plus-map-canvas',standalone:true,imports:[MapCasePreviewComponent],templateUrl:'./canvas.component.html'})
export class MapCanvasComponent {
readonly caseRoute = input('/casos/PLUS-2025-084');
readonly theme = inject(ThemeService);
 readonly popupOpen = signal(true);
 readonly zoom = signal(1);
 changeZoom(delta:number) { this.zoom.update(value => Math.min(2,Math.max(1,value+delta))); }
}

import { Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { MapFiltersComponent } from './components/filters/filters.component';
import { MapCanvasComponent } from './components/canvas/canvas.component';
import { MapCasePreviewComponent } from './components/case-preview/case-preview.component';
@Component({selector:'plus-public-map',standalone:true,imports:[MapFiltersComponent,MapCanvasComponent,MapCasePreviewComponent],templateUrl:'./public-map.component.html',styleUrl:'./public-map.component.css',encapsulation:ViewEncapsulation.None})
export class PublicMapComponent {
 readonly view=signal<'map'|'list'>('map');
 readonly search=signal('');
 readonly matchesSearch=computed(()=> 'plus-2025-084 rehabilitación de vía terciaria vereda el porvenir riosucio chocó'.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(this.search().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')));
}

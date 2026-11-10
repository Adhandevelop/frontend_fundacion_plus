import { Component, computed, inject, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MapFiltersComponent } from './components/filters/filters.component';
import { MapCanvasComponent } from './components/canvas/canvas.component';
import { MapCasePreviewComponent } from './components/case-preview/case-preview.component';
@Component({selector:'plus-public-map',standalone:true,imports:[RouterLink,MapFiltersComponent,MapCanvasComponent,MapCasePreviewComponent],templateUrl:'./public-map.component.html',styleUrl:'./public-map.component.css',encapsulation:ViewEncapsulation.None})
export class PublicMapComponent {
 private readonly route=inject(ActivatedRoute);
 readonly context=(this.route.snapshot.data['mapContext'] ?? 'public') as 'public'|'citizen'|'admin';
 readonly primaryRoute=this.context==='admin'?'/admin/casos':'/ciudadano/casos/nuevo';
 readonly primaryLabel=this.context==='admin'?'Gestionar casos':'+ Registrar nuevo caso';
 readonly caseRoute=this.context==='admin'?'/admin/casos/PLUS-2025-084':this.context==='citizen'?'/ciudadano/casos/PLUS-2025-084':'/casos/PLUS-2025-084';
 readonly view=signal<'map'|'list'>('map');
 readonly search=signal('');
 readonly matchesSearch=computed(()=> 'plus-2025-084 rehabilitación de vía terciaria vereda el porvenir riosucio chocó'.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(this.search().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')));
}

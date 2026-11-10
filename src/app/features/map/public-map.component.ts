import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MapFiltersComponent } from './components/filters/filters.component';
import { MapCanvasComponent } from './components/canvas/canvas.component';
@Component({selector:'plus-public-map',standalone:true,imports:[RouterLink,MapFiltersComponent,MapCanvasComponent],templateUrl:'./public-map.component.html',styleUrl:'./public-map.component.css',encapsulation:ViewEncapsulation.None})
export class PublicMapComponent {
 private readonly route=inject(ActivatedRoute);
 readonly context=(this.route.snapshot.data['mapContext'] ?? 'public') as 'public'|'citizen'|'admin';
 readonly primaryRoute=this.context==='admin'?'/admin/casos':'/ciudadano/casos/nuevo';
 readonly primaryLabel=this.context==='admin'?'Gestionar casos':'+ Registrar nuevo caso';
 readonly view=signal<'map'|'list'>('map');
 readonly search=signal('');
}

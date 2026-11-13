import { Component, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {finalize} from 'rxjs';
import {apiErrorMessage} from '../../core/api/api-error';
import { MapFiltersComponent } from './components/filters/filters.component';
import { MapCanvasComponent } from './components/canvas/canvas.component';
import {MapCasesApiService} from './map-cases-api.service';
import {PublicCaseMapFeature, PublicCaseMapFilters} from './map-cases.models';
@Component({selector:'plus-public-map',standalone:true,imports:[RouterLink,MapFiltersComponent,MapCanvasComponent],templateUrl:'./public-map.component.html',styleUrl:'./public-map.component.css',encapsulation:ViewEncapsulation.None})
export class PublicMapComponent {
 private readonly route=inject(ActivatedRoute);
 private readonly api=inject(MapCasesApiService);
 private readonly destroy=inject(DestroyRef);
 readonly context=(this.route.snapshot.data['mapContext'] ?? 'public') as 'public'|'citizen'|'admin';
 readonly primaryRoute=this.context==='admin'?'/admin/casos':'/ciudadano/casos/nuevo';
 readonly primaryLabel=this.context==='admin'?'Gestionar casos':'+ Registrar nuevo caso';
 readonly view=signal<'map'|'list'>('map');
 readonly search=signal('');
 readonly features=signal<PublicCaseMapFeature[]>([]);
 readonly selected=signal<PublicCaseMapFeature|null>(null);
 readonly loading=signal(false);
 readonly error=signal('');
 readonly activeFilters=signal<PublicCaseMapFilters>({});
 private requestRevision=0;
 constructor(){this.loadCases();}
 loadCases(){
  const revision=++this.requestRevision;
  this.loading.set(true);this.error.set('');this.selected.set(null);
  this.api.geojson({...this.activeFilters(),search:this.search()}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{if(revision===this.requestRevision)this.loading.set(false);})).subscribe({
   next:value=>{if(revision===this.requestRevision)this.features.set(value.features);},
   error:error=>{if(revision===this.requestRevision){this.features.set([]);this.error.set(apiErrorMessage(error));}},
  });
 }
 clearSearch(){this.search.set('');this.loadCases();}
 applyFilters(filters:PublicCaseMapFilters){this.activeFilters.set(filters);this.loadCases();}
 selectCase(feature:PublicCaseMapFeature){this.selected.set(feature);}
 caseRoute(feature:PublicCaseMapFeature){
  const code=feature.properties.codigo||feature.properties.radicado_code;
  if(this.context==='admin')return ['/admin/casos',code];
  if(this.context==='public')return ['/casos',code];
  return null;
 }
}

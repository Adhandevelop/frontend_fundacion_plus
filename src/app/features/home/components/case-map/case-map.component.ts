import {Component, DestroyRef, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MapCanvasComponent } from '../../../map/components/canvas/canvas.component';
import {MapCasesApiService} from '../../../map/map-cases-api.service';
import {PublicCaseMapFeature} from '../../../map/map-cases.models';

@Component({selector:'plus-case-map', standalone:true, imports:[RouterLink,MapCanvasComponent], templateUrl:'./case-map.component.html'})
export class CaseMapComponent {
 private readonly api=inject(MapCasesApiService);private readonly destroy=inject(DestroyRef);
 readonly features=signal<PublicCaseMapFeature[]>([]);readonly mapUnavailable=signal(false);
 constructor(){this.api.geojson().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>this.features.set(value.features),error:()=>this.mapUnavailable.set(true)});}
}

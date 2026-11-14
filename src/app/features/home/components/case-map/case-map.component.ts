import {Component, computed, DestroyRef, ElementRef, inject, signal, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MapCanvasComponent } from '../../../map/components/canvas/canvas.component';
import {MapCasesApiService} from '../../../map/map-cases-api.service';
import {PublicCaseMapFeature} from '../../../map/map-cases.models';

@Component({selector:'plus-case-map', standalone:true, imports:[RouterLink,MapCanvasComponent], templateUrl:'./case-map.component.html'})
export class CaseMapComponent {
 @ViewChild('caseCards') private readonly caseCards?:ElementRef<HTMLDivElement>;
 private readonly api=inject(MapCasesApiService);private readonly destroy=inject(DestroyRef);
 readonly features=signal<PublicCaseMapFeature[]>([]);readonly selected=signal<PublicCaseMapFeature|null>(null);readonly mapUnavailable=signal(false);
 readonly previewFeatures=computed(()=>this.features().slice(0,7));
 constructor(){this.api.geojson().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>this.features.set(value.features),error:()=>this.mapUnavailable.set(true)});}
 select(feature:PublicCaseMapFeature){this.selected.set(feature);}
 scrollCards(direction:-1|1){const element=this.caseCards?.nativeElement;if(!element)return;element.scrollBy({left:direction*Math.max(280,element.clientWidth*.8),behavior:'smooth'});}
}

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HomepageApiService, homepageImageUrl, PublicHomepage } from '../../../../core/api/homepage-api.service';
import { RouterLink } from '@angular/router';

@Component({selector:'plus-hero', standalone:true, imports:[RouterLink], templateUrl:'./hero.component.html'})
export class HeroComponent {
  private readonly api=inject(HomepageApiService);
  private readonly destroy=inject(DestroyRef);
  readonly home=signal<PublicHomepage|null>(null);
  readonly loaded=signal(false);

  constructor(){
    this.api.publicHome().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next:value=>{this.home.set(value);this.loaded.set(true);},
      error:()=>this.loaded.set(true)
    });
  }

  image(){return homepageImageUrl(this.home()?.institution);}
  alt(){return this.home()?.institution?.alt_text||'Fotografía ilustrativa de la Corporación PLUS';}
  representativeName(){return this.home()?.institution?.representative_name||'JUAN DAVID MARTINEZ BOLAÑO';}
}

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HomepageApiService, homepageImageUrl, PublicHomepage } from '../../../../core/api/homepage-api.service';

import { RouterLink } from '@angular/router';
@Component({selector:'plus-hero', standalone:true, imports:[RouterLink], templateUrl:'./hero.component.html'})
export class HeroComponent {
 private readonly api=inject(HomepageApiService);private readonly destroy=inject(DestroyRef);
 readonly home=signal<PublicHomepage|null>(null);readonly loaded=signal(false);
 readonly fallbackImage='https://lh3.googleusercontent.com/aida-public/AB6AXuAeivQ1NOrLY1wXuIV65Yxnu3W0viToVqFKH2WYC1NkQgAA0JWB3XDzIlfgvqi48CISlKVKrhbcA6T1A05vyW4ngwN1yRC-lAqU6y5Z4mFV2678EvPA_7LIANeeL9H6UoUfIQScaibQsqDqdgrEwpt6MNTSRPPO8GWmF6mRgdOjkmvrTbHMG767bZJzvaYI1LASc4V0R0CK3C6zZVUbBUPVbXV89JG6vbhlgF7l3Xhu54e5syfkD0lQGQ';
 constructor(){this.api.publicHome().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{this.home.set(value);this.loaded.set(true);},error:()=>this.loaded.set(true)});}
 image(){return homepageImageUrl(this.home()?.institution)||this.fallbackImage;}
 alt(){return this.home()?.institution.alt_text||'Fotografía ilustrativa de la Corporación PLUS';}
}

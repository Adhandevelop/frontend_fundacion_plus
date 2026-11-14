import { Component, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HomepageApiService, HomepageInstitution } from '../../../core/api/homepage-api.service';
import { AboutHeroComponent } from './components/hero/hero.component';
import { AboutRepresentativeComponent } from './components/representative/representative.component';
import { AboutIdentityComponent } from './components/identity/identity.component';
import { AboutWorkComponent } from './components/work/work.component';
import { AboutActivitiesComponent } from './components/activities/activities.component';
import { AboutContactComponent } from './components/contact/contact.component';
@Component({selector:'plus-about-page',standalone:true,imports:[AboutHeroComponent,AboutRepresentativeComponent,AboutIdentityComponent,AboutWorkComponent,AboutActivitiesComponent,AboutContactComponent],template:'<div class="editorial-page"><plus-about-hero [institution]="institution()"/><plus-about-representative [institution]="institution()"/><plus-about-identity [institution]="institution()"/><plus-about-work/><plus-about-activities/><plus-about-contact/></div>',styleUrl:'../../../shared/styles/editorial-pages.css',encapsulation:ViewEncapsulation.None})
export class AboutComponent {
  private readonly api=inject(HomepageApiService);private readonly destroy=inject(DestroyRef);
  readonly institution=signal<HomepageInstitution|null>(null);
  constructor(){this.api.publicHome().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>this.institution.set(value.institution)});}
}

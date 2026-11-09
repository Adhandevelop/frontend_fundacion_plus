import { Component, ViewEncapsulation } from '@angular/core';
import { AboutHeroComponent } from './components/hero/hero.component';
import { AboutRepresentativeComponent } from './components/representative/representative.component';
import { AboutIdentityComponent } from './components/identity/identity.component';
import { AboutWorkComponent } from './components/work/work.component';
import { AboutActivitiesComponent } from './components/activities/activities.component';
import { AboutContactComponent } from './components/contact/contact.component';
@Component({selector:'plus-about-page',standalone:true,imports:[AboutHeroComponent,AboutRepresentativeComponent,AboutIdentityComponent,AboutWorkComponent,AboutActivitiesComponent,AboutContactComponent],template:'<div class="editorial-page"><plus-about-hero/><plus-about-representative/><plus-about-identity/><plus-about-work/><plus-about-activities/><plus-about-contact/></div>',styleUrl:'../../../shared/styles/editorial-pages.css',encapsulation:ViewEncapsulation.None})
export class AboutComponent {}

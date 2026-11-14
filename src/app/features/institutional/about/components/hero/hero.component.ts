import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomepageInstitution } from '../../../../../core/api/homepage-api.service';
@Component({selector:'plus-about-hero',standalone:true,imports:[RouterLink],templateUrl:'./hero.component.html'})
export class AboutHeroComponent {readonly institution=input<HomepageInstitution|null>(null);}

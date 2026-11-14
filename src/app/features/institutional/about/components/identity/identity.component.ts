import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomepageInstitution } from '../../../../../core/api/homepage-api.service';
@Component({selector:'plus-about-identity',standalone:true,imports:[RouterLink],templateUrl:'./identity.component.html'})
export class AboutIdentityComponent {readonly institution=input<HomepageInstitution|null>(null);}

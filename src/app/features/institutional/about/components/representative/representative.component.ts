import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomepageInstitution, homepageImageUrl } from '../../../../../core/api/homepage-api.service';
@Component({selector:'plus-about-representative',standalone:true,imports:[RouterLink],templateUrl:'./representative.component.html'})
export class AboutRepresentativeComponent {
  readonly institution=input<HomepageInstitution|null>(null);
  readonly image=computed(()=>homepageImageUrl(this.institution()));
}

import { Component, output } from '@angular/core';

@Component({selector:'plus-initiative-featured',standalone:true,templateUrl:'./featured.component.html'})
export class FeaturedInitiativeComponent {readonly gallery=output<void>();openGallery(event:Event){event.preventDefault();this.gallery.emit();}}

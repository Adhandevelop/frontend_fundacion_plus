import { Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({selector:'plus-site-header', standalone:true, imports:[RouterLink, RouterLinkActive], templateUrl:'./site-header.component.html'})
export class SiteHeaderComponent { readonly theme = inject(ThemeService); readonly menuOpen = signal(false); }

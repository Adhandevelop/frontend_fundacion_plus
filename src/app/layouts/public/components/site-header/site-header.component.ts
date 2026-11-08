import { Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme.service';
@Component({selector:'plus-site-header', standalone:true, templateUrl:'./site-header.component.html'})
export class SiteHeaderComponent { readonly theme = inject(ThemeService); readonly menuOpen = signal(false); }

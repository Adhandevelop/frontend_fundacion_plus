import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeaderComponent } from './components/site-header/site-header.component';
import { SiteFooterComponent } from './components/site-footer/site-footer.component';
@Component({selector:'plus-public-layout',standalone:true,imports:[RouterOutlet,SiteHeaderComponent,SiteFooterComponent],template:`<a href="#main-content" class="sr-only focus:not-sr-only">Saltar al contenido</a><plus-site-header/><div class="bg-primary-container/20 text-on-surface dark:text-inverse-on-surface text-center text-body-sm px-4 py-2">Prototipo visual ? Contenido, im?genes y cifras de ejemplo del dise?o, pendientes de validaci?n.</div><main id="main-content"><router-outlet/></main><plus-site-footer/>`})
export class PublicLayoutComponent {}

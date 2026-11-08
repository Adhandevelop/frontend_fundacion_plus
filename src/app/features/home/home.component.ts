import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { CaseMapComponent } from './components/case-map/case-map.component';
import { InitiativesComponent } from './components/initiatives/initiatives.component';
import { NewsComponent } from './components/news/news.component';
@Component({selector:'plus-home',standalone:true,imports:[HeroComponent,CaseMapComponent,InitiativesComponent,NewsComponent],template:`<plus-hero/><plus-case-map/><plus-initiatives/><plus-news/>`})
export class HomeComponent {}
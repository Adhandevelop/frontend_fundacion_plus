import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public/public-layout.component';
export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {path: '', title: 'PLUS · Corporación Pluralismo Social', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)},
      {path: 'mapa', title: 'Mapa de casos comunitarios · PLUS', loadComponent: () => import('./features/map/public-map.component').then(m => m.PublicMapComponent)},
    ],
  },
  {path: '**', redirectTo: ''},
];

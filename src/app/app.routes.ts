import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public/public-layout.component';
export const routes: Routes = [{path:'',component:PublicLayoutComponent,children:[{path:'',loadComponent:()=>import('./features/home/home.component').then(m=>m.HomeComponent)}]},{path:'**',redirectTo:''}];

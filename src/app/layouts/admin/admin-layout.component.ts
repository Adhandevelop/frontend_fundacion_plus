import { Component, computed, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ResponsiveNavigationDirective } from '../../shared/navigation/responsive-navigation.directive';
import { NavigationIconComponent } from '../../shared/navigation/navigation-icon.component';
import { AdminSection, canAccessAdminSection } from '../../core/auth/admin-access.policy';

interface AdminNavigationItem {path:string;label:string;icon:string;section:AdminSection|null;exact:boolean}
const NAVIGATION:AdminNavigationItem[]=[
  {path:'/admin',label:'Dashboard general',icon:'dashboard',section:'dashboard',exact:true},
  {path:'/admin/casos',label:'Gestión de casos',icon:'folder_shared',section:'cases',exact:false},
  {path:'/admin/casos-asignados',label:'Casos asignados',icon:'assignment_ind',section:'cases',exact:false},
  {path:'/admin/mapa',label:'Mapa de casos',icon:'map',section:'map',exact:false},
  {path:'/admin/informes',label:'Informes de casos',icon:'bar_chart',section:'reports',exact:false},
  {path:'/admin/auditoria',label:'Auditoría',icon:'history',section:'audit',exact:false},
  {path:'/admin/usuarios',label:'Usuarios y permisos',icon:'manage_accounts',section:'users',exact:false},
  {path:'/admin/ambitos-responsables',label:'Ámbitos de responsables',icon:'rule_settings',section:'users',exact:false},
  {path:'/admin/comunidades',label:'Comunidades y territorios',icon:'location_city',section:'territories',exact:false},
  {path:'/admin/noticias',label:'Noticias',icon:'newspaper',section:'news',exact:false},
  {path:'/admin/iniciativas',label:'Iniciativas y ediciones',icon:'volunteer_activism',section:'initiatives',exact:false},
  {path:'/admin/postulaciones',label:'Postulaciones',icon:'inbox',section:'proposals',exact:false},
  {path:'/admin/comentarios',label:'Moderación de comentarios',icon:'forum',section:'comments',exact:false},
  {path:'/admin/formularios',label:'Formularios',icon:'description',section:'forms',exact:false},
  {path:'/admin/portada',label:'Fotografía de portada',icon:'image',section:'homepage',exact:false},
];

@Component({selector: 'plus-admin-layout', standalone: true, imports: [RouterLink, RouterLinkActive, RouterOutlet, ResponsiveNavigationDirective, NavigationIconComponent], templateUrl: './admin-layout.component.html', styleUrl: './admin-layout.component.css', encapsulation: ViewEncapsulation.None})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly menu = signal(false);
  readonly navigation = computed(() => NAVIGATION.filter(item => item.section === null || canAccessAdminSection(this.auth.user(), item.section)));
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEMO_ROLES } from './data/users.demo';

@Component({selector: 'plus-demo-roles-reference', standalone: true, imports: [RouterLink], template: `
  <div class="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
    <a routerLink="/admin/usuarios" class="text-body-sm underline underline-offset-4">Volver a usuarios</a>
    <header class="space-y-3"><p class="text-label-sm uppercase tracking-wider">Referencia funcional · Demostración</p><h1 class="text-headline-md">Roles y alcance previsto</h1><p class="text-body-sm">Estos perfiles proceden del contexto general de PLUS. Son descripciones de referencia; la matriz de permisos y sus restricciones deben acordarse con el backend.</p></header>
    <section class="admin-panel border rounded-xl p-5 space-y-4"><h2 class="text-title-md">Acceso público</h2><h3 class="text-title-sm">Visitante</h3><p class="text-body-sm">Explora contenido público. No se asigna este perfil a una cuenta en el directorio de demostración.</p></section>
    <section class="grid sm:grid-cols-2 gap-4" aria-label="Roles de usuarios registrados">@for(role of roles;track role.id){<article class="admin-panel border rounded-xl p-5 space-y-3 border-t-4 border-t-yellow-400"><h2 class="text-title-md">{{role.name}}</h2><p class="text-body-sm">{{role.description}}</p></article>}</section>
    <aside class="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-5 space-y-3 text-body-sm"><h2 class="text-title-sm">Definición de permisos pendiente</h2><p>Asignar roles en este prototipo no habilita ni restringe operaciones. La autorización real, las combinaciones de roles, el alcance territorial y los límites de administración requieren definición y validación del servidor.</p><p>No se ofrecen controles de permisos granulares ni reglas de escalamiento sin un contrato acordado.</p></aside>
  </div>
`})
export class RolesReferenceComponent {readonly roles = DEMO_ROLES;}

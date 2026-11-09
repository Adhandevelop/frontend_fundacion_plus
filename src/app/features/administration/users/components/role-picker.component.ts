import { Component, input, output } from '@angular/core';
import { DEMO_ROLES, DemoRoleId } from '../data/users.demo';

@Component({selector: 'plus-demo-role-picker', standalone: true, template: `
  <fieldset class="space-y-3" [attr.aria-describedby]="invalid() ? 'user-roles-error' : 'user-roles-help'">
    <legend class="text-title-md mb-3">Roles de referencia</legend>
    <p id="user-roles-help" class="text-body-sm">Selecciona al menos uno. Esta selección no concede permisos reales.</p>
    <div class="grid sm:grid-cols-2 gap-3">@for(role of roles;track role.id){
      <label class="flex items-start gap-3 rounded-lg border border-slate-400/50 p-4 cursor-pointer">
        <input type="checkbox" class="mt-1 shrink-0" [checked]="selected().includes(role.id)" (change)="toggle.emit(role.id)">
        <span><strong class="block text-title-sm">{{role.name}}</strong><span class="block text-body-sm mt-2">{{role.description}}</span></span>
      </label>
    }</div>
    @if(invalid()){<p id="user-roles-error" role="status" class="text-red-700 dark:text-red-300 text-body-sm">Selecciona al menos un rol de ejemplo.</p>}
  </fieldset>
`})
export class RolePickerComponent {
  readonly roles = DEMO_ROLES;
  readonly selected = input.required<readonly DemoRoleId[]>();
  readonly invalid = input(false);
  readonly toggle = output<DemoRoleId>();
}

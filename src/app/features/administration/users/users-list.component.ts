import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEMO_ROLES, DemoUserFilters, demoRoleName, filterDemoUsers } from './data/users.demo';
import { UsersDemoService } from './services/users-demo.service';

@Component({selector: 'plus-admin-users', standalone: true, imports: [RouterLink], templateUrl: './users-list.component.html'})
export class UsersListComponent {
  readonly store = inject(UsersDemoService);
  readonly roles = DEMO_ROLES;
  readonly roleName = demoRoleName;
  readonly filters = signal<DemoUserFilters>({query: '', role: '', state: ''});
  readonly filtered = computed(() => filterDemoUsers(this.store.users(), this.filters()));
  readonly page = signal(1);
  readonly pageSize = 5;
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  readonly visible = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize));
  readonly metrics = computed(() => [{label: 'Usuarios de la selección', value: this.filtered().length}, {label: 'Activos en el ejemplo', value: this.filtered().filter(user => user.active).length}, {label: 'Inactivos en el ejemplo', value: this.filtered().filter(user => !user.active).length}]);
  change(key: keyof DemoUserFilters, value: string) {this.filters.update(filters => ({...filters, [key]: value})); this.page.set(1);}
  reset() {this.filters.set({query: '', role: '', state: ''}); this.page.set(1);}
  navigate(delta: number) {this.page.update(page => Math.min(this.pages(), Math.max(1, page + delta)));}
}

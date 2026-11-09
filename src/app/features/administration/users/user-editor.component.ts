import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersDemoService } from './services/users-demo.service';
import { DemoRoleId } from './data/users.demo';
import { RolePickerComponent } from './components/role-picker.component';

@Component({selector: 'plus-demo-user-editor', standalone: true, imports: [RouterLink, ReactiveFormsModule, RolePickerComponent], templateUrl: './user-editor.component.html'})
export class UserEditorComponent {
  readonly store = inject(UsersDemoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});
  readonly id = computed(() => this.params().get('id'));
  readonly user = computed(() => this.id() ? this.store.find(this.id()!) : null);
  readonly missing = computed(() => this.id() !== null && this.user() === null);
  private readonly builder = inject(FormBuilder).nonNullable;
  readonly message = signal('');
  readonly form = this.builder.group({name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)]], email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]], roles: this.builder.control<readonly DemoRoleId[]>([], Validators.required)});
  constructor() {
    effect(() => {
      const user = this.user();
      this.form.reset({name: user?.name ?? '', email: user?.email ?? '', roles: user ? [...user.roles] : []});
      this.message.set('');
    }, {allowSignalWrites: true});
  }
  toggleRole(role: DemoRoleId) {
    const roles = this.form.controls.roles;
    roles.setValue(roles.value.includes(role) ? roles.value.filter(value => value !== role) : [...roles.value, role]);
    roles.markAsDirty(); roles.markAsTouched();
  }
  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.missing()) {this.message.set('Revisa el nombre, correo y roles de ejemplo.'); return;}
    const result = this.store.save(this.form.getRawValue(), this.id() ?? undefined);
    if (!result.ok) {this.message.set(result.error === 'duplicate' ? 'Ese correo ya está en el directorio de demostración. Utiliza otro correo de ejemplo.' : 'No se pudo guardar este ejemplo. Revisa los campos y el registro.'); return;}
    void this.router.navigate(['/admin/usuarios', result.id], {queryParams: {resultado: this.id() ? 'editado' : 'creado'}});
  }
}

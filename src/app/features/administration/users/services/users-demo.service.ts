import { Injectable, signal } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { DEMO_ROLES, DEMO_USERS, DemoUser, DemoUserInput } from '../data/users.demo';

type SaveResult = {ok: true; id: string} | {ok: false; error: 'invalid' | 'duplicate' | 'missing'};
@Injectable({providedIn: 'root'})
export class UsersDemoService {
  private sequence = 0;
  private readonly records = signal<readonly DemoUser[]>(DEMO_USERS.map(user => ({...user, roles: [...user.roles]})));
  readonly users = this.records.asReadonly();
  find(id: string) {return this.users().find(user => user.id === id) ?? null;}
  save(input: DemoUserInput, id?: string): SaveResult {
    const name = input.name.trim(); const email = input.email.trim();
    const roles = [...new Set(input.roles)];
    if (id !== undefined && !this.find(id)) return {ok: false, error: 'missing'};
    const emailControl = new FormControl(email, [Validators.required, Validators.email, Validators.maxLength(254)]);
    if (!name || name.length > 150 || emailControl.invalid || !roles.length || roles.some(id => !DEMO_ROLES.some(role => role.id === id))) return {ok: false, error: 'invalid'};
    if (this.users().some(user => user.id !== id && user.email.toLowerCase() === email.toLowerCase())) return {ok: false, error: 'duplicate'};
    if (id !== undefined) {
      this.records.update(users => users.map(user => user.id === id ? {...user, name, email, roles, modified: true} : user));
      return {ok: true, id};
    }
    const createdId = `local-${++this.sequence}`;
    this.records.update(users => [{id: createdId, name, email, roles, active: true, modified: true, origin: 'local'}, ...users]);
    return {ok: true, id: createdId};
  }
  setActive(id: string, active: boolean): boolean {
    if (!this.find(id)) return false;
    this.records.update(users => users.map(user => user.id === id ? {...user, active, modified: true} : user));
    return true;
  }
}

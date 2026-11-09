import { Injectable, signal } from '@angular/core';
import { COMMUNITIES_DEMO, COMMUNITY_TYPES, MUNICIPALITIES_DEMO, CommunityDemo, CommunityInput } from '../data/territories.demo';

type SaveResult = {ok: true; id: string} | {ok: false; error: 'missing' | 'invalid' | 'duplicate'};
@Injectable({providedIn: 'root'})
export class TerritoriesDemoService {
  private sequence = 0;
  private readonly rows = signal<readonly CommunityDemo[]>(COMMUNITIES_DEMO.map(row => ({...row})));
  readonly communities = this.rows.asReadonly();
  find(id: string) {return this.communities().find(row => row.id === id) ?? null;}
  save(input: CommunityInput, id?: string): SaveResult {
    if (id !== undefined && !this.find(id)) return {ok: false, error: 'missing'};
    const value = {...input, name: input.name.trim(), description: input.description.trim()};
    if (!value.name || value.name.length > 150 || !COMMUNITY_TYPES.includes(value.type) || !MUNICIPALITIES_DEMO.some(item => item.id === value.municipalityId)) return {ok: false, error: 'invalid'};
    if (this.communities().some(row => row.id !== id && row.municipalityId === value.municipalityId && row.type === value.type && row.name === value.name)) return {ok: false, error: 'duplicate'};
    if (id !== undefined) {this.rows.update(rows => rows.map(row => row.id === id ? {...row, ...value, modified: true} : row)); return {ok: true, id};}
    const createdId = `community-local-${++this.sequence}`;
    this.rows.update(rows => [{...value, id: createdId, active: true, modified: true, origin: 'local'}, ...rows]);
    return {ok: true, id: createdId};
  }
  setActive(id: string, active: boolean) {
    if (!this.find(id)) return false;
    this.rows.update(rows => rows.map(row => row.id === id ? {...row, active, modified: true} : row)); return true;
  }
}

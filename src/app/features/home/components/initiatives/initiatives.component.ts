import { Component, signal } from '@angular/core';

@Component({selector:'plus-initiatives', standalone:true, templateUrl:'./initiatives.component.html'})
export class InitiativesComponent { readonly current = signal(0); navigate(event: Event, index: number) { event.preventDefault(); this.select(index); document.getElementById('initiative-tab-' + this.current())?.focus(); } select(index: number) { this.current.set((index + 4) % 4); } }

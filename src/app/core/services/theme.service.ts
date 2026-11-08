import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
@Injectable({providedIn:'root'})
export class ThemeService {
 private readonly doc = inject(DOCUMENT);
 readonly dark = signal(false);
 constructor() { try { this.dark.set(localStorage.getItem('plus-theme') === 'dark'); } catch {} this.apply(); }
 toggle() { this.dark.update(value => !value); this.apply(); try {localStorage.setItem('plus-theme',this.dark() ? 'dark':'light');} catch {} }
 private apply() {this.doc.documentElement.classList.toggle('dark',this.dark());}
}

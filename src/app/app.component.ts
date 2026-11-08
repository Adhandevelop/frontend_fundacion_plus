import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({selector:'plus-root',standalone:true,imports:[RouterOutlet],template:`<router-outlet/>@if(pending()) {<div class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" (click)="close()"><section role="dialog" aria-modal="true" aria-labelledby="pending-title" class="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-6 max-w-md shadow-xl" (click)="$event.stopPropagation()"><h2 id="pending-title" class="text-headline-sm">Vista pendiente</h2><p class="my-4">Esta secci?n se implementar? con su dise?o correspondiente. Por ahora puedes explorar la p?gina principal.</p><button autofocus (click)="close()" class="bg-primary-container text-on-primary-fixed px-4 py-2 rounded-lg">Entendido</button></section></div>}`})
export class AppComponent {
 readonly pending = signal(false);
 private trigger: HTMLElement | null = null;
 @HostListener('click', ['$event']) onClick(event: MouseEvent) {const link = (event.target as HTMLElement).closest('a'); if(link?.getAttribute('href') === '#') {event.preventDefault();this.trigger=link;this.pending.set(true);setTimeout(()=>document.querySelector<HTMLButtonElement>('[role="dialog"] button')?.focus());}}
 @HostListener('document:keydown.escape') close() {if(this.pending()) {this.pending.set(false);this.trigger?.focus();}}
 @HostListener('document:keydown.tab', ['$event']) trap(event: Event) {if(this.pending()) {event.preventDefault();document.querySelector<HTMLButtonElement>('[role="dialog"] button')?.focus();}}
}

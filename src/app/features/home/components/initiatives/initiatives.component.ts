import {Component, DestroyRef, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RouterLink} from '@angular/router';
import {InitiativesApiService} from '../../../initiatives/initiatives-api.service';
import {InitiativeDemo} from '../../../initiatives/data/initiatives.demo';

@Component({selector:'plus-initiatives',standalone:true,imports:[RouterLink],templateUrl:'./initiatives.component.html'})
export class InitiativesComponent {
 private readonly api=inject(InitiativesApiService);private readonly destroy=inject(DestroyRef);
 readonly initiatives=signal<InitiativeDemo[]>([]);readonly current=signal(0);readonly loading=signal(true);readonly unavailable=signal(false);
 constructor(){this.api.list().pipe(takeUntilDestroyed(this.destroy)).subscribe({next:value=>{this.initiatives.set(value.slice(0,4));this.loading.set(false);},error:()=>{this.unavailable.set(true);this.loading.set(false);}});}
 select(index:number){const length=this.initiatives().length;if(length)this.current.set((index+length)%length);}
}

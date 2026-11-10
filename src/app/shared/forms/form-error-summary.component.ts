import { Component, Input } from '@angular/core';

export interface FormIssue {field:string; label:string; message:string}

export function focusFormTarget(id:string) {
  if(typeof document==='undefined')return;
  requestAnimationFrame(()=>{const target=document.getElementById(id);target?.focus({preventScroll:true});target?.scrollIntoView({block:'center',behavior:'auto'});});
}

@Component({selector:'plus-form-error-summary',standalone:true,host:{style:'display:block;min-width:0'},template:`
  <section [id]="summaryId" tabindex="-1" [attr.aria-labelledby]="summaryId+'-title'" class="plus-form-errors">
    <h2 [id]="summaryId+'-title'" class="text-title-md">Revisa los campos indicados</h2>
    <ul class="mt-3 space-y-2 list-disc pl-5">@for(issue of issues;track issue.field){<li><a [href]="'#'+prefix+issue.field" (click)="focusField($event,issue.field)" class="underline"><strong>{{issue.label}}:</strong> {{issue.message}}</a></li>}</ul>
  </section>
`})
export class FormErrorSummaryComponent {
  @Input({required:true}) summaryId='';
  @Input({required:true}) prefix='';
  @Input() issues:FormIssue[]=[];
  focusField(event:Event,field:string){event.preventDefault();focusFormTarget(this.prefix+field);}
}

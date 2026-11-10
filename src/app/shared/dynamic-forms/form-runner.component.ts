import { Component, Input, OnChanges, output, signal } from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { DemoAnswer, DemoForm, DemoSubmissionInput, submissionProblems } from './forms-demo.models';
import { FormErrorSummaryComponent, focusFormTarget } from '../forms/form-error-summary.component';

@Component({selector:'plus-form-runner',standalone:true,imports:[ReactiveFormsModule,FormErrorSummaryComponent],templateUrl:'./form-runner.component.html',host:{class:'block min-w-0'}})
export class FormRunnerComponent implements OnChanges {
  @Input({required:true}) schema!:DemoForm;
  @Input() preview=false;
  readonly submitted=output<DemoSubmissionInput>();
  readonly attempted=signal(false);
  readonly sent=signal(false);
  readonly form=new FormRecord<FormControl<DemoAnswer>>({});
  ngOnChanges(){for(const name of Object.keys(this.form.controls))this.form.removeControl(name);for(const name of ['names','surnames','document','email','phone','consent'])this.form.addControl(name,new FormControl<DemoAnswer>('',{nonNullable:true}));for(const question of this.schema.questions)this.form.addControl(question.id,new FormControl<DemoAnswer>(question.type==='multiple'?[]:'',{nonNullable:true}));this.attempted.set(false);this.sent.set(false);}
  value():DemoSubmissionInput {const value=this.form.getRawValue();return {identity:{names:String(value['names']).trim(),surnames:String(value['surnames']).trim(),document:this.schema.collectDocument?String(value['document']).trim():'',email:String(value['email']).trim(),phone:String(value['phone']).trim()},answers:Object.fromEntries(this.schema.questions.map(q=>[q.id,value[q.id]])),consent:value['consent']==='yes'};}
  issues(){return submissionProblems(this.schema,this.value());}
  error(id:string){return this.attempted()?this.issues().find(issue=>issue.field===id)?.message??'':'';}
  multiple(id:string,option:string){const control=this.form.controls[id],value=control.value as string[];control.setValue(value.includes(option)?value.filter(item=>item!==option):[...value,option]);}
  checked(id:string,option:string){const value=this.form.controls[id].value;return Array.isArray(value) && value.includes(option);}
  send(){if(this.sent())return;this.attempted.set(true);if(this.issues().length){focusFormTarget('dynamic-form-errors');return;}if(this.preview){focusFormTarget('preview-ready');return;}this.sent.set(true);this.submitted.emit(this.value());}
}

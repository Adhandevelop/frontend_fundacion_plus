import { Component, Input, OnChanges, output, signal, SimpleChanges } from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { DynamicForm, FormAnswer, FormSubmissionInput, submissionProblems } from './forms.models';
import { FormErrorSummaryComponent, focusFormTarget } from '../forms/form-error-summary.component';

@Component({selector:'plus-form-runner',standalone:true,imports:[ReactiveFormsModule,FormErrorSummaryComponent],templateUrl:'./form-runner.component.html',host:{class:'block min-w-0'}})
export class FormRunnerComponent implements OnChanges {
  @Input({required:true}) schema!:DynamicForm;
  @Input() preview=false;
  @Input() submitting=false;
  readonly submitted=output<FormSubmissionInput>();
  readonly attempted=signal(false);
  readonly form=new FormRecord<FormControl<FormAnswer>>({});
  ngOnChanges(changes:SimpleChanges){if(!changes['schema'])return;for(const name of Object.keys(this.form.controls))this.form.removeControl(name);for(const name of ['names','surnames','documentType','document','email','phone','consent'])this.form.addControl(name,new FormControl<FormAnswer>('',{nonNullable:true}));for(const question of this.schema.questions)this.form.addControl(question.id,new FormControl<FormAnswer>(question.type==='seleccion_multiple'?[]:null));this.attempted.set(false);}
  value():FormSubmissionInput {const value=this.form.getRawValue();return {identity:{names:String(value['names']??'').trim(),surnames:String(value['surnames']??'').trim(),documentType:this.schema.collectDocument?String(value['documentType']??'').trim():'',document:this.schema.collectDocument?String(value['document']??'').trim():'',email:String(value['email']??'').trim(),phone:String(value['phone']??'').trim()},answers:Object.fromEntries(this.schema.questions.map(question=>{let answer=value[question.id];if(question.type==='numero'&&answer!==null&&answer!=='')answer=Number(answer);return [question.id,answer];})),consent:value['consent']===true};}
  issues(){return submissionProblems(this.schema,this.value());}
  error(id:string){return this.attempted()?this.issues().find(issue=>issue.field===id)?.message??'':'';}
  multiple(id:string,option:string){const control=this.form.controls[id],current=Array.isArray(control.value)?control.value:[];control.setValue(current.includes(option)?current.filter(item=>item!==option):[...current,option]);}
  checked(id:string,option:string){const value=this.form.controls[id].value;return Array.isArray(value)&&value.includes(option);}
  send(){if(this.submitting)return;this.attempted.set(true);if(this.issues().length){focusFormTarget('dynamic-form-errors');return;}if(this.preview){focusFormTarget('preview-ready');return;}this.submitted.emit(this.value());}
}

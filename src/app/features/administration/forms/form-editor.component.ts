import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsDemoService } from '../../../shared/dynamic-forms/forms-demo.service';
import { copyForm, DemoForm, DemoQuestion, formProblems, QUESTION_LABELS, QUESTION_TYPES, QuestionType } from '../../../shared/dynamic-forms/forms-demo.models';

const blank=():DemoForm=>({id:'',slug:'',title:'',description:'',collectDocument:true,state:'borrador',revision:0,owner:null,questions:[{id:'question-'+crypto.randomUUID(),label:'Describe tu solicitud',type:'parrafo',required:true,options:[]}]});
@Component({selector:'plus-form-editor',standalone:true,imports:[RouterLink,FormsModule],templateUrl:'./form-editor.component.html'})
export class FormEditorComponent {
 readonly store=inject(FormsDemoService);private readonly router=inject(Router);
 readonly draft=signal<DemoForm>(blank());readonly missing=signal(false);readonly attempted=signal(false);readonly status=signal('');readonly saved=signal(false);
 readonly types=QUESTION_TYPES;readonly labels=QUESTION_LABELS;
 constructor(){inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(params=>{const id=params.get('id'),form=id?this.store.adminForm(id):null;this.missing.set(!!id && !form);this.draft.set(form?copyForm(form):blank());this.attempted.set(false);this.status.set('');this.saved.set(false);});}
 editable(){return this.store.canManage() && !this.missing() && this.draft().state==='borrador' && !this.saved();}
 change(field:'title'|'description'|'collectDocument',value:string|boolean){if(this.editable())this.draft.update(form=>({...form,[field]:value}));}
 question(id:string,patch:Partial<DemoQuestion>){if(this.editable())this.draft.update(form=>({...form,questions:form.questions.map(q=>q.id===id?{...q,...patch}:q)}));}
 type(id:string,type:string){if(!this.types.includes(type as QuestionType))return;const q=this.draft().questions.find(q=>q.id===id);if(q)this.question(id,{type:type as QuestionType,options:type==='unica'||type==='multiple'?(q.options.length?q.options:['Opción 1','Opción 2']):[]});}
 options(id:string,text:string){this.question(id,{options:text.split(/\r?\n/)});}
 add(){if(this.editable() && this.draft().questions.length<20)this.draft.update(form=>({...form,questions:[...form.questions,{id:'question-'+crypto.randomUUID(),label:'',type:'texto',required:false,options:[]}]}));}
 remove(id:string){if(this.editable())this.draft.update(form=>({...form,questions:form.questions.filter(q=>q.id!==id)}));}
 move(index:number,delta:number){if(!this.editable())return;const questions=[...this.draft().questions],target=index+delta;if(target<0 || target>=questions.length)return;[questions[index],questions[target]]=[questions[target],questions[index]];this.draft.update(form=>({...form,questions}));}
 problems(){return formProblems(this.draft());}
 save(){if(!this.editable())return;this.attempted.set(true);if(this.problems().length){if(typeof document!=='undefined')setTimeout(()=>document.getElementById('builder-errors')?.focus(),0);return;}const result=this.store.save(this.draft(),this.draft().revision);if('error'in result)this.status.set(result.error);else{this.saved.set(true);this.status.set('Borrador guardado temporalmente en esta pestaña.');void this.router.navigate(['/admin/formularios',result.id,'vista-previa']);}}
}

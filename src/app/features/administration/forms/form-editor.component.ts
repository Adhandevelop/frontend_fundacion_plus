import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { FormsApiService } from '../../../shared/dynamic-forms/forms-api.service';
import { cloneForm, DynamicForm, FormQuestion, formProblems, QUESTION_LABELS, QUESTION_TYPES, QuestionType } from '../../../shared/dynamic-forms/forms.models';

const code=()=>`pregunta_${crypto.randomUUID().replaceAll('-','').slice(0,12)}`;
const blankQuestion=():FormQuestion=>({id:crypto.randomUUID(),code:code(),label:'',help:'',type:'texto_largo',required:true,order:1,validation:{max_length:2000},options:[]});
const blank=():DynamicForm=>({id:'',slug:'',title:'',description:'',collectDocument:true,allowMultiple:false,state:'borrador',publishedVersion:0,editRevision:0,questions:[blankQuestion()]});
const slugify=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,120);

@Component({selector:'plus-form-editor',standalone:true,imports:[RouterLink,FormsModule],templateUrl:'./form-editor.component.html'})
export class FormEditorComponent {
 private readonly api=inject(FormsApiService);private readonly router=inject(Router);private readonly destroy=inject(DestroyRef);private slugTouched=false;
 readonly draft=signal<DynamicForm>(blank());readonly loading=signal(false);readonly missing=signal(false);readonly attempted=signal(false);readonly status=signal('');readonly saving=signal(false);readonly types=QUESTION_TYPES;readonly labels=QUESTION_LABELS;
 constructor(){inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params=>{const id=params.get('id');this.attempted.set(false);this.status.set('');this.missing.set(false);if(!id){this.draft.set(blank());return;}this.loading.set(true);this.api.adminDetail(id).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.loading.set(false))).subscribe({next:value=>{this.draft.set(cloneForm(value.form));this.slugTouched=true;},error:error=>{this.missing.set(true);this.status.set(apiErrorMessage(error));}});});}
 editable(){return this.api.canManage()&&!this.loading()&&!this.missing()&&!this.saving()&&this.draft().state!=='archivado';}
 change(field:'title'|'slug'|'description'|'collectDocument'|'allowMultiple',value:string|boolean){if(!this.editable())return;if(field==='slug')this.slugTouched=true;this.draft.update(form=>{const next={...form,[field]:value};if(field==='title'&&!this.slugTouched&&!form.id)next.slug=slugify(String(value));return next;});}
 question(id:string,patch:Partial<FormQuestion>){if(this.editable())this.draft.update(form=>({...form,questions:form.questions.map(question=>question.id===id?{...question,...patch}:question)}));}
 type(id:string,type:string){if(!this.types.includes(type as QuestionType))return;const current=this.draft().questions.find(question=>question.id===id);if(!current)return;const selection=type==='seleccion_unica'||type==='seleccion_multiple';this.question(id,{type:type as QuestionType,options:selection?(current.options.length?current.options:[{value:'opcion_1',label:'Opción 1',order:1},{value:'opcion_2',label:'Opción 2',order:2}]):[],validation:{}});}
 options(id:string,text:string){const values=text.split(/\r?\n/).map((label,index)=>({value:slugify(label).replaceAll('-','_')||`opcion_${index+1}`,label,order:index+1}));this.question(id,{options:values});}
 optionsText(question:FormQuestion){return question.options.map(option=>option.label).join('\n');}
 validation(id:string,key:'min_length'|'max_length'|'min_value'|'max_value'|'min_items'|'max_items',value:string){const current=this.draft().questions.find(question=>question.id===id);if(!current)return;const validation={...current.validation};if(value==='')delete validation[key];else validation[key]=Number(value);this.question(id,{validation});}
  integerOnly(id:string,value:boolean){const current=this.draft().questions.find(question=>question.id===id);if(current)this.question(id,{validation:{...current.validation,integer_only:value}});}
 add(){if(!this.editable()||this.draft().questions.length>=50)return;this.draft.update(form=>({...form,questions:[...form.questions,{...blankQuestion(),order:form.questions.length+1}]}));}
 remove(id:string){if(this.editable())this.draft.update(form=>({...form,questions:form.questions.filter(question=>question.id!==id)}));}
 move(index:number,delta:number){if(!this.editable())return;const questions=[...this.draft().questions],target=index+delta;if(target<0||target>=questions.length)return;[questions[index],questions[target]]=[questions[target],questions[index]];this.draft.update(form=>({...form,questions:questions.map((question,order)=>({...question,order:order+1}))}));}
 problems(){return formProblems(this.draft());}
 save(){if(!this.editable())return;this.attempted.set(true);if(this.problems().length){setTimeout(()=>document.getElementById('builder-errors')?.focus(),0);return;}this.saving.set(true);this.status.set('');const form=this.draft(),request=form.id?this.api.update(form):this.api.create(form);request.pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.saving.set(false))).subscribe({next:value=>{this.status.set('Borrador guardado en PLUS.');void this.router.navigate(['/admin/formularios',value.id,'vista-previa']);},error:error=>this.status.set(apiErrorMessage(error))});}
}

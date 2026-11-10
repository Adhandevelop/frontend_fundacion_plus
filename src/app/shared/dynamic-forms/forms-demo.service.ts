import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { canAccessAdminSection } from '../../core/auth/admin-access.policy';
import { copyForm, DemoForm, DemoSubmission, DemoSubmissionInput, formProblems, submissionProblems } from './forms-demo.models';

const EXAMPLE:DemoForm={id:'demo-form-community',slug:'solicitud-comunitaria-demo',title:'Solicitud de acompañamiento comunitario',description:'Ejemplo para explorar el diseño. Usa únicamente datos ficticios.',collectDocument:true,state:'publicado',revision:1,owner:null,questions:[
  {id:'subject',label:'¿Qué acompañamiento necesitas?',type:'unica',required:true,options:['Orientación comunitaria','Participación ciudadana','Otro']},
  {id:'description',label:'Describe tu solicitud',type:'parrafo',required:true,options:[]},
  {id:'availability',label:'Fecha de disponibilidad',type:'fecha',required:false,options:[]},
]};
const EXAMPLE_RESPONSE:DemoSubmission={id:'demo-response-example',formId:EXAMPLE.id,form:copyForm(EXAMPLE),identity:{names:'Persona',surnames:'de ejemplo',document:'00000000',email:'persona@example.invalid',phone:'0000000000'},answers:{subject:'Orientación comunitaria',description:'Respuesta ficticia para explorar el detalle del formulario.',availability:''},owner:null,date:'2026-11-09T12:00:00Z',activation:'pendiente_demo',consent:true};

@Injectable({providedIn:'root'})
export class FormsDemoService {
  private readonly auth=inject(AuthService);
  private readonly rows=signal<DemoForm[]>([copyForm(EXAMPLE),{...copyForm(EXAMPLE),id:'demo-form-draft',slug:'borrador-demo',title:'Encuesta de participación · borrador',state:'borrador'}, {...copyForm(EXAMPLE),id:'demo-form-closed',slug:'cerrado-demo',title:'Encuesta de ejemplo cerrada',state:'cerrado'}]);
  private readonly submissions=signal<DemoSubmission[]>([]);
  readonly canManage=computed(()=>canAccessAdminSection(this.auth.user(),'forms'));
  readonly forms=computed(()=>this.canManage()?this.rows().filter(row=>row.owner===null || row.owner===this.auth.user()?.id_usuario).map(copyForm):[]);
  adminForm(id:string){return this.forms().find(row=>row.id===id)??null;}
  publicForm(slug:string){const row=this.rows().find(row=>row.slug===slug && row.state!=='borrador');return row?copyForm(row):null;}
  save(input:DemoForm,expected:number):{id:string}|{error:string}{
    if(!this.canManage())return {error:'No tienes permiso para gestionar formularios.'};
    const previous=input.id?this.adminForm(input.id):null;
    if(input.id && (!previous || previous.state!=='borrador' || previous.revision!==expected))return {error:'El formulario cambió o no es un borrador. Vuelve al listado.'};
    const problems=formProblems(input);if(problems.length)return {error:problems.join(' ')};
    const id=previous?.id??`demo-form-${crypto.randomUUID()}`;
    const saved={...copyForm(input),id,slug:previous?.slug??id,title:input.title.trim(),description:input.description.trim(),state:'borrador' as const,owner:previous?.owner??this.auth.user()!.id_usuario,revision:(previous?.revision??0)+1};
    this.rows.update(rows=>previous?rows.map(row=>row.id===id?saved:row):[saved,...rows]);return {id};
  }
  copy(id:string){const source=this.adminForm(id);if(!source)return {error:'Formulario no disponible.'};return this.save({...source,id:'',title:source.title.slice(0,140)+' · copia'},0);}
  transition(id:string,revision:number,target:'publicado'|'cerrado'){
    const row=this.adminForm(id);
    if(!row || row.revision!==revision || (target==='publicado'?row.state!=='borrador' || formProblems(row).length>0:row.state!=='publicado'))return false;
    this.rows.update(rows=>rows.map(item=>item.id===id?{...item,state:target,revision:item.revision+1}:item));return true;
  }
  submit(slug:string,input:DemoSubmissionInput):DemoSubmission|null{
    const form=this.publicForm(slug);if(!form || form.state!=='publicado' || submissionProblems(form,input).length)return null;
    const row:DemoSubmission={id:`demo-response-${crypto.randomUUID()}`,formId:form.id,form:copyForm(form),identity:{...input.identity,document:form.collectDocument?input.identity.document:''},answers:Object.fromEntries(form.questions.map(question=>{const value=input.answers[question.id]??'';return [question.id,Array.isArray(value)?[...value]:value];})),owner:this.auth.canCitizen()?this.auth.user()!.id_usuario:null,date:new Date().toISOString(),activation:this.auth.canCitizen()?'sesion_ciudadana_demo':'pendiente_demo',consent:true};
    this.submissions.update(rows=>[row,...rows]);return row;
  }
  adminResponses(id:string){return this.adminForm(id)?[...(id===EXAMPLE.id?[EXAMPLE_RESPONSE]:[]),...this.submissions().filter(row=>row.formId===id)]:[];}
  citizenResponses(){return this.auth.canCitizen()?[{...EXAMPLE_RESPONSE,owner:this.auth.user()!.id_usuario},...this.submissions().filter(row=>row.owner===this.auth.user()!.id_usuario)]:[];}
}

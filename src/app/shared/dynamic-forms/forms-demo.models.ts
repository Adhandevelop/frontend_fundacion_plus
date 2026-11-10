// Presentation models only. These are not backend DTOs.
export const QUESTION_TYPES = ['texto','parrafo','unica','multiple','fecha'] as const;
export type QuestionType = typeof QUESTION_TYPES[number];
export const QUESTION_LABELS:Record<QuestionType,string>={texto:'Respuesta corta',parrafo:'Respuesta larga',unica:'Selección única',multiple:'Selección múltiple',fecha:'Fecha'};
export interface DemoQuestion {id:string;label:string;type:QuestionType;required:boolean;options:string[]}
export interface DemoForm {id:string;slug:string;title:string;description:string;collectDocument:boolean;questions:DemoQuestion[];state:'borrador'|'publicado'|'cerrado';revision:number;owner:string|null}
export type DemoAnswer = string|string[];
export interface DemoIdentity {names:string;surnames:string;document:string;email:string;phone:string}
export interface DemoSubmission {id:string;formId:string;form:DemoForm;identity:DemoIdentity;answers:Record<string,DemoAnswer>;owner:string|null;date:string;activation:'pendiente_demo'|'sesion_ciudadana_demo';consent:boolean}
export interface DemoSubmissionInput {identity:DemoIdentity;answers:Record<string,DemoAnswer>;consent:boolean}
export function submissionProblems(form:DemoForm,input:DemoSubmissionInput):{field:string;label:string;message:string}[]{
  const errors:{field:string;label:string;message:string}[]=[];
  for(const [key,label,max] of [['names','Nombres',100],['surnames','Apellidos',100],['email','Correo',150],['phone','Celular',20],...(form.collectDocument?[['document','Cédula',30]]:[])] as [keyof DemoIdentity,string,number][]){
    const value=input.identity[key]?.trim();if(!value || value.length>max || (key==='email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)))errors.push({field:key,label,message:`Revisa este campo obligatorio (hasta ${max} caracteres).`});
  }
  for(const question of form.questions){
    const value=input.answers[question.id]??'',empty=Array.isArray(value)?!value.length:!value.trim();
    let invalid=question.required && empty;
    if(!empty){
      if(question.type==='multiple')invalid ||= !Array.isArray(value) || value.some(option=>!question.options.includes(option)) || new Set(value).size!==value.length;
      else if(typeof value!=='string')invalid=true;
      else if(question.type==='unica')invalid ||= !question.options.includes(value);
      else if(question.type==='fecha')invalid ||= !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10)!==value;
      else invalid ||= value.length>(question.type==='parrafo'?2000:200);
    }
    if(invalid)errors.push({field:question.id,label:question.label,message:'Completa la respuesta con un valor válido.'});
  }
  if(!input.consent)errors.push({field:'consent',label:'Autorización',message:'Debes aceptar antes de enviar la demostración.'});
  return errors;
}
export const copyForm=(form:DemoForm):DemoForm=>({...form,questions:form.questions.map(q=>({...q,options:[...q.options]}))});
export function formProblems(form:Pick<DemoForm,'title'|'description'|'questions'>):string[]{
  const errors:string[]=[];
  if(!form.title.trim() || form.title.length>150)errors.push('El título debe contener entre 1 y 150 caracteres.');
  if(form.description.length>2000)errors.push('La descripción admite hasta 2000 caracteres.');
  if(form.questions.length<1 || form.questions.length>20)errors.push('Añade entre 1 y 20 preguntas adicionales.');
  if(new Set(form.questions.map(q=>q.id)).size!==form.questions.length)errors.push('Hay identificadores de pregunta repetidos.');
  form.questions.forEach((q,index)=>{
    if(!q.id || ['names','surnames','document','email','phone','consent'].includes(q.id) || !q.label.trim() || q.label.length>200 || !QUESTION_TYPES.includes(q.type))errors.push(`Revisa el título y tipo de la pregunta ${index+1}.`);
    if(q.type==='unica' || q.type==='multiple'){
      const options=q.options.map(option=>option.trim());
      if(options.length<2 || options.length>10 || options.some(option=>!option || option.length>100) || new Set(options.map(option=>option.toLocaleLowerCase('es'))).size!==options.length)errors.push(`La pregunta ${index+1} necesita entre 2 y 10 opciones distintas, de hasta 100 caracteres.`);
    }
  });
  return errors;
}

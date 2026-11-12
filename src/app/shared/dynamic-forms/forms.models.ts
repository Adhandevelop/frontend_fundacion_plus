export const QUESTION_TYPES=['texto_corto','texto_largo','numero','fecha','booleano','seleccion_unica','seleccion_multiple'] as const;
export type QuestionType=typeof QUESTION_TYPES[number];
export const QUESTION_LABELS:Record<QuestionType,string>={texto_corto:'Respuesta corta',texto_largo:'Respuesta larga',numero:'Número',fecha:'Fecha',booleano:'Sí o no',seleccion_unica:'Selección única',seleccion_multiple:'Selección múltiple'};
export type FormState='borrador'|'publicado'|'cerrado'|'archivado';
export interface ValidationConfiguration {min_length?:number;max_length?:number;min_value?:number;max_value?:number;integer_only?:boolean;min_date?:string;max_date?:string;min_items?:number;max_items?:number;regex_pattern?:string;regex_error_message?:string}
export interface FormOption {id?:string;value:string;label:string;order:number}
export interface FormQuestion {id:string;code:string;label:string;help:string;type:QuestionType;required:boolean;order:number;validation:ValidationConfiguration;options:FormOption[]}
export interface DataPolicy {id:string;version:string;title:string;summary:string;url:string}
export interface DynamicForm {id:string;slug:string;title:string;description:string;state:FormState;collectDocument:boolean;allowMultiple:boolean;publishedVersion:number;editRevision:number;questions:FormQuestion[];policy?:DataPolicy|null}
export type FormAnswer=string|string[]|number|boolean|null;
export interface FormIdentity {names:string;surnames:string;email:string;phone:string;documentType:string;document:string}
export interface FormSubmissionInput {identity:FormIdentity;answers:Record<string,FormAnswer>;consent:boolean}
export interface FormIssue {field:string;label:string;message:string}

const empty=(value:FormAnswer|undefined)=>value===null || value===undefined || value==='' || (Array.isArray(value)&&value.length===0);
export function submissionProblems(form:DynamicForm,input:FormSubmissionInput):FormIssue[]{
  const errors:FormIssue[]=[];
  for(const [key,label,max] of [['names','Nombres',150],['surnames','Apellidos',150],['email','Correo',254],['phone','Celular',30]] as [keyof FormIdentity,string,number][]){
    const value=input.identity[key].trim();if(!value || value.length>max || (key==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)))errors.push({field:key,label,message:`Revisa este campo obligatorio (máximo ${max} caracteres).`});
  }
  if(form.collectDocument){
    if(!input.identity.documentType.trim())errors.push({field:'documentType',label:'Tipo de documento',message:'Selecciona el tipo de documento.'});
    if(!input.identity.document.trim()||input.identity.document.length>50)errors.push({field:'document',label:'Número de documento',message:'Escribe un número de documento válido.'});
  }
  for(const question of form.questions){
    const value=input.answers[question.id];
    if(question.required&&empty(value)){errors.push({field:question.id,label:question.label,message:'Esta respuesta es obligatoria.'});continue;}
    if(empty(value))continue;
    let invalid=false;
    if(question.type==='seleccion_multiple')invalid=!Array.isArray(value)||value.some(item=>!question.options.some(option=>option.value===item))||new Set(value).size!==value.length;
    else if(question.type==='seleccion_unica')invalid=typeof value!=='string'||!question.options.some(option=>option.value===value);
    else if(question.type==='numero')invalid=typeof value!=='number'||!Number.isFinite(value)||(question.validation.integer_only===true&&!Number.isInteger(value));
    else if(question.type==='booleano')invalid=typeof value!=='boolean';
    else if(question.type==='fecha')invalid=typeof value!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)||Number.isNaN(Date.parse(value));
    else invalid=typeof value!=='string';
    if(invalid)errors.push({field:question.id,label:question.label,message:'Completa la respuesta con un valor válido.'});
  }
  if(!input.consent)errors.push({field:'consent',label:'Autorización',message:'Debes aceptar la política de tratamiento de datos.'});
  return errors;
}

export function formProblems(form:DynamicForm):string[]{
  const errors:string[]=[];
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)||form.slug.length>120)errors.push('El enlace debe usar minúsculas, números y guiones, hasta 120 caracteres.');
  if(!form.title.trim()||form.title.length>255)errors.push('El título es obligatorio y admite hasta 255 caracteres.');
  if(!form.questions.length)errors.push('Añade al menos una pregunta.');
  const codes=form.questions.map(question=>question.code);
  if(new Set(codes).size!==codes.length)errors.push('Los códigos de pregunta no pueden repetirse.');
  form.questions.forEach((question,index)=>{
    if(!/^[a-z0-9_]{2,50}$/.test(question.code)||!question.label.trim())errors.push(`Revisa el código y el enunciado de la pregunta ${index+1}.`);
    if((question.type==='seleccion_unica'||question.type==='seleccion_multiple')&&(question.options.length<2||question.options.some(option=>!option.value.trim()||!option.label.trim())||new Set(question.options.map(option=>option.value)).size!==question.options.length))errors.push(`La pregunta ${index+1} necesita al menos dos opciones con valores diferentes.`);
  });
  return errors;
}

export const cloneForm=(form:DynamicForm):DynamicForm=>({...form,questions:form.questions.map(question=>({...question,validation:{...question.validation},options:question.options.map(option=>({...option}))})),policy:form.policy?{...form.policy}:form.policy});

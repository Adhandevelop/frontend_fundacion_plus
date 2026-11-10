import { AbstractControl, FormGroup } from '@angular/forms';
import { FormIssue } from '../../../shared/forms/form-error-summary.component';

export function authControlError(control:AbstractControl|null,extra=''):string {
  const errors=control?.errors;
  if(errors?.['required'])return 'Este campo es obligatorio.';
  if(errors?.['email'])return 'Introduce un correo electrónico válido.';
  if(errors?.['minlength'])return `Utiliza al menos ${errors['minlength'].requiredLength} caracteres.`;
  if(errors?.['maxlength'])return `Utiliza como máximo ${errors['maxlength'].requiredLength} caracteres.`;
  if(errors?.['pattern'])return 'Introduce un valor con contenido válido.';
  return extra || (control?.invalid?'Revisa este campo.':'');
}
export function authFieldError(form:FormGroup,field:string):string {
  const control=form.get(field);
  if(!control?.touched)return '';
  if(field==='consent' && control.invalid)return 'Autoriza el tratamiento de datos para continuar.';
  return authControlError(control,field==='confirmation' && form.hasError('passwordMismatch')?'Las contraseñas deben coincidir.':'');
}
export function authFormIssues(form:FormGroup,fields:readonly (readonly [string,string])[]):FormIssue[]{
  return fields.flatMap(([field,label])=>{
    const message=authFieldError(form,field);
    return message?[{field,label,message}]:[];
  });
}

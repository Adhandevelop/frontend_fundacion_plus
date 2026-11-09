import { AbstractControl, ValidationErrors } from '@angular/forms';

// Form-only validation; the backend password policy remains to be agreed.
export function matchingPasswords(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('confirmation')?.value ? null : {passwordMismatch: true};
}

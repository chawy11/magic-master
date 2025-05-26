import { AbstractControl, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

      const errors = {
        upperCase: !hasUpperCase,
        lowerCase: !hasLowerCase,
        number: !hasNumber,
        specialChar: !hasSpecialChar
      };

      return Object.values(errors).some(Boolean)
        ? { passwordStrength: errors }
        : null;
    };
  }

  static usernameFormat(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const validUsername = /^[a-zA-Z0-9_]{3,}$/.test(value);
      return validUsername ? null : { invalidUsername: true };
    };
  }
}

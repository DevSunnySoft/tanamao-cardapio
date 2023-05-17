import { AbstractControl, ValidatorFn } from '@angular/forms'

export function forbidenTextValidator(validationName: string, exp: RegExp): ValidatorFn {
  return (control: AbstractControl):{[key: string]: any} | null => {
    const valid = exp.test(control.value)
    let result: any = null

    if( !valid ) {
      result = {}
      result[validationName] = true
    }
     
    return result
  }
}

export function cpfTest(): ValidatorFn {

  return (control: AbstractControl): {[key: string]: any} | null => {
    var result: any = null
    var sum, dif, valid = true
    let cpf = control.value

    cpf = cpf.replace(/\./g, '')
    cpf = cpf.replace(/\-/, '')

    sum = 0
    if (cpf == "00000000000") valid = false

    for (var i=1; i<=9; i++) sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
    dif = (sum * 10) % 11;

      if ((dif == 10) || (dif == 11))  dif = 0;
      if (dif != parseInt(cpf.substring(9, 10)) ) valid = false;

    sum = 0;
    for (i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
    dif = (sum * 10) % 11;

    if ((dif == 10) || (dif == 11))  dif = 0;
    if (dif != parseInt(cpf.substring(10, 11) ) ) valid = false;

    if(valid === false)
      result = {'test': true}

    return result

  }

}

export function validateMask(mask: any): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    let isvalid = true;

    if( mask.length ) {
      let x = mask.length;

      while(x--) {
        if( mask[x].test(control.value) ) {
          isvalid = false;
          break;
        }
      }

    } else {
      isvalid = mask.test(control.value);
    }

    return isvalid ? null : {'mask': {value: control.value}};
  }
}
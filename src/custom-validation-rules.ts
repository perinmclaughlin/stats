import { ValidationRules } from "aurelia-validation";

export class CustomValidationRules {
  constructor() {
    ValidationRules.customRule(
      "isNumeric",
      (value: string, obj: any) => {
        if(value == null || value == "") {
          return true;
        }
        return /^\d*$/.test(value);
      }, "Your input needs to be a number."
    );
  }
}

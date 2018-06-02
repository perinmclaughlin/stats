import { 
  RenderInstruction, 
  ValidateResult,
  ValidationRenderer
} from "aurelia-validation";

// bootstrap 4
export class BootstrapRenderer implements ValidationRenderer {
  showMessages: boolean;

  constructor(options?: any) {
    this.showMessages = false;
    if(options != null && "showMessages" in options) {
      this.showMessages = options.showMessages;
    }
  }

  render(instruction: RenderInstruction) {
    for(var x of instruction.unrender) {
      for(var element of x.elements) {
        this.remove(element, x.result);

        if (instruction.kind == "reset") {
          var formGroup = this.findFormGroup(element);
          if (formGroup != null) {
            formGroup.classList.remove("has-danger");
            formGroup.classList.remove("has-success");
            element.classList.remove("is-invalid");
          }
        }
      }
    }

    for (var x of instruction.render) {
      for (var element of x.elements) {
        this.add(element, x.result);
      }
    }
  }

  add(element: Element, result: ValidateResult) {
    var formGroup = this.findFormGroup(element);
    if(!formGroup) {
      return;
    }

    if(result.valid) {
      if(!formGroup.classList.contains("has-danger")) {
        formGroup.classList.add("has-success");
        element.classList.remove("is-invalid");
      }
    }else{
      formGroup.classList.remove("has-success");
      formGroup.classList.add("has-danger");
      element.classList.add("is-invalid");
    }

    if(this.showMessages) {
      let message = document.createElement("span");
      message.className = 'invalid-feedback validation-message';
      message.textContent = result.message;
      message.id = `validation_message_${result.id}`;
      formGroup.appendChild(message);
    }
  }

  remove(element: Element, result: ValidateResult) {
    var formGroup = this.findFormGroup(element);
    if(!formGroup){
      return;
    }

    if(result.valid) {
      if(formGroup.classList.contains("has-success")) {
        formGroup.classList.remove("has-danger");
        element.classList.remove("is-invalid");
      }
    }

    let message = formGroup.querySelector(`#validation_message_${result.id}`);
    if(message) {
      formGroup.removeChild(message);
    }

    if(formGroup.querySelectorAll('.invalid-feedback.validation-message').length === 0) {
      formGroup.classList.remove("has-danger");
      element.classList.remove("is-invalid");
    }
  }


  findFormGroup(elt: Element): Element{
    var result = elt;
    while(result != null && !result.classList.contains("form-group")) {
      result = result.parentElement;
    }
    return result;
  }
}

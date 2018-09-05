
import {autoinject, customElement, containerless, bindable, bindingMode} from "aurelia-framework";

@autoinject
@customElement("bingo-cell")
@containerless
export class BingoCell {
  @bindable({defaultBindingMode: bindingMode.twoWay}) value: boolean;

  public toggle() {
    this.value = !this.value;
  }
}

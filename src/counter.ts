import { autoinject, bindable, bindingMode, customElement } from "aurelia-framework";

@autoinject 
@customElement("counter")
export class Counter {
  @bindable model: any;
  @bindable property: string;
  @bindable({defaultValue: 0 }) min: number;
  @bindable({defaultValue: 1000 }) max: number;
  @bindable({defaultValue: 1 }) incrementBy: number;
  @bindable rules: any;
  @bindable display: string;
  static idCounter = 0;
  id: string;

  constructor() {
    Counter.idCounter ++;
    this.id = `counter_${Counter.idCounter}`;
  }

  public get value() {
    return this.model[this.property];
  }

  public set value(val: string|number) {
    this.model[this.property] = val;
  }

  public decrement() {
    let value = parseInt(<any>this.value);
    if(isNaN(value)) {
      value = this.min;
    }

    this.value = Math.max(this.min, value - this.incrementBy);
  }

  public increment() {
    let value = parseInt(<any>this.value);
    if(isNaN(value)) {
      value = this.min;
    }

    value += this.incrementBy;

    if(this.max != null) {
      value = Math.min(this.max, value);
    }

    this.value = value;
  }
}

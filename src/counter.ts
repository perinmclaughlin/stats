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
  @bindable onIncrement: Function;
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
    let didIncrement = true;
    if(isNaN(value)) {
      value = this.min;
      didIncrement = false;
    }

    value += this.incrementBy;

    if(this.max != null && value > this.max) {
      value = this.max;
      didIncrement = false;
    }

    this.value = value;
    if(didIncrement && this.onIncrement != null) {
      this.onIncrement();
    }
  }
}

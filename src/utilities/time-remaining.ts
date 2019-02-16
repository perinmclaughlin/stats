import { autoinject, bindable, bindingMode, customElement } from "aurelia-framework";

@autoinject 
@customElement("time-remaining")
export class TimeRemaining {
  @bindable model: any;
  @bindable property: string;
  min: number;
  max: number;
  @bindable({defaultValue: 1 }) incrementBy: number;
  @bindable rules: any;
  @bindable display: string;
  @bindable onIncrement: Function;
  @bindable placeholder: string;
  @bindable({defaultValue: true}) showLabel: boolean;
  @bindable({defaultBindingMode: bindingMode.twoWay}) auto: boolean;
  static idCounter = 0;
  id: string;

  constructor() {
    TimeRemaining.idCounter ++;
    this.id = `counter_${TimeRemaining.idCounter}`;
    this.max = 135;
    this.auto = true;
    this.min = 0;
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
    if(this.min != null && value == this.min && this.auto) {
        value = this.max + 1;
        this.auto = !this.auto;
    }

    if(this.min != null && value > this.min) {
        value -= this.incrementBy;
    }

    this.value = value;
  }

  public increment() {
    let value = parseInt(<any>this.value);
    let didIncrement = true;
    if(isNaN(value)) {
      value = this.min;
      didIncrement = false;
    }

    if(this.max != null && value == this.max && !this.auto) {
        value = this.min - 1;
        didIncrement = true;
        this.auto = !this.auto;
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

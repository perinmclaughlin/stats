import * as numeral from "numeral";

export class NumericValueConverter {
  toView(value, form="0.00") {
    return numeral(value).format(form);
  }
}

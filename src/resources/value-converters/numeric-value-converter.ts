import * as numeral from "numeral";

export class NumericValueConverter {
  toView(value) {
    return numeral(value).format("0.00");
  }
}

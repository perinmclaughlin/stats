
import {autoinject, customElement, containerless, bindable, bindingMode} from "aurelia-framework";
import { DialogCloseResult, DialogService } from "aurelia-dialog";

@autoinject
@customElement("bingo-cell")
@containerless
export class BingoCell {
  @bindable m: any;
  @bindable({defaultBindingMode: bindingMode.twoWay}) prop: string;
  @bindable back: IBingoPersistence;

  public toggle() {
    let oldValue = this.m[this.prop];
    let value = !oldValue;
    console.info("m: ", this.m);
    console.info("prop: ", this.prop);
    console.info("m[prop] before: ", this.m[this.prop]);
    this.m[this.prop] = value;
    console.info("m[prop] after: ", this.m[this.prop]);

    if(!value) {
      this.back.removeEntry(this.prop);
    }

    if(value && this.back != null) {
      this.back.showBingoEntryDialog(this.prop).then(dialogResult => {
        if(dialogResult.wasCancelled) {
          this.m[this.prop] = oldValue;
        }
      });
    }
  }
}

export interface IBingoPersistence {
  showBingoEntryDialog(cell: string): Promise<DialogCloseResult>;

  removeEntry(cell: string);
}

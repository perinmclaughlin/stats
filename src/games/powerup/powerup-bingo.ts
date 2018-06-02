import {autoinject} from "aurelia-framework";
import {DialogController} from "aurelia-dialog";
import { 
  TeamMatch2018Entity, 
} from "../../persistence";

@autoinject
export class PowerupBingoDialog {
  public match: TeamMatch2018Entity;

  constructor(private controller: DialogController) {
  }

  activate(model) {
    this.match = model.match;
  }
}

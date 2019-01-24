import {autoinject} from "aurelia-framework";
import {DialogController, DialogService} from "aurelia-dialog";
import { TeamMatch2019Entity } from "../../persistence";

@autoinject
export class DeepSpaceBingoDialog {
  public m: any;
  private _match: TeamMatch2019Entity;

  constructor(private controller: DialogController) {
  }

  activate(model) {
    this._match = model.match;
  }

  public static open(dialogService: DialogService, model: DeepSpaceBingoInput) {
    return dialogService.open({
      model: model,
      viewModel: DeepSpaceBingoDialog
    });
  }
}

export interface DeepSpaceBingoInput {
  match: TeamMatch2019Entity;
}

import { autoinject } from "aurelia-framework";
import { DialogController, DialogService } from "aurelia-dialog";


@autoinject
export class SaveDialog {
  public dialogContext: string;
  public dialogMessage: string;
  constructor(public controller: DialogController){

  }

  activate(model: SaveDialogModel){
    this.controller.settings.lock = false;
    this.controller.settings.overlayDismiss = true;
  }

  public static open(dialogService: DialogService, model: SaveDialogModel) {
    return dialogService.open({model: model, viewModel: SaveDialog});
  }
}

export interface SaveDialogModel { }

import { autoinject } from "aurelia-framework";
import { DialogController, DialogService } from "aurelia-dialog";


@autoinject
export class ConfirmDialog {
  public dialogContext: string;
  public dialogMessage: string;
  constructor(public controller: DialogController){

  }

  activate(model: ConfirmDialogModel){
    this.controller.settings.lock = false;
    this.controller.settings.overlayDismiss = true;
    this.dialogContext = model.message;
    this.dialogMessage = model.confirmMessage;

  }

  public static open(dialogService: DialogService, model: ConfirmDialogModel) {
    return dialogService.open({model: model, viewModel: ConfirmDialog});
  }
}

export interface ConfirmDialogModel {
  message: string;
  confirmMessage: string;
}

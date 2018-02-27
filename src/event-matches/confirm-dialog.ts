import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";


@autoinject
export class ConfirmDialog {
    public dialogContext: string;
    public dialogMessage: string;
    constructor(private controller: DialogController){

    }

    activate(model){
        this.controller.settings.lock = false;
        this.controller.settings.overlayDismiss = true;
        this.dialogContext = model[0];
        this.dialogMessage = model[1];

    }
}
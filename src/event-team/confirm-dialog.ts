import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";


@autoinject
export class ConfirmDialog {
    public dialogContext: string;
    constructor(private controller: DialogController){

    }

    activate(model){
        this.controller.settings.lock = false;
        this.controller.settings.overlayDismiss = true;
        this.dialogContext = model;
    }
}
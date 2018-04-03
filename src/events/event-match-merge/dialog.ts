import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { EventMatchMergeState } from "../../model";
import { ValidationController, ValidationControllerFactory } from "aurelia-validation";

@autoinject
export class EventMatchMergeDialog {
    state: EventMatchMergeState;
    private validationController: ValidationController;

    public static properties = [
        "blue1", "blue2", "blue3",
        "red1", "red2", "red3",
    ];

    constructor(
        private controller: DialogController,
        validationControllerFactory: ValidationControllerFactory,
    ) {
        this.validationController = validationControllerFactory.createForCurrentScope();
    }

    activate(model) {
        this.state = model.state;
    }

    takeAllFromDb() {
        for (var prop of EventMatchMergeDialog.properties) {
            this.state.merged[prop] = this.state.localSaved[prop];
        }
    }

    takeAllFromFile() {
        for (var prop of EventMatchMergeDialog.properties) {
            this.state.merged[prop] = this.state.fromFile[prop];
        }
    }
}
import { autoinject } from "aurelia-framework";
import { FrcStatsContext, EventTeamEntity, EventMatchEntity, EventEntity } from "../persistence";
import { DialogController } from "aurelia-dialog";

@autoinject
export class MatchDialog {
    private x: number;
    private dialog_matchNumber: number;
    private dialog_teamNumbers_blue0: string;
    private dialog_teamNumbers_blue1: string;
    private dialog_teamNumbers_blue2: string;
    private dialog_teamNumbers_red0: string;
    private dialog_teamNumbers_red1: string;
    private dialog_teamNumbers_red2: string;
    public match: EventMatchEntity;
    constructor(
        private dbContext: FrcStatsContext,
        private controller: DialogController,
    ){
        
    }

    activate(model) {
        this.controller.settings.lock = false;
        this.controller.settings.overlayDismiss = true;
        this.match = {
            matchNumber: null,
            year: "2018",
            eventCode: model.eventCode,
            teamNumbers_blue: ["", "",""],
            teamNumbers_red: ["","",""],
        };
    }

    save() {
        console.info(this.match);
    }
}
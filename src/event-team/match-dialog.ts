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
        this.validate();
        if(this.validate() == true){
            this.dbContext.eventMatches.where(["year", "eventCode", "matchNumber"]).equals([this.match.year, this.match.eventCode, this.match.matchNumber]).first().then(savedMatch => {
                if(savedMatch != null){
                    this.match.id = savedMatch.id;
                }
            }).then(() => {
                return this.dbContext.eventMatches.put(this.match);
            }).then(() => {
                console.info("dupr I saved");
            });
        }
        else{
            
        }
        
        /*
        this.match.toString();
        TODO: actually write to a file 
        */
    }

    setValues(){
        this.match.matchNumber = null;
        this.match.teamNumbers_blue[0] = null;
        this.match.teamNumbers_blue[1] = null;
        this.match.teamNumbers_blue[2] = null;
        this.match.teamNumbers_red[0] = null;
        this.match.teamNumbers_red[1] = null;
        this.match.teamNumbers_red[2] = null;
    }

    validate(){
        var dict = {};
        for(var i = 0; i < 3; i++){
            dict[this.match.teamNumbers_blue[i]] = i;
        };
        for(var p = 0; p < 3; p++){
            dict[this.match.teamNumbers_red[p]] = 3 + p;
        };
        if(Object.keys(dict).length != 6){
            return false;
        }
        else{
            return true;
        }
    }
}
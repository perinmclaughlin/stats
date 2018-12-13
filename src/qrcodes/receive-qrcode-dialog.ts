import { DialogService, DialogController } from "aurelia-dialog";
import { ReceiveQrCodeModel } from "./display-input";
import { FrcStatsContext, EventEntity } from "../persistence";
import { IEventJson, gameManager } from "../games/index";
import { getTeamNumbers } from "../games/merge-utils";
import { autoinject } from "aurelia-framework";

@autoinject
export class ReceiveQrCodeDialog {
    event: EventEntity;
    teamNumber: string;
    matchNumber: string;
    data: any;
    saved: boolean;
    hasErrors = false;
    errorMessage: string;
    mergeStates: any[];
    mergeState: any;
    needsMerge = false;
    succeeded = false;

    constructor(
        private dbContext: FrcStatsContext,
        private dialogService: DialogService,
        public controller: DialogController) {

    }

    public activate(model: ReceiveQrCodeModel) {
        this.controller.settings.lock = false;
        this.controller.settings.overlayDismiss = true;
        this.data = model.data;
        this.teamNumber = model.teamNumber;
        this.matchNumber = model.matchNumber;
        this.saved = false;

        let data = this.data;
        if ('matchNumber' in data && 'year' in data && 'eventCode' in data && 'teamNumber' in data) {
            // single team/match data
            Promise.all([
                this.dbContext.getEventMatches(data.year, data.eventCode),
                this.dbContext.getEvent(data.year, data.eventCode),
            ]).then(results => {
                this.event = results[1];
                let eventMatches = results[0];
                if (this.event == null) {
                    this.hasErrors = true;
                    this.errorMessage = (`data is for event "${data.eventCode}", which does not exist locally`);
                } else if (eventMatches.filter(em => em.matchNumber == data.matchNumber && getTeamNumbers(em).has(data.teamNumber)).length == 0) {
                    this.hasErrors = true;
                    this.errorMessage = `data is for team ${data.teamNumber}, match ${data.matchNumber}, but that team is not scheduled to be in that match for event ${data.eventCode}`;
                } else {
                    let json: IEventJson = {
                        teams: [],
                        eventTeams: [],
                        event: this.event,
                        eventMatches: []
                    };
                    let game = gameManager.getGame(data.year);
                    game.setJsonEventTeamMatch(json, data);
                    game.beginMerge(json).then(mergeStates => {
                        this.mergeState = mergeStates.filter(m => m.fromFile != null && m.fromFile.matchNumber == data.matchNumber)[0];
                        this.mergeStates = mergeStates;
                        if (this.mergeState.localSaved == null) {
                            this.needsMerge = false;
                        } else {
                            this.needsMerge = true;
                        }
                    });
                }
            });
        }
    }

    public mergeSave() {
        let game = gameManager.getGame(this.event.year);
        return this.dialogService.open({
            model: {
                state: this.mergeState
            },
            viewModel: game.mergeDialogClass(),
        }).whenClosed(dialogResult => {
            if (!dialogResult.wasCancelled) {
                return game.completeMerge(this.mergeStates).then(() => {
                    this.succeeded = true;
                });
            }
        });
    }

    public simpleSave() {
        this.mergeState.takeFromFile = true;
        let game = gameManager.getGame(this.event.year);
        game.completeMerge(this.mergeStates).then(() => {
            this.succeeded = true;
        });
    }

    public replaceSave() {
        this.mergeState.resolved = true;
        this.mergeState.takeFromFile = true;
        let game = gameManager.getGame(this.event.year);
        game.deleteTeamMatch(this.event.eventCode, this.matchNumber, this.teamNumber).then(() => {
            return game.completeMerge(this.mergeStates);
        }).then(() => {
            this.succeeded = true;
        })
    }

    public static open(dialogService: DialogService, model: ReceiveQrCodeModel) {
        return dialogService.open({ model: model, viewModel: ReceiveQrCodeDialog });
    }
}
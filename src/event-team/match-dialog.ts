import { autoinject } from "aurelia-framework";
import { FrcStatsContext, EventTeamEntity, EventMatchEntity, EventEntity, TeamEntity } from "../persistence";
import { DialogController } from "aurelia-dialog";
import { DialogService } from "aurelia-dialog";
import { ConfirmDialog } from "./confirm-dialog";

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
  public teamExist: boolean;
  public match: EventMatchEntity;
  public teams: string[];
  public isNull: boolean = false;
  public minInput = 1;

  constructor(
    private dbContext: FrcStatsContext,
    private controller: DialogController,
    private dialogService: DialogService
  ){

  }

  activate(model) {
    this.controller.settings.lock = false;
    this.controller.settings.overlayDismiss = true;
    this.teams = model.teams;
    this.match = {
      matchNumber: null,
      year: model.year,
      eventCode: model.eventCode,
      teamNumbers_blue: ["", "",""],
      teamNumbers_red: ["","",""],
    };
  }

  save() {

    this.teamExist = true;
    console.info(this.match);
    this.validate();
    if(this.validate() == true){
      this.dbContext.eventMatches.where(["year", "eventCode", "matchNumber"]).equals([this.match.year, this.match.eventCode, this.match.matchNumber]).first().then(savedMatch => {
        if(savedMatch != null){
          this.match.id = savedMatch.id;
        }
      }).then(() => {
        var promises = this.match.teamNumbers_blue.concat(this.match.teamNumbers_red).map(teamNumber => {
          return this.dbContext.eventTeams.where(["year", "eventCode", "teamNumber"])
            .equals([this.match.year,this.match.eventCode, teamNumber]).first().then(teamEvent => {
              if(teamEvent == null){
                this.teamExist = false;
                this.controller.ok();
                this.dialogService.open({
                  viewModel: ConfirmDialog,
                  model: ["Nonexistant Team Detected", "Team " + teamNumber + " is not in our database."]
                }).whenClosed(dialogResult => {
                  if(! dialogResult.wasCancelled){
                    console.info("Team entered that did not exist.");
                  }
                });
              }
            });
        });
        return Promise.all(promises).then(() => {
          if(this.teamExist == true){
            return Promise.all([
              this.dbContext.eventMatches.put(this.match),
            ]);
            //return promises;
          }
        })
      }).then(() => {
        console.info("dupr I saved");
        this.controller.ok();
      });
    }
    else if(this.validate() == false && this.isNull == false){
      this.controller.ok();
      this.dialogService.open({
        viewModel: ConfirmDialog,
        //Point out that you messed up by inputting a non-existant team as part of an alliance
        model: ["Could Not Save Match!", "Duplicate Teams Found"]
      }).whenClosed(dialogResult => {
        if(! dialogResult.wasCancelled){
          console.info("Silly humans... duplicate entries...");
        }
      })
    }
    else{
      this.controller.ok();
      this.dialogService.open({
        viewModel: ConfirmDialog,
        //Point out that you messed up by inputting non-number values into the match number area
        model: ["Could Not Save Match!", "Improperly Assigned Values Detected"]
      }).whenClosed(dialogResult => {
        if(! dialogResult.wasCancelled){
          console.info("Silly humans... incomplete forms...");
        }
      })
    }
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
    if(this.match.matchNumber <= 0 || isNaN(parseInt(<any>this.match.matchNumber))){ 
      this.isNull = true;
      return false;
    }
    var dict = {};
    for(var i = 0; i < 3; i++){
      dict[this.match.teamNumbers_blue[i]] = i;
      if(this.match.teamNumbers_blue[i] == ""){
        this.isNull = true;
      }
    };
    for(var p = 0; p < 3; p++){
      dict[this.match.teamNumbers_red[p]] = 3 + p;
      if(this.match.teamNumbers_red[p] == ""){
        this.isNull = true;
      }
    };
    for(var test = 0; test < 6; test++){
      if(Object.keys(dict).length != 6){
        return false;
      }
      else{
        return true;
      }
    }
  }
}

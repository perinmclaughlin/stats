import { autoinject } from "aurelia-framework";
import { DialogService, DialogController } from "aurelia-dialog";
import { FrcStatsContext, TeamEntity, EventEntity } from "../../persistence";
import { TbaApi, Team, District } from "../../tba-api";

@autoinject
export class AddTeamDialog {
  teamNumber: string;
  team: TeamEntity;
  hasError = false;
  alreadyAdded = false;
  model: AddTeamDialogInput;
  addWaiting = false;
  lookupWaiting = false;

  constructor(
    private controller: DialogController,
    private tbaApi: TbaApi, 
    private dbContext: FrcStatsContext ) {
  }

  activate(model: AddTeamDialogInput) {
    this.model = model;
    this.controller.settings.lock = false;
  }

  teamNumberLookup() {
    this.lookupWaiting = true;
    this.dbContext.getTeam(this.teamNumber).then(teamLocal => {
      if(teamLocal != null) {
        return teamLocal;
      }else {
        return this.tbaApi.getTeam(this.teamNumber).then(team => {
          return this.dbContext.saveTeam(team, "PNW").then(() => {
            return this.dbContext.getTeam(this.teamNumber);
          })
        });
      }
    }).then(team => {
      this.team = team;
      this.hasError = false;
    }).catch(ex => {
      this.hasError = true;
      console.error(ex);
    }).then(() => {
      this.alreadyAdded = false;
      if(!this.hasError) {
        this.dbContext.eventTeams.where(["year","eventCode","teamNumber"]).equals([this.model.year, this.model.eventCode, this.team.teamNumber]).first(entity => {
          this.alreadyAdded = (entity != null);
        })
      }
    }).finally(() => {
      this.lookupWaiting = false;
    });
  }

  add() {
    let eventTeam = {
      year: this.model.year,
      eventCode: this.model.eventCode,
      teamNumber: this.team.teamNumber
    }

    this.addWaiting = true;
    this.dbContext.eventTeams.put(eventTeam).finally(() => {
      this.addWaiting = false;
      this.alreadyAdded = true;
    });
  }

  public static open(dialogService: DialogService, model: AddTeamDialogInput) {
    return dialogService.open({
      model: model,
      viewModel: AddTeamDialog,
    });
  }
}

export interface AddTeamDialogInput {
  year: string;
  eventCode: string;
}

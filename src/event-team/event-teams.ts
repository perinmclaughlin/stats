import { autoinject } from "aurelia-framework"
import { EventEntity, FrcStatsContext, EventTeamEntity, TeamEntity, EventMatchEntity } from "../persistence";
import { DialogService } from "aurelia-dialog";
import { MatchDialog } from "./match-dialog";
import { ConfirmDialog } from "./confirm-dialog";

@autoinject
export class EventTeams {
  public event: EventEntity;
  public eventMatches: EventMatchEntity[];
  public teams: {team: TeamEntity, eventTeam: EventTeamEntity}[];
  public activeTab: number;

  constructor(
    private dbContext: FrcStatsContext,
    private dialogService: DialogService
  ){
    this.teams = [];
    this.eventMatches = [];
    this.activeTab = 0;
  }
   
  activate(params){
	  this.dbContext.events.where(["year", "eventCode"]).equals([params.year, params.eventCode]).first().then(event => {
		  this.event = event;
    }).then(() => {
      return this.getEventMatches();      
    });
	  return this.dbContext.eventTeams.where(["year", "eventCode"]).equals([params.year, params.eventCode]).toArray().then(eventTeams => {
		  eventTeams.forEach(eventTeam =>{
			  var anotherLine = 0;
			 this.dbContext.teams.where("teamNumber").equals(eventTeam.teamNumber).first().then(team => {
				this.teams.push({team: team, eventTeam: eventTeam});
			 });
		  });
	  });
  }

  
  add()
  {
    this.dialogService.open({
      viewModel: MatchDialog,
      model: ({
        eventCode: this.event.eventCode,
      }),
    }).whenClosed(() => {
      this.getEventMatches()
    });
  }

  getEventMatches(){
    var i = 0;
    return this.dbContext.eventMatches.where(["year", "eventCode"]).equals([this.event.year, this.event.eventCode]).toArray().then(eventMatches => {
      this.eventMatches = eventMatches;
     });
  }

  remove(eventMatch){
    this.dialogService.open({
      viewModel: ConfirmDialog,
      model: "Are you SURE that you want to delete that?",
    }).whenClosed(dialogResult => {
      if(! dialogResult.wasCancelled){
        this.dbContext.eventMatches.delete(eventMatch.id).then(() => {
          this.getEventMatches();
        });
      }
    });
  }
}

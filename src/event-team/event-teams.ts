import { autoinject } from "aurelia-framework"
import { EventEntity, FrcStatsContext, EventTeamEntity, TeamEntity, EventMatchEntity } from "../persistence";
import { DialogService } from "aurelia-dialog";
import { MatchDialog } from "./match-dialog";

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
    });
    this.dbContext.eventMatches.where(["year", "eventCode"]).equals([params.year, params.eventCode]).toArray().then(eventMatches => {
		  this.eventMatches = eventMatches;
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
    });

  }
}

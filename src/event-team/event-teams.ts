import { autoinject } from "aurelia-framework"
import { EventEntity, FrcStatsContext, EventTeamEntity, TeamEntity, EventMatchEntity, TeamMatch2018Entity } from "../persistence";
import { DialogService } from "aurelia-dialog";
import { MatchDialog } from "./match-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import * as naturalSort from "javascript-natural-sort";

@autoinject
export class EventTeams {
  public event: EventEntity;
  public eventMatches: EventMatchEntity[];
  public teams: {team: TeamEntity, eventTeam: EventTeamEntity}[];
  public matches2018: TeamMatch2018Entity[];
  public activeTab: number;

  constructor(
    private dbContext: FrcStatsContext,
    private dialogService: DialogService
  ){
    this.teams = [];
    this.eventMatches = [];
    this.matches2018 = [];
    this.activeTab = 0;
  }
   
  activate(params){
    return this.getEvent(params).then(() => {
      return Promise.all([
        this.getEventMatches(), 
        this.getEventTeams(),
        this.get2018Matches(),
      ]);
    });
  }
  
  add()
  {
    this.dialogService.open({
      viewModel: MatchDialog,
      model: ({
        year: this.event.year,
        eventCode: this.event.eventCode,
        teams: this.teams.map(x => x.team),
      }),
    }).whenClosed(() => {
      this.getEventMatches()
    });
  }

  getEvent(params) {
	  return this.dbContext.events.where(["year", "eventCode"]).equals([params.year, params.eventCode]).first().then(event => {
		  this.event = event;
    });
  }

  getEventTeams() {
	  return this.dbContext.eventTeams.where(["year", "eventCode"]).equals([this.event.year, this.event.eventCode]).toArray().then(eventTeams => {
		  var gettingTeams = eventTeams.map(eventTeam =>{
        return this.dbContext.teams.where("teamNumber").equals(eventTeam.teamNumber)
          .first().then(team => {
            this.teams.push({team: team, eventTeam: eventTeam});
          });
      });

      return Promise.all(gettingTeams).then(() => {
        this.teams.sort((a,b) => naturalSort(a.team.teamNumber, b.team.teamNumber));
      });
    });
  }

  getEventMatches(){
    return this.dbContext.eventMatches.where(["year", "eventCode"]).equals([this.event.year, this.event.eventCode]).toArray().then(eventMatches => {
      this.eventMatches = eventMatches;
      this.eventMatches.sort((a,b) => naturalSort(a.matchNumber, b.matchNumber));
     });
  }

  get2018Matches() {
    return this.dbContext.teamMatches2018.where("eventCode").equals(this.event.eventCode).toArray(matches => {
      this.matches2018 = matches;
      this.matches2018.sort((a, b) => naturalSort(a.matchNumber, b.matchNumber));
    });
  }

  remove(eventMatch){
    this.dialogService.open({
      viewModel: ConfirmDialog,
      model: ["Are you SURE that you want to delete that?", "Press 'OKAY' to confirm"],
    }).whenClosed(dialogResult => {
      if(! dialogResult.wasCancelled){
        this.dbContext.eventMatches.delete(eventMatch.id).then(() => {
          this.getEventMatches();
        });
      }
    });
  }
}

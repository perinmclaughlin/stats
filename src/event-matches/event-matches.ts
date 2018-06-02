import { autoinject } from "aurelia-framework"
import * as naturalSort from "javascript-natural-sort";
import { DialogService } from "aurelia-dialog";
import { 
  EventEntity, FrcStatsContext, EventTeamEntity, 
  TeamEntity, EventMatchEntity, IEventTeamMatch } from "../persistence";
import { MatchDialog } from "./match-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { EventTeamData, MatchData } from "../model";
import { gameManager } from "../games/index";

@autoinject
export class EventMatches {
  public event: EventEntity;
  public eventMatches: EventMatchEntity[];
  public teams: {team: TeamEntity, eventTeam: EventTeamEntity}[];
  public eventTeamMatches: IEventTeamMatch[];
  public activeTab: number;
  public teamsData: EventTeamData[];

  constructor(
    private dbContext: FrcStatsContext,
    private dialogService: DialogService
  ){
    this.teams = [];
    this.eventMatches = [];
    this.eventTeamMatches = [];
    this.activeTab = 0;
  }
   
  activate(params) {
    let game = gameManager.getGame(params.year);

    return this.getEvent(params).then(() => {
      return Promise.all([
        this.getEventMatches(), 
        this.getEventTeams(),
      ]);
    }).then(() => {
      return game.getEventTeamMatches(this.event.eventCode).then(matches => {
        this.eventTeamMatches = matches;
      });
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
        mode: "add",
      }),
    }).whenClosed(() => {
      this.getEventMatches()
    });
  }

  edit(match: EventMatchEntity)
  {
    this.dialogService.open({
      viewModel: MatchDialog,
      model: ({
        year: match.year,
        eventCode: match.eventCode,
        matchNumber: match.matchNumber,
        teams: this.teams.map(x => x.team),
        mode: "edit",
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

  public scouted(eventMatch: EventMatchEntity, teamNumber: string) {
    var result = this.eventTeamMatches.filter(match => 
      match.eventCode == eventMatch.eventCode && 
      match.matchNumber == eventMatch.matchNumber &&
      match.teamNumber == teamNumber).length != 0;

    return result;
  }
}

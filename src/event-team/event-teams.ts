import { autoinject } from "aurelia-framework"
import { EventEntity, FrcStatsContext, EventTeamEntity, TeamEntity, EventMatchEntity, TeamMatch2018Entity } from "../persistence";
import { DialogService } from "aurelia-dialog";
import { MatchDialog } from "./match-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import * as naturalSort from "javascript-natural-sort";
import { EventTeamData, MatchData } from "../model";

@autoinject
export class EventTeams {
  public event: EventEntity;
  public eventMatches: EventMatchEntity[];
  public teams: {team: TeamEntity, eventTeam: EventTeamEntity}[];
  public matches2018: TeamMatch2018Entity[];
  public activeTab: number;
  public teamsData: EventTeamData[];
  public teamSwitch_fail: number;
  public teamScale_fail: number;
  public teamSwitch_success: number;
  public teamScale_success: number;
  public teamScale_total: number;
  public teamSwitch_total: number;
  public teamVault_fail: number;
  public teamVault_success: number;

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
      ]);
    }).then(() => {
      this.get2018Matches();
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
    }).then(() => {
      this.getTeamTotals();
      var i = 0;
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

  getTeamTotals(){
    this.teamsData = [];
    for(var a of this.teams){
      var teamData = new EventTeamData();
      teamData.teamNumber = a.team.teamNumber;
      teamData.eventCode = a.eventTeam.eventCode;
      teamData.year = a.eventTeam.year;
      teamData.foulCount = 0;
      teamData.failureCount = 0;
      this.teamScale_fail = 0;
      this.teamScale_success = 0;
      this.teamScale_total = 0;
      this.teamSwitch_fail = 0;
      this.teamSwitch_success = 0;
      this.teamSwitch_total = 0;
      this.teamVault_fail = 0;
      this.teamVault_success = 0;
      teamData.matchCount = 0;
      teamData.cubeAverage = 0;
      for(var b of this.matches2018){
        if(b.teamNumber == teamData.teamNumber){
          teamData.cubeAverage += b.cubeCount;
          if(b.isFailure){
            teamData.failureCount++;            
          }
          
          var y = parseInt(<any>b.foulCount);
          teamData.foulCount += y;
          teamData.matchCount++;
          if(! b.isScale){
            this.teamScale_fail++;
            this.teamScale_total++;
          }
          else{
            this.teamScale_success++;
            this.teamScale_total++;
          }
          if(! b.isSwitch){
            this.teamSwitch_fail++;
            this.teamSwitch_total++;
          }
          else{
            this.teamSwitch_success++;
            this.teamSwitch_total++;
          }
          if(b.isVault){
            this.teamVault_success++;
          }
          else{
            this.teamVault_fail++;
          }
        }
      }

      if(teamData.matchCount != 0){
        teamData.cubeAverage = teamData.cubeAverage/teamData.matchCount;
      }
      else{
        teamData.cubeAverage = 0;
      }

      if(this.teamScale_fail > this.teamScale_success){
        teamData.scale = "false";
      }
      else if(this.teamScale_fail < this.teamScale_success){
        teamData.scale = "true";
      }
      else if(this.teamScale_fail != 0 && this.teamScale_success != 0){
        teamData.scale = "neutral";
      }
      else{
        teamData.vault = "no data";
      }
      if(this.teamVault_fail > this.teamVault_success){
        teamData.vault = "false";
      }
      else if(this.teamVault_fail < this.teamVault_success){
        teamData.vault = "true";
      }
      else if(this.teamVault_fail != 0 && this.teamVault_success != 0){
        teamData.vault = "neutral";
      }
      else{
        teamData.vault = "no data";
      }
      if(this.teamSwitch_fail > this.teamSwitch_success){
        teamData.switch_cap = "false";
      }
      else if(this.teamSwitch_fail < this.teamSwitch_success){
        teamData.switch_cap = "true";
      }
      else if(this.teamSwitch_fail != 0 && this.teamSwitch_success != 0){
        teamData.switch_cap = "neutral";
      }
      else{
        teamData.vault = "no data";
      }

      //teamData.

      this.teamsData.push(teamData);
    }
  }
}

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
      teamData.scaleCount = 0;
      teamData.switchCount = 0;
      teamData.vaultCount = 0;
      teamData.climbCount = 0;
      teamData.liftCount = 0;
      for(var b of this.matches2018){
        if(b.teamNumber == teamData.teamNumber){
          teamData.cubeAverage += b.cubeCount;
          if(b.isFailure){
            teamData.failureCount++;            
          }
          
          teamData.matchCount++;

          teamData.scaleCount += parseInt(<any>b.scaleCount);
          teamData.switchCount += parseInt(<any>b.allySwitchCount);
          teamData.switchCount += parseInt(<any>b.oppoSwitchCount);

          teamData.vaultCount += parseInt(<any>b.vaultCount);

          if(b.climbed) {
            teamData.climbCount ++;
          }

          if(b.lifted) {
            teamData.liftCount += b.lifted.length;
          }
          /*
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
          */
        }
      }

      if(teamData.matchCount == 0) {
        teamData.scaleAvg = 0;
        teamData.switchAvg = 0;
        teamData.vaultAvg = 0;
        teamData.climbAvg = 0;
        teamData.liftAvg = 0;
      }else {
        teamData.scaleAvg = teamData.scaleCount / teamData.matchCount;
        teamData.switchAvg = teamData.switchCount / teamData.matchCount;
        teamData.vaultAvg = teamData.vaultCount / teamData.matchCount;
        teamData.climbAvg = teamData.climbCount / teamData.matchCount;
        teamData.liftAvg = teamData.liftCount / teamData.matchCount;
      }

      if(teamData.matchCount != 0){
        teamData.cubeAverage = teamData.cubeAverage/teamData.matchCount;
      }
      else{
        teamData.cubeAverage = 0;
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
        teamData.vault = "";
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
        teamData.vault = "";
      }

      //teamData.

      this.teamsData.push(teamData);
    }
  }

  public scouted(eventMatch: EventMatchEntity, teamNumber: string) {
    var result = this.matches2018.filter(match => 
      match.eventCode == eventMatch.eventCode && 
      match.matchNumber == eventMatch.matchNumber &&
      match.teamNumber == teamNumber).length != 0;

    return result;
  }

  public sortByTeamNumber() {
    this.teamsData.sort((a,b) => naturalSort(a.teamNumber, b.teamNumber));
  }

  public sortByScale() {
    this.teamsData.sort((a, b) => b.scaleAvg - a.scaleAvg);
  }

  public sortBySwitch() {
    this.teamsData.sort((a, b) => b.switchAvg - a.switchAvg);
  }

  public sortByVault() {
    this.teamsData.sort((a, b) => b.vaultAvg - a.vaultAvg);
  }

  public sortByClimb() {
    this.teamsData.sort((a, b) => b.climbAvg - a.climbAvg);
  }

  public sortByLift() {
    this.teamsData.sort((a, b) => b.liftAvg - a.liftAvg);
  }
}

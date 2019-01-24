import { autoinject } from "aurelia-framework"
import { DialogService } from "aurelia-dialog";
import * as naturalSort from "javascript-natural-sort";
import { EventEntity, FrcStatsContext, EventTeamEntity, TeamEntity, EventMatchEntity, TeamMatch2018Entity } from "../../persistence";
import { EventTeamData, MatchData } from "../../model";
import { AddTeamDialog } from "./add-team-dialog";
import { gameManager } from "../index";

@autoinject
export class EventTeams {
  public event: EventEntity;
  public eventMatches: EventMatchEntity[];
  public teams: {team: TeamEntity, eventTeam: EventTeamEntity}[];
  public matches2018: TeamMatch2018Entity[];
  public activeTab: number;
  public teamsData: EventTeamData[];
  public gameName: string;

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
    let game = gameManager.getGame(params.year);
    this.gameName = game.name;
    return this.getEvent(params).then(() => {
      return Promise.all([
        this.getEventMatches(), 
        this.getEventTeams(),
      ]);
    }).then(() => {
      this.get2018Matches();
    });
  }
  
  getEvent(params) {
	  return this.dbContext.getEvent(params.year, params.eventCode).then(event => {
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

  getTeamTotals(){
    this.teamsData = [];
    for(var a of this.teams){
      var teamData = new EventTeamData();
      teamData.teamName = a.team.teamName;
      teamData.teamNumber = a.team.teamNumber;
      teamData.eventCode = a.eventTeam.eventCode;
      teamData.year = a.eventTeam.year;
      teamData.foulCount = 0;
      teamData.failureCount = 0;
      teamData.matchCount = 0;
      teamData.scaleCount = 0;
      teamData.switchCount = 0;
      teamData.vaultCount = 0;
      teamData.climbCount = 0;
      teamData.liftCount = 0;
      teamData.autoSwitchCount = 0;
      teamData.autoScaleCount = 0;
      teamData.autoLineCount = 0;
      teamData.scaleMax = 0;
      teamData.scaleAvg2 = 0;
      teamData.scaleCount2 = 0;
      teamData.scaleSum2 = 0;
      for(var b of this.matches2018){
        if(b.teamNumber == teamData.teamNumber){
          teamData.cubeAverage += b.cubeCount;
          if(b.isFailure){
            teamData.failureCount++;            
          }
          if(b.isFoul) {
            teamData.foulCount++;
          }
          
          teamData.matchCount++;

          let scaleCount = parseInt(<any>b.scaleCount);
          teamData.scaleCount += scaleCount;
          if(teamData.scaleMax < scaleCount) {
              teamData.scaleMax = scaleCount;
          }
          if(scaleCount != 0) {
            teamData.scaleCount2 ++;
            teamData.scaleSum2 += scaleCount;
          }
          teamData.switchCount += parseInt(<any>b.allySwitchCount);
          teamData.switchCount += parseInt(<any>b.oppoSwitchCount);

          teamData.vaultCount += parseInt(<any>b.vaultCount);

          teamData.autoSwitchCount += parseInt(<any>b.autoSwitchCount) || 0;
          teamData.autoScaleCount += parseInt(<any>b.autoScaleCount) || 0;

          if(b.autoCrossedLine) {
            teamData.autoLineCount ++;
          }

          if(b.climbed) {
            teamData.climbCount ++;
          }

          if(b.lifted) {
            teamData.liftCount += b.lifted.length;
          }
        }
      }

      if(teamData.matchCount == 0) {
        teamData.scaleAvg = 0;
        teamData.scaleWeighted = 0;
        teamData.switchAvg = 0;
        teamData.vaultAvg = 0;
        teamData.climbAvg = 0;
        teamData.liftAvg = 0;
      }else {
        teamData.scaleAvg = teamData.scaleCount / teamData.matchCount;
        if(teamData.scaleCount2 != 0) {
          teamData.scaleAvg2 = teamData.scaleSum2 / teamData.scaleCount2;
        }
        
        teamData.scaleWeighted = teamData.scaleMax * 0.4 + teamData.scaleAvg * 0.6;
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

      this.teamsData.push(teamData);
    }
  }

  public sortByTeamNumber() {
    this.teamsData.sort((a,b) => naturalSort(a.teamNumber, b.teamNumber));
  }

  public sortByScale() {
    this.teamsData.sort((a, b) => b.scaleAvg - a.scaleAvg);
  }
  public sortByScale2() {
    
    this.teamsData.sort((a, b) => b.scaleAvg2 - a.scaleAvg2);
  }
  public sortByScaleWeighted() {
    this.teamsData.sort((a, b) => b.scaleWeighted - a.scaleWeighted);
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

  public sortByAutoSwitch() {
    this.teamsData.sort((a, b) => b.autoSwitchCount - a.autoSwitchCount);
  }

  public sortByAutoScale() {
    this.teamsData.sort((a, b) => b.autoScaleCount - a.autoScaleCount);
  }

  public sortByAutoLine() {
    this.teamsData.sort((a, b) => b.autoLineCount - a.autoLineCount);
  }


  public addTeams() {
    AddTeamDialog.open(this.dialogService, {
      year: this.event.year,
      eventCode: this.event.eventCode,
    });
  }
}

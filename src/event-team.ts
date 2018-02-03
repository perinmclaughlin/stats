import {EventTeamData, MatchData} from "./model";
import {TeamEntity, FrcStatsContext} from "./persistence";
import {autoinject} from "aurelia-framework";

@autoinject
export class EventTeam {
  public team: TeamEntity;
  public matches: MatchData[];
  constructor(private dbContext: FrcStatsContext){
    this.matches = [];
    var match = new MatchData();
    match.teamNumber = "2345";
    match.isFailure = false;
    match.failureReason = "No failures.";
    match.isSwitch = true;
    match.isScale = true;
    match.isVault = true;
    match.isFoul = false;
    match.eventCode = "wayak";
    match.foulCount = "0";
    match.foulReason = "No fouls.";
    match.cubeCount = "9001";
    match.matchNumber = "1";
    /* var team = new EventTeamData();
    team.teamNumber = "1234";
    team.matchCount = 1;
    team.failureCount = 2;
    team.scale = true;
    team.switch_cap = true;
    team.vault = false;
    team.foulCount = 3;
    team.cubeAverage = 4;
    team.year = "2018"; */
    this.matches.push(match);
    //this.team = team;
  }
  
  activate(params){
	  var i = 0;
	  return this.dbContext.teams.where("teamNumber").equals(params.teamNumber).first().then(team =>{
		  this.team = team;
	  });
  }
}

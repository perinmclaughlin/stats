import { autoinject } from "aurelia-framework";
import { MatchData } from "./model";
import { TeamEntity, FrcStatsContext } from "./persistence";

@autoinject
export class EventTeam {
  public team: TeamEntity;
  public matches: MatchData[];
  public activeTab: number = 0;

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
    this.matches.push(match);
  }
  
  activate(params){
	  return this.dbContext.teams.where("teamNumber").equals(params.teamNumber).first().then(team => {
		  this.team = team;
	  });
  }
}

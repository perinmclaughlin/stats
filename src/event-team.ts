import { autoinject } from "aurelia-framework";
import { MatchData } from "./model";
import { TeamEntity, FrcStatsContext, TeamMatch2018Entity } from "./persistence";

@autoinject
export class EventTeam {
  public team: TeamEntity;
  public matches: MatchData[];
  public activeTab: number = 0;
  public cubeTotal: number = 0;
  public matchTotal: number = 0;
  public foulTotal: number = 0;
  public testData : TeamMatch2018Entity[] = [
    {
      eventCode: "wayak",
      teamNumber: "3223",
      matchNumber: 1,
      isFailure: false,
      failureReason: "No failure.",
      isSwitch: true,
      isScale: true,
      isVault: true,
      isFoul: false,
      foulCount: 0,
      foulReason: "No fouls.",
      cubeCount: 9000
    },
    {
      eventCode: "wayak",
      teamNumber: "3223",
      matchNumber: 2,
      isFailure: false,
      failureReason: "No failure.",
      isSwitch: true,
      isScale: true,
      isVault: true,
      isFoul: false,
      foulCount: 0,
      foulReason: "No fouls.",
      cubeCount: 9001
    }
  ];

  constructor(private dbContext: FrcStatsContext){
    this.matches = [];
    

    // var match = new MatchData();
    // match.teamNumber = "2345";
    // match.isFailure = false;
    // match.failureReason = "No failures.";
    // match.isSwitch = true;
    // match.isScale = true;
    // match.isVault = true;
    // match.isFoul = false;
    // match.eventCode = "wayak";
    // match.foulCount = "0";
    // match.foulReason = "No fouls.";
    // match.cubeCount = "9001";
    // match.matchNumber = "1";
    // this.matches.push(match);
    this.calculate();
  }
  
  calculate(){
    for(var i = 0; i < this.testData.length; i++)
    {
      this.cubeTotal += this.testData[i].cubeCount;
      this.matchTotal++;
      this.foulTotal += this.testData[i].foulCount;
    }
    //return(this.cubeTotal, this.matchTotal, this.foulTotal);
  }

  activate(params){
	  return this.dbContext.teams.where("teamNumber").equals(params.teamNumber).first().then(team => {
		  this.team = team;
    });
  }
}

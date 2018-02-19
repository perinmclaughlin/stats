import { autoinject } from "aurelia-framework";
import { MatchData } from "../model";
import { TeamEntity, FrcStatsContext, EventMatchEntity, EventTeamEntity, TeamMatch2018Entity } from "../persistence";
import * as naturalSort from "javascript-natural-sort";

@autoinject
export class EventTeam {
  public team: TeamEntity;
  public eventTeam: EventTeamEntity;
  public matches2018: TeamMatch2018Entity[];
  public eventMatches: EventMatchEntity[];
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
    this.matches2018 = [];
    this.calculate();
  }
  
  calculate(){
    for(var i = 0; i < this.testData.length; i++)
    {
      this.cubeTotal += this.testData[i].cubeCount;
      this.matchTotal++;
      this.foulTotal += this.testData[i].foulCount;
    }
  }

  activate(params){
	  var gettingTeam = this.getTeam(params);
    var gettingTeamEvent = this.getEventTeam(params);
    return Promise.all([gettingTeam, gettingTeamEvent]).then(() => {
      return Promise.all([this.getEventMatches(), this.getMatchData()]);
    }).then(() => {
      var i = this;
    });
  }

  getTeam(params) {
	  return this.dbContext.teams.where("teamNumber").equals(params.teamNumber).first().then(team => {
		  this.team = team;
    });
  }

  getEventTeam(params) {
    return this.dbContext.eventTeams.where(["year", "eventCode", "teamNumber"])
      .equals([params.year, params.eventCode, params.teamNumber]).first()
      .then(eventTeam => {
        this.eventTeam = eventTeam;
      });
  }

  getEventMatches(){
    var i = 0;
    this.eventMatches = [];
    return this.dbContext.eventMatches.where(["year", "eventCode"]).equals([this.eventTeam.year, this.eventTeam.eventCode]).toArray()
      .then(eventMatches => {
        for(var eventMatch of eventMatches) {
          if(eventMatch.teamNumbers_blue.concat(eventMatch.teamNumbers_red).indexOf(this.eventTeam.teamNumber) != -1) {
            this.eventMatches.push(eventMatch);
          }
        }
        this.eventMatches.sort((a,b) => naturalSort(a.matchNumber, b.matchNumber));
      });
  }

  getMatchData() {
    if(this.eventTeam.year == "2018") {
      return this.dbContext.teamMatches2018.where(["eventCode", "teamNumber"])
        .equals([this.eventTeam.eventCode, this.eventTeam.teamNumber]).toArray()
        .then(matches2018 => {
          this.matches2018 = matches2018;
          this.matches2018.sort((a,b) => naturalSort(a.matchNumber, b.matchNumber));
        })
    }
  }
}

import { autoinject } from "aurelia-framework";
import * as naturalSort from "javascript-natural-sort";

import { MatchData } from "../../model";
import { 
  TeamEntity, FrcStatsContext, 
  EventMatchEntity, EventTeamEntity, EventEntity,
  TeamMatch2018Entity 
} from "../../persistence";

@autoinject
export class EventTeam {
  public team: TeamEntity;
  public eventTeam: EventTeamEntity;
  public event: EventEntity;
  public matches2018: TeamMatch2018Entity[];
  public eventMatches: EventMatchEntity[];
  public activeTab: number = 0;
  public cubeTotal: number = 0;
  public matchTotal: number = 0;
  public foulTotal: number = 0;

  constructor(private dbContext: FrcStatsContext){
    this.matches2018 = [];
  }
  
  activate(params){
	  var gettingTeam = this.getTeam(params);
    var gettingTeamEvent = this.getEventTeam(params);
    var gettingEvent = this.getEvent(params);
    return Promise.all([gettingTeam, gettingTeamEvent]).then(() => {
      return Promise.all([this.getEventMatches(), this.getMatchData()]);
    }).then(() => {
      var i = this;
    });
  }

  getTeam(params) {
	  return this.dbContext.teams
      .where("teamNumber")
      .equals(params.teamNumber).first()
      .then(team => {
        this.team = team;
      });
  }

  getEvent(params) {
    return this.dbContext.events
      .where(["year", "eventCode"])
      .equals([params.year, params.eventCode ]).first()
      .then(evnt => {
        this.event = evnt;
      });
  }
  
  getEventTeam(params) {
    return this.dbContext.eventTeams
      .where(["year", "eventCode", "teamNumber"])
      .equals([params.year, params.eventCode, params.teamNumber]).first()
      .then(eventTeam => {
        this.eventTeam = eventTeam;
      });
  }

  getEventMatches(){
    var i = 0;
    this.eventMatches = [];
    return this.dbContext.eventMatches
      .where(["year", "eventCode"])
      .equals([this.eventTeam.year, this.eventTeam.eventCode]).toArray()
      .then(eventMatches => {
        for(var eventMatch of eventMatches) {
          if(
            eventMatch.blue1 == this.eventTeam.teamNumber || 
            eventMatch.blue2 == this.eventTeam.teamNumber || 
            eventMatch.blue3 == this.eventTeam.teamNumber || 
            eventMatch.red1  == this.eventTeam.teamNumber || 
            eventMatch.red2  == this.eventTeam.teamNumber || 
            eventMatch.red3  == this.eventTeam.teamNumber 
          ) {
            this.eventMatches.push(eventMatch);
          }
        }
        this.eventMatches.sort((a,b) => naturalSort(a.matchNumber, b.matchNumber));
      });
  }

  getMatchData() {
    if(this.eventTeam.year == "2018") {
      return this.dbContext.teamMatches2018
        .where(["eventCode", "teamNumber"])
        .equals([this.eventTeam.eventCode, this.eventTeam.teamNumber]).toArray()
        .then(matches2018 => {
          this.matches2018 = matches2018;
          this.matches2018.sort((a,b) => naturalSort(a.matchNumber, b.matchNumber));
        })
    }
  }
}

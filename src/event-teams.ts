import {EventTeamData} from "./model";
import { EventEntity, FrcStatsContext, EventTeamEntity, TeamEntity, EventMatchEntity } from "./persistence";
import {autoinject} from "aurelia-framework"

@autoinject
export class EventTeams {
  public event: EventEntity;
  public eventMatches: EventMatchEntity[];
  public teams: {team: TeamEntity, eventTeam: EventTeamEntity}[];
  constructor(private dbContext: FrcStatsContext){
    /* this.event = {
      code: "wayak",
      name: "Sundome",
      districtCode: "PNW",
      year: "2018",

    }; */
    this.teams = [];
    /* var team = new EventTeamData();
    team.teamNumber = "1234";
    team.matchCount = 1;
    team.failureCount = 2;
    team.scale = true;
    team.switch_cap = true;
    team.vault = false;
    team.foulCount = 3;
    team.cubeAverage = 4;
    team.eventCode = "wayak";
    this.teams.push(team); */
    this.eventMatches[0].
  }
   
  activate(params){
	  var i = 0;
	  this.dbContext.events.where(["year", "eventCode"]).equals([params.year, params.eventCode]).first().then(event =>{
		  var linesForDays2 = 0;
		  this.event = event;
    });
    this.dbContext.eventMatches.where(["year", "eventCode"]).equals([params.year, params.eventCode]).toArray().then(eventMatches =>{
		  var linesForDays = 0;
		  this.eventMatches = eventMatches;
	  });
	  return this.dbContext.eventTeams.where(["year", "eventCode"]).equals([params.year, params.eventCode]).toArray().then(eventTeams =>{
		  //this.team = team;
		  var thisLine = 0;
		  eventTeams.forEach(eventTeam =>{
			  var anotherLine = 0;
			 this.dbContext.teams.where("teamNumber").equals(eventTeam.teamNumber).first().then(team =>{
				this.teams.push({team: team, eventTeam: eventTeam});
			 });
			  
		  });
		  
		  var lllll = 0;
	  });
  }
}

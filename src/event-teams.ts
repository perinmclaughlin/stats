import {EventTeamData} from "./model";
import { EventEntity } from "./persistence";

export class EventTeams {
  public event: EventEntity;
  public teams: EventTeamData[];
  constructor(){
    this.event = {
      code: "wayak",
      name: "Sundome",
      districtCode: "PNW",
      year: "2018",

    };
    this.teams = [];
    var team = new EventTeamData();
    team.teamNumber = "1234";
    team.matchCount = 1;
    team.failureCount = 2;
    team.scale = true;
    team.switch_cap = true;
    team.vault = false;
    team.foulCount = 3;
    team.cubeAverage = 4;
    team.eventCode = "wayak";
    this.teams.push(team);
  }
}

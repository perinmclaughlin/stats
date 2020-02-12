import { autoinject } from "aurelia-framework";
import { FrcStatsContext, EventEntity, GameEntity } from "../../persistence";
import { RechargeEventJson } from "./model";

@autoinject
export class JsonExporter {
  constructor(
    private dbContext: FrcStatsContext) {
  }

  public async eventToJson(event: EventEntity): Promise<RechargeEventJson> {
    let json = {
      teams: [],
      eventTeams: [],
      event: event,
      eventMatches: [],
      matches2020: [],
    };

    let eventTeams = await this.dbContext.getEventTeams(event.year, event.eventCode);
    json.eventTeams = eventTeams;
    let teams = await Promise.all(eventTeams.map(eventTeam => this.dbContext.getTeam(eventTeam.teamNumber)));
    json.teams = teams;

    let eventMatches = await this.dbContext.getEventMatches(event.year, event.eventCode);
    json.eventMatches = eventMatches;

    let matches2020Promise = Promise.resolve("yup");
    if(event.year == "2020") {
        let matches2020 = await this.dbContext.getTeamMatches2020({eventCode: event.eventCode});
        json.matches2020 = matches2020;
    }
    return json;
  }
}

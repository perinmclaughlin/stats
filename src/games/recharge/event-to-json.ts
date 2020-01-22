import { autoinject } from "aurelia-framework";
import { FrcStatsContext, EventEntity, GameEntity } from "../../persistence";
import { DeepSpaceEventJson } from "./model";

@autoinject
export class JsonExporter {
  constructor(
    private dbContext: FrcStatsContext) {
  }

  public async eventToJson(event: EventEntity): Promise<DeepSpaceEventJson> {
    let json = {
      teams: [],
      eventTeams: [],
      event: event,
      eventMatches: [],
      matches2019: [],
    };

    let eventTeams = await this.dbContext.getEventTeams(event.year, event.eventCode);
    json.eventTeams = eventTeams;
    let teams = await Promise.all(eventTeams.map(eventTeam => this.dbContext.getTeam(eventTeam.teamNumber)));
    json.teams = teams;

    let eventMatches = await this.dbContext.getEventMatches(event.year, event.eventCode);
    json.eventMatches = eventMatches;

    let matches2019Promise = Promise.resolve("yup");
    if(event.year == "2019") {
        let matches2019 = await this.dbContext.getTeamMatches2019({eventCode: event.eventCode});
        json.matches2019 = matches2019;
    }
    return json;
  }
}

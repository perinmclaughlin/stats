import { autoinject } from "aurelia-framework";
import { FrcStatsContext, EventEntity, GameEntity } from "../../persistence";
import { PowerupEventJson } from "./model";

@autoinject
export class JsonExporter {
  constructor(
    private dbContext: FrcStatsContext) {
  }

  public eventToJson(event: EventEntity): Promise<PowerupEventJson> {
    let json = {
      teams: [],
      eventTeams: [],
      event: event,
      eventMatches: [],
      matches2018: [],
    };

    let teamsPromise = this.dbContext.eventTeams
      .where(["year", "eventCode"])
      .equals([event.year, event.eventCode]).toArray()
      .then(eventTeams => {

        json.eventTeams = eventTeams;
        return Promise.all(eventTeams.map(eventTeam => this.dbContext.teams.where("teamNumber").equals(eventTeam.teamNumber).first()));
      }).then(teams => {
        json.teams = teams;
      });

    let eventMatchesPromise = this.dbContext.eventMatches
      .where(["year", "eventCode"])
      .equals([event.year, event.eventCode]).toArray()
      .then(eventMatches => {
        json.eventMatches = eventMatches;
      });

    let matches2018Promise = Promise.resolve("yup");
    if(event.year == "2018") {
      matches2018Promise = this.dbContext.teamMatches2018
        .where("eventCode")
        .equals(event.eventCode).toArray()
        .then(matches2018 => {
          json.matches2018 = matches2018;
        }).then(() => "yup");
    }

    return Promise.all([teamsPromise, eventMatchesPromise, matches2018Promise]).then(() => {
      return json;
    });
  }
}

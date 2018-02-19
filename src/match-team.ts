import { autoinject } from "aurelia-framework";
import { MatchData } from "./model";
import { FrcStatsContext, TeamMatch2018Entity, make2018match } from "./persistence";

@autoinject
export class MatchTeamPage {
  public model: TeamMatch2018Entity;

  constructor(private dbContext: FrcStatsContext){
  }

  public activate(params) {
    return this.load(params);
  }

  public load(params) {
    this.dbContext.teamMatches2018.where(['eventCode', 'teamNumber', 'matchNumber'])
      .equals([params.eventCode, params.teamNumber, params.matchNumber]).first()
    .then(match => {
      if(match == null) {
        match = make2018match(params.eventCode, params.teamNumber, params.matchNumber);
      }

      this.model = match;
    });
  }

  public click() {
    console.info(this.model);

    this.dbContext.teamMatches2018.where(['eventCode', 'teamNumber', 'matchNumber'])
      .equals([this.model.eventCode, this.model.teamNumber, this.model.matchNumber]).first()
    .then(savedMatch => {
      if(savedMatch != null) {
        this.model.id = savedMatch.id;
      }
    }).then(() => {
      return this.dbContext.teamMatches2018.put(this.model);
    }).then(() => {
      return this.load(this.model);
    });
  }
}

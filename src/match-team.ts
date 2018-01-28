import { autoinject } from "aurelia-framework";
import { MatchData } from "./model";
import { FrcStatsContext } from "./persistence";

@autoinject
export class MatchTeamPage {
  public model: MatchData;

  constructor(private dbContext: FrcStatsContext){
    this.model = new MatchData();
    this.model.year = "2018";
    this.model.eventCode = "wayak";
  }

  public activate(params) {
  }

  public click() {
    console.info(this.model);
  }
}

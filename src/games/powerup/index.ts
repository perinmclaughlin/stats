import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import * as naturalSort from "javascript-natural-sort";

import { IGame, gameManager } from "../index";
import { Match2018MergeDialog } from "./merge-dialog";
import { FrcStatsContext } from "../../persistence";
import { JsonExporter } from "./event-to-json";

@autoinject
class PowerupGame implements IGame {
  public gameCode = "2018";
  public year = "2018";
  public name = "FIRST POWER UP";
  public matchInputModule = PLATFORM.moduleName("games/powerup/match-input");
  public eventTeamsModule = PLATFORM.moduleName("games/powerup/event-teams");
  public eventTeamModule = PLATFORM.moduleName("games/powerup/event-team");

  constructor(
    private dbContext: FrcStatsContext,
    private jsonExporter: JsonExporter) {
  }

  mergeDialogClass() {
    return Match2018MergeDialog;
  }

  exportEventJson(event) {
    return this.jsonExporter.eventToJson(event);
  }

  getEventTeamMatches(eventCode) {
    return this.dbContext.teamMatches2018.where("eventCode").equals(eventCode).toArray(matches => {
      matches.sort((a, b) => naturalSort(a.matchNumber, b.matchNumber));
      return matches;
    });
  }
}

export function configure(config) {
  var game = config.container.get(PowerupGame);
  gameManager.registerGame(game);
}

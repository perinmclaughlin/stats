import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import * as naturalSort from "javascript-natural-sort";

import { IGame, gameManager } from "../index";
import { Match2018V2MergeDialog } from "./merge-dialog";
import { FrcStatsContext } from "../../persistence";
import { JsonExporter } from "./event-to-json";

@autoinject
class PowerupV2Game implements IGame {
  public gameCode = "2018v2";
  public year = "2018";
  public name = "FIRST POWER UP (v2)";
  public matchInputModule = PLATFORM.moduleName("games/powerupv2/match-input");
  public eventTeamsModule = PLATFORM.moduleName("games/powerupv2/event-teams");
  public eventTeamModule = PLATFORM.moduleName("games/powerupv2/event-team");

  constructor(
    private jsonExporter: JsonExporter,
    private dbContext: FrcStatsContext) {
  }

  mergeDialogClass() {
    return Match2018V2MergeDialog;
  }

  exportEventJson(event) {
    return this.jsonExporter.eventToJson(event);
  }

  getEventTeamMatches(eventCode) {
    return this.dbContext.teamMatches2018V2.where("eventCode").equals(eventCode).toArray(matches => {
      matches.sort((a, b) => naturalSort(a.matchNumber, b.matchNumber));
      return matches;
    });
  }
}

export function configure(config) {
  var game = config.container.get(PowerupV2Game);
  gameManager.registerGame(game);
}

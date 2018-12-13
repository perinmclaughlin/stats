import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import * as naturalSort from "javascript-natural-sort";

import { IGame, gameManager, IMergeState } from "../index";
import { validateEventTeamMatches } from "../merge-utils";
import { Match2018V2MergeDialog } from "./merge-dialog";
import { FrcStatsContext, EventMatchSlots, EventMatchEntity } from "../../persistence";
import { JsonExporter } from "./event-to-json";
import { PowerupV2EventJson } from "./model";

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

  exportEventJson(event): Promise<PowerupV2EventJson> {
    return this.jsonExporter.eventToJson(event);
  }

  setJsonEventTeamMatch(json: any, match){
    json['matches2018'] = [match];
  }

  getEventTeamMatches(eventCode) {
    return this.dbContext.teamMatches2018V2.where("eventCode").equals(eventCode).toArray(matches => {
      matches.sort((a, b) => naturalSort(a.matchNumber, b.matchNumber));
      return matches;
    });
  }

  clearIds(json: PowerupV2EventJson) {
    json.matches2018.forEach(x => delete x.id);
  }
  
  beginMerge(json: PowerupV2EventJson): Promise<IMergeState[]> {
    return Promise.resolve([]);
  }

  completeMerge(matches2018Merge: IMergeState[]): Promise<any> {
    return Promise.resolve("yup");
  }

  getTables(): any[] {
    return [this.dbContext.teamMatches2018V2];
  }

  importSimple(json: PowerupV2EventJson): Promise<any> {
    return this.dbContext.teamMatches2018V2.bulkPut(json.matches2018);
  }

  deleteEvent(json: PowerupV2EventJson): Promise<any> {
    return this.dbContext.teamMatches2018V2
    .where("eventCode")
    .equals(json.event.eventCode).toArray()
    .then(localMatches => {
      return this.dbContext.teamMatches2018V2.bulkDelete(localMatches.map(x => x.id));
    });
  }

  validateEventTeamMatches(json: any) {
    return validateEventTeamMatches(json, json.matches2018, "matches2018");
  }
  
  updateMatch(match: EventMatchEntity, oldMatchNumber: string): Promise<any> {
    throw new Error("implement");
  }

  deleteMatch(eventCode: string, oldMatchNumber: string): Promise<any> {
    throw new Error("implement");
  }

  deleteTeamMatch(eventCode: string, oldMatchNumber: string, teamNumber: string): Promise<any> {
    throw new Error("implement");
  }
}

export function configure(config) {
  var game = config.container.get(PowerupV2Game);
  gameManager.registerGame(game);
}

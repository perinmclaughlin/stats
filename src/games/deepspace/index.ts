import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import * as naturalSort from "javascript-natural-sort";

import { IGame, gameManager, IEventJson, IMergeState } from "../index";
import { validateEventTeamMatches, getTeamNumbers } from "../merge-utils";
import { FrcStatsContext, EventMatchEntity, IEventTeamMatch } from "../../persistence";

export interface DeepSpaceEventJson extends IEventJson{
}

export interface Match2019MergeState extends IMergeState{
}

@autoinject
class DeepSpaceGame implements IGame {
  public gameCode = "2019";
  public year = "2019";
  public name = "FIRST DEEP SPACE";
  public matchInputModule = PLATFORM.moduleName("games/deepspace/match-input");
  public eventTeamsModule = PLATFORM.moduleName("games/deepspace/event-teams");
  public eventTeamModule = PLATFORM.moduleName("games/deepspace/event-team");

  constructor(
    private dbContext: FrcStatsContext,
    private jsonExporter: any) {
  }

  mergeDialogClass() {
    return null;
  }

  exportEventJson(event): Promise<DeepSpaceEventJson> {
    throw new Error("implement");
  }

  setJsonEventTeamMatch(json: any, match) {
    json['matches2019'] = [match];
  }

  getEventTeamMatches(eventCode): Promise<IEventTeamMatch[]> {
    return Promise.resolve([]);
  }

  clearIds(json: DeepSpaceEventJson) {
    throw new Error("implement");
  }

  beginMerge(json: DeepSpaceEventJson): Promise<Match2019MergeState[]> {
    throw new Error("implement");
  }

  completeMerge(matches2018Merge: Match2019MergeState[]): Promise<any> {
    throw new Error("implement");
  }

  getTables(): any[] {
    throw new Error("implement");
  }

  importSimple(json: DeepSpaceEventJson): Promise<any> {
    throw new Error("implement");
  }

  deleteEvent(json: DeepSpaceEventJson): Promise<any> {
    throw new Error("implement");
  }

  validateEventTeamMatches(json: any): string[] {
    throw new Error("implement");
  }

  updateMatch(matchP: EventMatchEntity, oldMatchNumber: string): Promise<any> {
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
  var game = config.container.get(DeepSpaceGame);
  gameManager.registerGame(game);
}


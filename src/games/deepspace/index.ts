import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import * as naturalSort from "javascript-natural-sort";

import { IGame, gameManager, IEventJson, IMergeState } from "../index";
import { validateEventTeamMatches, getTeamNumbers } from "../merge-utils";
import { FrcStatsContext, EventMatchEntity, IEventTeamMatch, TeamMatch2019Entity, EventEntity } from "../../persistence";
import { JsonExporter } from "./event-to-json";
import { Match2019MergeState } from "./model";
import { Match2019MergeDialog } from "./merge-dialog";

export interface DeepSpaceEventJson extends IEventJson{
  matches2019: TeamMatch2019Entity[]
}

@autoinject
class DeepSpaceGame implements IGame {
  public gameCode = "2019";
  public year = "2019";
  public name = "DEEP SPACE";
  public matchInputModule = PLATFORM.moduleName("games/deepspace/match-input");
  public eventTeamsModule = PLATFORM.moduleName("games/deepspace/event-teams");
  public eventTeamModule = PLATFORM.moduleName("games/deepspace/event-team");
  public eventMatchModule = PLATFORM.moduleName("game/deepspace/hermes");

  constructor(
    private dbContext: FrcStatsContext,
    private jsonExporter: JsonExporter) {
  }

  mergeDialogClass() {
    return Match2019MergeDialog;
  }

  async exportEventJson(event): Promise<DeepSpaceEventJson> {
    //throw new Error("implement");
    return await this.jsonExporter.eventToJson(event);
  }

  setJsonEventTeamMatch(json: any, match) {
    json['matches2019'] = [match];
  }

  getEventTeamMatches(eventCode): Promise<IEventTeamMatch[]> {
    return this.dbContext.getTeamMatches2019({ eventCode: eventCode }).then(matches => {
      matches.sort((a, b) => naturalSort(a.matchNumber, b.matchNumber));
      return matches;
    });
  }

  clearIds(json: DeepSpaceEventJson) {
    json.matches2019.forEach(x => delete x.id);
  }

  async beginMerge(json: DeepSpaceEventJson): Promise<Match2019MergeState[]> {
    if (json.event.year != this.gameCode) {
      throw new Error("invalid json mergement");
    }
    let matches2019Merge = [];
    const fromDbMatches2019 = await this.dbContext.getTeamMatches2019({ eventCode: json.event.eventCode });
    ;
    fromDbMatches2019.forEach(match2019 => {
      let state = Match2019MergeState.makeFromDb(match2019);
      state.localSaved = match2019;
      matches2019Merge.push(state);
    });
    json.matches2019.forEach(match2019 => {
      let states = matches2019Merge.filter(a => a.matchNumber == match2019.matchNumber && a.teamNumber == match2019.teamNumber);
      if (states.length != 0) {
        let state_1 = states[0];
        state_1.fromFile = match2019;
      }
      else {
        let state_2 = Match2019MergeState.makeFromFile(match2019);
        matches2019Merge.push(state_2);
      }
    });
    for (var state_3 of matches2019Merge) {
      state_3.setSameness();
    }
    matches2019Merge.sort((a, b) => naturalSort(a.matchNumber, b.matchNumber));
    return matches2019Merge;
  }

  completeMerge(matches2019Merge: Match2019MergeState[]): Promise<any> {
    return Promise.all(
      matches2019Merge.map(async state => {
        if (!state.resolved) {
          console.error("item not resolved", state);
          throw new Error("item not resolved");
        }
        if (state.same || state.takeLocal) {
          return;
        } else if (state.takeFromFile) {
          // add record from file
          await this.dbContext.teamMatches2019.put(state.fromFile);
        } else if (!state.takeLocal && !state.takeFromFile && state.localSaved != null && state.fromFile == null) {
          // delete record from db
          await this.dbContext.teamMatches2019.delete(state.localSaved.id);
        } else if (state.merged != null) {
          state.merged.id = state.localSaved.id;
          await this.dbContext.teamMatches2019.put(state.merged);
        } else {
          throw new Error("crumb! we missed a case!");
        }
      }));
  }

  getTables(): any[] {
    return [this.dbContext.teamMatches2019];
  }

  importSimple(json: DeepSpaceEventJson): Promise<any> {
    return this.dbContext.teamMatches2019.bulkPut(json.matches2019);
  }

  deleteEvent(json: DeepSpaceEventJson|EventEntity): Promise<any> {
    let event: EventEntity;
    if(('event' in json)) {
      event = json.event;
    }else{
      event = json;
    }
    return this.dbContext.getTeamMatches2019({ eventCode: event.eventCode })
      .then(localMatches => {
        return this.dbContext.teamMatches2019.bulkDelete(localMatches.map(x => x.id));
      });
  }

  validateEventTeamMatches(json: any): string[] {
    return validateEventTeamMatches(json, json.matches2019, "matches2019");
  }

  updateMatch(matchP: EventMatchEntity, oldMatchNumber: string): Promise<any> {
    let teamNumbers = getTeamNumbers(matchP);
    return this.dbContext.getTeamMatches2019({ eventCode: matchP.eventCode, matchNumber: oldMatchNumber })
      .then(matches => {
        let saveMatches = [];
        let deleteMatches = [];
        for (var match of matches) {
          if (!teamNumbers.has(match.teamNumber)) {
            deleteMatches.push(match.id);
          } else if (oldMatchNumber != matchP.matchNumber) {
            match.matchNumber = matchP.matchNumber;
            saveMatches.push(match);
          }
        }

        return Promise.all([
          this.dbContext.teamMatches2019.bulkPut(saveMatches),
          this.dbContext.teamMatches2019.bulkDelete(deleteMatches),
        ]);
      }).then(() => "yup");
  }

  deleteMatch(eventCode: string, oldMatchNumber: string): Promise<any> {
    return this.dbContext.getTeamMatches2019({ eventCode: eventCode, matchNumber: oldMatchNumber })
      .then(matches => {
        let deleteMatches = matches.map(m => m.id)

        return this.dbContext.teamMatches2019.bulkDelete(deleteMatches);
      }).then(() => "yup");
  }

  deleteTeamMatch(eventCode: string, oldMatchNumber: string, teamNumber: string): Promise<any> {
    return this.dbContext.getTeamMatches2019({
      eventCode: eventCode,
      matchNumber: oldMatchNumber,
      teamNumber: teamNumber
    }).then(matches => {
      let deleteMatches = matches.map(m => m.id)

      return this.dbContext.teamMatches2019.bulkDelete(deleteMatches);
    }).then(() => "yup");
  }
}

export function configure(config) {
  var game = config.container.get(DeepSpaceGame);
  gameManager.registerGame(game);
}


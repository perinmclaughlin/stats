import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import * as naturalSort from "javascript-natural-sort";

import { IGame, gameManager, IEventJson, IMergeState } from "../index";
import { validateEventTeamMatches, getTeamNumbers } from "../merge-utils";
import { FrcStatsContext, EventMatchEntity, IEventTeamMatch, TeamMatch2019Entity } from "../../persistence";

export interface DeepSpaceEventJson extends IEventJson{
  matches2019: TeamMatch2019Entity[]
}

export interface Match2019MergeState extends IMergeState{
}

@autoinject
class DeepSpaceGame implements IGame {
  public gameCode = "2019";
  public year = "2019";
  public name = "DEEP SPACE";
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
    return this.dbContext.getTeamMatches2019({ eventCode: eventCode }).then(matches => {
      matches.sort((a, b) => naturalSort(a.matchNumber, b.matchNumber));
      return matches;
    });
  }

  clearIds(json: DeepSpaceEventJson) {
    json.matches2019.forEach(x => delete x.id);
  }

  beginMerge(json: DeepSpaceEventJson): Promise<Match2019MergeState[]> {
    throw new Error("implement");
  }

  completeMerge(matches2018Merge: Match2019MergeState[]): Promise<any> {
    throw new Error("implement");
  }

  getTables(): any[] {
    return [this.dbContext.teamMatches2019];
  }

  importSimple(json: DeepSpaceEventJson): Promise<any> {
    return this.dbContext.teamMatches2019.bulkPut(json.matches2019);
  }

  deleteEvent(json: DeepSpaceEventJson): Promise<any> {
    return this.dbContext.getTeamMatches2019({ eventCode: json.event.eventCode })
      .then(localMatches => {
        return this.dbContext.teamMatches2019.bulkDelete(localMatches.map(x => x.id));
      });
  }

  validateEventTeamMatches(json: any): string[] {
    throw new Error("implement");
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


import { IEventJson, IMergeState } from "..";
import { TeamMatch2019Entity, matches2019AreEqual, make2019match, DeepSpaceEvent } from "../../persistence";
import { ValidationRules } from "aurelia-validation";
import { DeepSpaceTeamStatistics } from "./statistics";

export interface DeepSpaceEventJson extends IEventJson {
  matches2019: TeamMatch2019Entity[];
}

export interface MergeDialogModel {
  state: Match2019MergeState;
}

export class Match2019MergeState implements IMergeState {
  public localSaved: TeamMatch2019Entity;
  public fromFile: TeamMatch2019Entity;
  public merged: TeamMatch2019Entity;
  public same: boolean;
  public resolved: boolean;
  public takeFromFile: boolean;
  public takeLocal: boolean;

  constructor(public matchNumber: string, public teamNumber: string) {
  }

  public setSameness() {
    this.same = matches2019AreEqual(this.localSaved, this.fromFile);
    this.resolved = this.same;
    if (this.localSaved != null && this.fromFile == null) {
      this.takeLocal = true;
      this.takeFromFile = false;
      this.resolved = true;
    } else if (this.localSaved == null && this.fromFile != null) {
      this.takeLocal = false;
      this.takeFromFile = true;
      this.resolved = true;
    }
  }

  public static makeFromDb(entity: TeamMatch2019Entity): Match2019MergeState {
    let state = new Match2019MergeState(entity.matchNumber, entity.teamNumber);
    state.localSaved = entity;
    state.merged = make2019match(entity.eventCode, entity.teamNumber, entity.matchNumber);
    return state;
  }

  public static makeFromFile(entity: TeamMatch2019Entity): Match2019MergeState {
    let state = new Match2019MergeState(entity.matchNumber, entity.teamNumber);
    state.fromFile = entity;
    state.merged = make2019match(entity.eventCode, entity.teamNumber, entity.matchNumber);
    return state;
  }
}

export function setupValidationRules() {
  /* istanbul ignore next */
  let rules = ValidationRules
    .ensure((obj: TeamMatch2019Entity) => obj.cargoPickup)
    .required()
    .satisfiesRule("isQualitativeNumeric")
    .ensure((obj: TeamMatch2019Entity) => obj.hatchPanelPickup)
    .required()
    .satisfiesRule("isQualitativeNumeric")
    .ensure((obj: TeamMatch2019Entity) => obj.level3ClimbBegin)
    .satisfiesRule("minimum", 0)
    .satisfiesRule("maximum", 135)
    .satisfiesRule("isNumeric")
    .ensure((obj: TeamMatch2019Entity) => obj.level3ClimbEnd)
    .satisfiesRule("minimum", 0)
    .satisfiesRule("maximum", 135)
    .satisfiesRule("isNumeric")
    .satisfiesRule("isParadox", "level3ClimbBegin")
    .when((obj:TeamMatch2019Entity) => obj.level3ClimbAttempted)
    .ensure((obj: TeamMatch2019Entity) => obj.level3ClimbSucceeded)
    .satisfiesRule("attempted", "level3ClimbAttempted")
    .ensure((obj: TeamMatch2019Entity) => obj.level2ClimbSucceeded)
    .satisfiesRule("attempted", "level2ClimbAttempted")
    .ensure((obj: TeamMatch2019Entity) => obj.liftedBy)
    .satisfiesRule("didNotLiftAndGetLiftedBy", (model: TeamMatch2019Entity) => model.lifted)
    .ensure ((obj: TeamMatch2019Entity) => obj.liftedBy)
    .required()
    .when ((obj:TeamMatch2019Entity) => obj.wasLifted)
    .ensure ((obj: TeamMatch2019Entity) => obj.lifted)
    .satisfies((lifted: string[], obj:TeamMatch2019Entity) => {
      if(obj.liftedSomeone == false){
        return true
      }
      else {
        if (lifted.length == 0){
          return false
        }
        else{
          return true
        }
      }
    })
    .withMessage("select the team lifted")
    .rules;

  /* istanbul ignore next */
  let placementRules = ValidationRules
    .ensure((obj: DeepSpaceEvent) => obj.location)
    .required()
    .satisfiesRule("isDeepSpaceLocation")
    .when((obj: DeepSpaceEvent) => obj.eventType == "Gamepiece Placement")
    .ensure((obj: DeepSpaceEvent) => obj.gamepiece)
    .required()
    .satisfiesRule("isDeepSpaceGamepiece")
    .when((obj: DeepSpaceEvent) => obj.eventType == "Gamepiece Placement")
    .ensure((obj: DeepSpaceEvent) => obj.when)
    .required()
    .satisfiesRule("isNumeric")
    .satisfies((when: number, obj: DeepSpaceEvent) => {
      if((obj.sandstorm && (obj.when > 15 || obj.when < 0)) && (!isNaN(obj.when) || obj.when == Infinity)) {
        return false;
      }
      else {
        return true;
      }
    })
    .withMessage("Sandstorm only lasts fifteen seconds.")
    .satisfies((when: number, obj: DeepSpaceEvent) => {
      if((!obj.sandstorm && (obj.when > 135 || obj.when < 0)) && (!isNaN(obj.when) || obj.when == Infinity)) {
        return false
      }
      else {
        return true;
      }
    })
    .withMessage("Teleop only lasts 135 seconds.")
    .when((obj: DeepSpaceEvent) => obj.eventType == "Gamepiece Placement")
    .rules;

  return { rules, placementRules };
}

export class PlacementMergeState implements IMergeState {
  localSaved: DeepSpaceEvent;
  fromFile: DeepSpaceEvent;
  merged: DeepSpaceEvent;
  same: boolean;
  resolved: boolean;
  takeFromFile: boolean;
  takeLocal: boolean;
  include: boolean = true;

  constructor(public matchNumber: string, public teamNumber: string) {
  }

  public setSameFields() {
    if (this.fromFile != null && this.localSaved != null) {
      if (this.fromFile.when == this.localSaved.when) {
        this.merged.when = this.fromFile.when;
      }

      if (this.merged.eventType == "Gamepiece Placement") {
        for (var prop of ["gamepiece", "location", "sandstorm"]) {
          if (this.fromFile[prop] == this.localSaved[prop]) {
            this.merged[prop] = this.fromFile[prop];
          }
        }
      }
    }
  }

  public static makeFromDb(matchNumber: string, teamNumber: string, entity: DeepSpaceEvent): PlacementMergeState {
    let state = new PlacementMergeState(matchNumber, teamNumber);
    state.localSaved = entity;
    state.merged = {
      eventType: entity.eventType,
    }
    return state;
  }

  public static makeFromFile(matchNumber: string, teamNumber: string, entity: DeepSpaceEvent): PlacementMergeState {
    let state = new PlacementMergeState(matchNumber, teamNumber);
    state.fromFile = entity;
    state.merged = {
      eventType: entity.eventType,
    }
    return state;
  }

}

export function placementTime(event: DeepSpaceEvent) {
  let result = +event.when;
  if (event.sandstorm) {
    result += 135;
  }
  return result;
}

function findBestCandidate(comparator: DeepSpaceEvent, startIndex: number, candidatePool: DeepSpaceEvent[], used: boolean[]) {
  let i = startIndex;
  while (i < candidatePool.length && placementTime(comparator) <= placementTime(candidatePool[i]) + 15) {
    ++i;
  }

  let candidates = candidatePool
    .slice(startIndex, i)
    .map((placement, index) => ({
      placement,
      index: index + startIndex,
      score: 0,
    }));
  if (print) {
    console.info('candidates: ', candidates);
  }
  let bestCandidate = null;
  candidates.forEach(c => {
    if (c.placement.eventType != comparator.eventType || used[c.index]) {
      // can't group this one
      return;
    }

    c.score = Math.abs(placementTime(c.placement) - placementTime(comparator));
    if (c.placement.eventType == "Gamepiece Placement") {
      if (c.placement.gamepiece != comparator.gamepiece) {
        c.score += 5;
      }
      if (c.placement.location != comparator.location) {
        c.score += 5;
      }
    }

    if (bestCandidate == null || bestCandidate.score > c.score) {
      if (print) {
        console.info("new best candidate", c);
      }
      bestCandidate = c;
    }
  });

  return bestCandidate;
}

function assertSortedDescending(events: DeepSpaceEvent[]) {
  for (var i = 0; i < events.length - 1; i++) {
    if (placementTime(events[i]) < placementTime(events[i + 1])) {
      throw new Error("placements must be sorted descending wrt when");
    }
  }

}

var print = false;
export function doPrint(val: boolean) {
  print = val;
}

export function makePlacementMergeStates(fromFile: TeamMatch2019Entity, fromLocal: TeamMatch2019Entity): PlacementMergeState[] {
  assertSortedDescending(fromFile.placements);
  assertSortedDescending(fromLocal.placements);

  let teamNumber = fromFile.teamNumber;
  let matchNumber = fromFile.matchNumber;
  let fromFileI = 0;
  let fromLocalI = 0;
  let fromFileUsed: boolean[] = [];
  fromFileUsed.length = fromFile.placements.length;
  let fromLocalUsed: boolean[] = [];
  fromLocalUsed.length = fromLocal.placements.length;
  let results: PlacementMergeState[] = [];
  while (fromFileI < fromFileUsed.length && fromLocalI < fromLocalUsed.length) {
    let pFile = fromFile.placements[fromFileI];
    let pLocal = fromLocal.placements[fromLocalI];
    let mergeState = new PlacementMergeState(matchNumber, teamNumber);
    if (placementTime(pFile) > placementTime(pLocal)) {
      if (print) {
        console.info("choosing pFile=", pFile, " over ", pLocal);
      }
      let bestCandidate = findBestCandidate(pFile, fromLocalI, fromLocal.placements, fromLocalUsed);

      fromFileUsed[fromFileI] = true;
      mergeState = PlacementMergeState.makeFromFile(matchNumber, teamNumber, pFile);
      fromFileI++;
      if (bestCandidate != null) {
        fromLocalUsed[bestCandidate.index] = true;
        mergeState.localSaved = bestCandidate.placement;
        if (bestCandidate.index == fromLocalI) {
          while (fromLocalUsed[fromLocalI] && fromLocalI < fromLocalUsed.length) {
            fromLocalI++;
          }
        }
      }
    } else {
      if (print) {
        console.info("choosing against pFile=", pFile, " rather ", pLocal);
      }
      let bestCandidate = findBestCandidate(pLocal, fromFileI, fromFile.placements, fromFileUsed);

      fromLocalUsed[fromLocalI] = true;
      mergeState = PlacementMergeState.makeFromDb(matchNumber, teamNumber, pLocal);
      fromLocalI++;
      if (bestCandidate != null) {
        fromFileUsed[bestCandidate.index] = true;
        mergeState.fromFile = bestCandidate.placement;
        if (bestCandidate.index == fromFileI) {
          while (fromFileUsed[fromFileI] && fromFileI < fromFileUsed.length) {
            fromFileI++;
          }
        }
      }
    }

    results.push(mergeState);
  }

  for (var i = fromFileI; i < fromFileUsed.length; i++) {
    if (fromFileUsed[i]) {
      continue;
    }

    let mergeState = PlacementMergeState.makeFromFile(matchNumber, teamNumber, fromFile.placements[i]);
    results.push(mergeState);
    if (print) {
      console.info("adding ", fromFile.placements[i]);
    }
  }

  for (var i = fromLocalI; i < fromLocalUsed.length; i++) {
    if (fromLocalUsed[i]) {
      continue;
    }

    let mergeState = PlacementMergeState.makeFromDb(matchNumber, teamNumber, fromLocal.placements[i]);
    results.push(mergeState);
    if (print) {
      console.info("adding ", fromLocal.placements[i]);
    }
  }

  results.sort((a, b) => {
    let aTime = placementTime(a.fromFile != null ? a.fromFile : a.localSaved)
    let bTime = placementTime(b.fromFile != null ? b.fromFile : b.localSaved);
    return bTime - aTime;
  });

  if (print) {
    console.info("returning ", results);
  }

  return results;
}

export interface MatchAndStats {
  match: TeamMatch2019Entity;
  stats: DeepSpaceTeamStatistics;
}

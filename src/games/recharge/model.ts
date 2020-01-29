import { IEventJson, IMergeState } from "..";
import { TeamMatch2020Entity, matches2020AreEqual, make2020match, RechargeEvent } from "../../persistence";
import { ValidationRules } from "aurelia-validation";
import { RechargeTeamStatistics } from "./statistics";

export interface RechargeEventJson extends IEventJson {
  matches2020: TeamMatch2020Entity[];
}

export interface MergeDialogModel {
  state: Match2020MergeState;
}

export class Match2020MergeState implements IMergeState {
  public localSaved: TeamMatch2020Entity;
  public fromFile: TeamMatch2020Entity;
  public merged: TeamMatch2020Entity;
  public same: boolean;
  public resolved: boolean;
  public takeFromFile: boolean;
  public takeLocal: boolean;

  constructor(public matchNumber: string, public teamNumber: string) {
  }

  public setSameness() {
    this.same = matches2020AreEqual(this.localSaved, this.fromFile);
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

  public static makeFromDb(entity: TeamMatch2020Entity): Match2020MergeState {
    let state = new Match2020MergeState(entity.matchNumber, entity.teamNumber);
    state.localSaved = entity;
    state.merged = make2020match(entity.eventCode, entity.teamNumber, entity.matchNumber);
    return state;
  }

  public static makeFromFile(entity: TeamMatch2020Entity): Match2020MergeState {
    let state = new Match2020MergeState(entity.matchNumber, entity.teamNumber);
    state.fromFile = entity;
    state.merged = make2020match(entity.eventCode, entity.teamNumber, entity.matchNumber);
    return state;
  }
}

export function setupValidationRules() {
  /* istanbul ignore next 
  let rules = ValidationRules
    .ensure((obj: TeamMatch2020Entity) => obj.cargoPickup)
    .required()
    .satisfiesRule("isQualitativeNumeric")
    .ensure((obj: TeamMatch2020Entity) => obj.hatchPanelPickup)
    .required()
    .satisfiesRule("isQualitativeNumeric")
    .ensure((obj: TeamMatch2020Entity) => obj.level3ClimbBegin)
    .satisfiesRule("minimum", 0)
    .satisfiesRule("maximum", 135)
    .satisfiesRule("isNumeric")
    .ensure((obj: TeamMatch2020Entity) => obj.level3ClimbEnd)
    .satisfiesRule("minimum", 0)
    .satisfiesRule("maximum", 135)
    .satisfiesRule("isNumeric")
    .satisfiesRule("isParadox", "level3ClimbBegin")
    .when((obj:TeamMatch2020Entity) => obj.level3ClimbAttempted)
    .ensure((obj: TeamMatch2020Entity) => obj.level3ClimbSucceeded)
    .satisfiesRule("attempted", "level3ClimbAttempted")
    .ensure((obj: TeamMatch2020Entity) => obj.level2ClimbSucceeded)
    .satisfiesRule("attempted", "level2ClimbAttempted")
    .ensure((obj: TeamMatch2020Entity) => obj.liftedBy)
    .satisfiesRule("didNotLiftAndGetLiftedBy", (model: TeamMatch2020Entity) => model.lifted)
    .ensure ((obj: TeamMatch2020Entity) => obj.liftedBy)
    .required()
    .when ((obj:TeamMatch2020Entity) => obj.wasLifted)
    .ensure ((obj: TeamMatch2020Entity) => obj.lifted)
    .satisfies((lifted: string[], obj:TeamMatch2020Entity) => {
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

   / *istanbul ignore next */

  return { };
}

export class MergeState implements IMergeState {
  localSaved: RechargeEvent;
  fromFile: RechargeEvent;
  merged: RechargeEvent;
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
    }
  }

  public static makeFromDb(matchNumber: string, teamNumber: string, entity: RechargeEvent): MergeState {
    let state = new MergeState(matchNumber, teamNumber);
    state.localSaved = entity;
    state.merged = {
      eventType: entity.eventType,
    }
    return state;
  }

  public static makeFromFile(matchNumber: string, teamNumber: string, entity: RechargeEvent): MergeState {
    let state = new MergeState(matchNumber, teamNumber);
    state.fromFile = entity;
    state.merged = {
      eventType: entity.eventType,
    }
    return state;
  }

}




var print = false;
export function doPrint(val: boolean) {
  print = val;
}

export function makeMergeStates(fromFile: TeamMatch2020Entity, fromLocal: TeamMatch2020Entity): MergeState[] {

  let teamNumber = fromFile.teamNumber;
  let matchNumber = fromFile.matchNumber;
  let fromFileI = 0;
  let fromLocalI = 0;
  let fromFileUsed: boolean[] = [];
  let fromLocalUsed: boolean[] = [];
  let results: MergeState[] = [];


  for (var i = fromFileI; i < fromFileUsed.length; i++) {
    if (fromFileUsed[i]) {
      continue;
    }

    let mergeState = MergeState.makeFromFile(matchNumber, teamNumber);
    results.push(mergeState);
  }

  for (var i = fromLocalI; i < fromLocalUsed.length; i++) {
    if (fromLocalUsed[i]) {
      continue;
    }

    let mergeState = MergeState.makeFromDb(matchNumber, teamNumber);
    results.push(mergeState);
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
  match: TeamMatch2020Entity;
  stats: RechargeTeamStatistics;
}

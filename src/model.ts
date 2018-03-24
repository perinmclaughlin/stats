import { 
  EventMatchEntity, eventMatchesAreEqual, 
  TeamMatch2018Entity, matches2018AreEqual, make2018match,
} from "./persistence";

export class MatchData {
	public year: string;
	public eventCode: string;
	public teamNumber: string;
	public matchNumber: string;

	public isFailure: boolean;
	public failureReason: string;
	public isSwitch: boolean;
	public isScale: boolean;
	public isVault: boolean;
	public isFoul: boolean;
	public foulCount: string;
	public foulReason: string;
	public cubeCount: string;
}

export class EventTeamData {
  teamName: string;
	public year: string;
	public eventCode: string;
	public teamNumber: string;

	public matchCount: number;
	public failureCount: number;

	public scaleCount: number;
	public scaleAvg: number;

  public switchCount: number;
  public switchAvg: number;

  public vaultCount: number;
  public vaultAvg: number;

  public climbCount: number;
  public climbAvg: number;

  public liftCount: number;
  public liftAvg: number;

	public switch_cap: string;
	public vault: string;
	public foulCount: number;
	public cubeAverage: number;

  public autoLineCount: number;
  public autoSwitchCount: number;
  public autoScaleCount: number;
}

export class EventMatchMergeState {
  public localSaved: EventMatchEntity;
  public fromFile: EventMatchEntity;
  public same: boolean;
  public resolved: boolean;
  public takeFromFile: boolean;
  public takeLocal: boolean;


  constructor(public matchNumber: string) {
  }

  public setSameness() {
    this.same = eventMatchesAreEqual(this.localSaved, this.fromFile);
    this.resolved = this.same;
    if (this.localSaved != null && this.fromFile == null) {
      this.takeLocal = true;
      this.takeFromFile = false;
    }else if(this.localSaved == null && this.fromFile != null) {
      this.takeLocal = false;
      this.takeFromFile = true;
    }
  }
}

export class Match2018MergeState {
  public localSaved: TeamMatch2018Entity;
  public fromFile: TeamMatch2018Entity;
  public merged: TeamMatch2018Entity;
  public same: boolean;
  public resolved: boolean;
  public takeFromFile: boolean;
  public takeLocal: boolean;

  constructor(public matchNumber: string, public teamNumber: string) {
  }

  public setSameness() {
    this.same = matches2018AreEqual(this.localSaved, this.fromFile);
    this.resolved = this.same;
    if (this.localSaved != null && this.fromFile == null) {
      this.takeLocal = true;
      this.takeFromFile = false;
      this.resolved = true;
    }else if(this.localSaved == null && this.fromFile != null) {
      this.takeLocal = false;
      this.takeFromFile = true;
      this.resolved = true;
    }
  }

  public static makeFromDb(entity: TeamMatch2018Entity): Match2018MergeState {
    let state = new Match2018MergeState(entity.matchNumber, entity.teamNumber);
    state.localSaved = entity;
    state.merged = make2018match(entity.eventCode, entity.teamNumber, entity.matchNumber);
    return state;
  }

  public static makeFromFile(entity: TeamMatch2018Entity): Match2018MergeState {
    let state = new Match2018MergeState(entity.matchNumber, entity.teamNumber);
    state.fromFile = entity;
    state.merged = make2018match(entity.eventCode, entity.teamNumber, entity.matchNumber);
    return state;
  }
}

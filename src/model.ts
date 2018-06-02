import { 
  EventMatchEntity, eventMatchesAreEqual, makeEventMatch,
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
  public strategy: string;
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
  public autoSwitchAttempt: boolean;
  public autoScaleAttempt: boolean;
  public autoVault: boolean;

  public attemptClimb: boolean;
  public liftedBy: string;

}

export class EventMatchMergeState {
  public localSaved: EventMatchEntity;
  public fromFile: EventMatchEntity;
  public same: boolean;
  public resolved: boolean;
  public takeFromFile: boolean;
  public takeLocal: boolean;
  public merged: EventMatchEntity;


  constructor(public matchNumber: string) {
  }

  public setSameness() {
    this.same = eventMatchesAreEqual(this.localSaved, this.fromFile);
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

  public static makeFromDb(entity: EventMatchEntity): EventMatchMergeState {
    let state = new EventMatchMergeState(entity.matchNumber);
    state.localSaved = entity;
    state.merged = makeEventMatch(entity.year, entity.eventCode, entity.matchNumber);
    return state;
  }

  public static makeFromFile(entity: EventMatchEntity): EventMatchMergeState {
    let state = new EventMatchMergeState(entity.matchNumber);
    state.fromFile = entity;
    state.merged = makeEventMatch(entity.year, entity.eventCode, entity.matchNumber);
    return state;
  }
}

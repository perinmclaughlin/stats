import Dexie from "dexie";

export class FrcStatsContext extends Dexie {
  teamMatches2018: Dexie.Table<TeamMatch2018Entity, number>;
  teams: Dexie.Table<TeamEntity, number>;
  districts: Dexie.Table<DistrictEntity, number>;
  events: Dexie.Table<EventEntity, number>;
  eventTeams: Dexie.Table<EventTeamEntity, number>;
  games: Dexie.Table<GameEntity, number>;
  userPrefs: Dexie.Table<UserStateEntity, number>;
  eventMatches: Dexie.Table<EventMatchEntity, number>;

  constructor() {
    super('FrcStats')

    this.version(1).stores({
      teamMatches2018: '++id, eventCode, teamNumber, matchNumber, [eventCode+matchNumber], [eventCode+teamNumber], &[eventCode+teamNumber+matchNumber]',
      teams: '++id, &teamNumber, districtCode, tbaKey',
      eventTeams: '++id, year, eventCode, teamNumber, [year+eventCode], &[year+eventCode+teamNumber]',
      districts: '++id, &districtCode',
      events: '++id, &eventCode, &[year+eventCode]',
      games: '++id, &year',
      userPrefs: '++id',
	    eventMatches: '++id, [year+eventCode], &[year+eventCode+matchNumber]',
    });


    this.games.put({
      year: '2018',
      name: 'FIRST POWER UP',
    }).catch(error => {
      if(error.name == 'ConstraintError') {
        // u weird, chrome
        return;
      }
      throw error;
    });
  }
}

export interface TeamMatch2018Entity {
  id?: number;
	eventCode: string;
	teamNumber: string;
	matchNumber: string;

	isFailure: boolean;
	failureReason: string;
	allySwitchCount: number;
  allySwitchCycleTime: number
	oppoSwitchCount: number;
  oppoSwitchCycleTime: number
	scaleCount: number;
	scaleCycleTime: number;
  vaultCount: number;
  vaultCycleTime: number;
  climbed: boolean;
  lifted: string[];
	isFoul: boolean;
	foulReason: string;
	cubeCount: number;
  notes: string;
}

export function make2018match(eventCode, teamNumber, matchNumber): TeamMatch2018Entity {
  return {
    eventCode: eventCode,
    teamNumber: teamNumber,
    matchNumber: matchNumber,
    allySwitchCount: 0,
    allySwitchCycleTime: 150,
    oppoSwitchCount: 0,
    oppoSwitchCycleTime: 150,
    scaleCount: 0,
    scaleCycleTime: 150,
    vaultCount: 0,
    vaultCycleTime: 150,
    climbed: false,
    lifted: [],

    isFailure: false,
    failureReason: "",
    isFoul: false,
    foulReason: "",
    cubeCount: 0,
    notes: "",
  };
}

export function matches2018AreEqual(a: TeamMatch2018Entity, b: TeamMatch2018Entity) {
  if(a == null && b != null || a != null && b == null) return false;
  return (
    a.eventCode == b.eventCode &&
    a.teamNumber == b.teamNumber &&
    a.matchNumber == b.matchNumber &&
    a.allySwitchCount == b.allySwitchCount &&
    a.allySwitchCycleTime == b.allySwitchCycleTime &&
    a.oppoSwitchCount == b.oppoSwitchCount &&
    a.oppoSwitchCycleTime == b.oppoSwitchCycleTime &&
    a.scaleCount == b.scaleCount &&
    a.scaleCycleTime == b.scaleCycleTime &&
    a.vaultCount == b.vaultCount &&
    a.vaultCycleTime == b.vaultCycleTime &&
    a.climbed == b.climbed &&
    (a.lifted == null && b.lifted == null ||
     a.lifted.length == b.lifted.length) &&
    a.isFailure == b.isFailure &&
    a.failureReason == b.failureReason &&
    a.isFoul == b.isFoul &&
    a.foulReason == b.foulReason &&
    a.cubeCount == b.cubeCount &&
    a.notes == b.notes
  );
}

export interface EventTeamEntity {
  id?: number;
	year: string;
	eventCode: string;
	teamNumber: string;
}

export interface TeamEntity {
  id?: number;
  teamNumber: string;
  teamName: string;
  description: string;
  city: string;
  stateprov: string;
  country: string;
  districtCode: string;

  tbaKey?: string;
}

export interface DistrictEntity {
  id?: number;
  districtCode: string;
  name: string;
}

export interface EventEntity {
  id?: number;
  eventCode: string;
  name: string;
  districtCode: string;
  year: string;

  tbaKey?: string;
}

export interface GameEntity {
  id?: number;
  year: string;
  name: string;
}

export interface UserStateEntity {
  id?: number;

  currentEventId: number;
  currentYear: string;
  lastMatchNumber: number;
}

export interface EventMatchEntity {
	id?: number;
	
	year: string;
	eventCode: string;
	matchNumber: string;
  red1: string;
  red2: string;
  red3: string;
  blue1: string;
  blue2: string;
  blue3: string;
}

export function eventMatchesAreEqual(a: EventMatchEntity, b: EventMatchEntity): boolean {
  if(a == null && b != null || a != null && b == null) return false;
  return (a.matchNumber == b.matchNumber && a.year == b.year && a.eventCode == b.eventCode &&
    a.red1 == b.red1 && a.red2 == b.red2 && a.red3 == b.red3  &&
    a.blue1 == b.blue1 && a.blue2 == b.blue2 && a.blue3 == b.blue3);
}

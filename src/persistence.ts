import Dexie from "dexie";

export class FrcStatsContext extends Dexie {
  teamMatches2018: Dexie.Table<TeamMatch2018Entity, number>;
  teams: Dexie.Table<TeamEntity, number>;
  districts: Dexie.Table<DistrictEntity, number>;
  events: Dexie.Table<EventEntity, number>;
  eventTeams: Dexie.Table<EventTeamEntity, number>;
  games: Dexie.Table<GameEntity, number>;
  userPrefs: Dexie.Table<UserStateEntity, number>;

  constructor() {
    super('FrcStats')

    this.version(1).stores({
      teamMatches2018: '++id, eventCode, teamNumber, matchNumber, &[eventCode+teamNumber+matchNumber]',
      teams: '++id, &teamNumber, districtCode',
      eventTeams: '++id, year, eventCode, teamNumber, [year+eventCode], &[year+eventCode+teamNumber]',
      districts: '++id, &code',
      events: '++id, &code',
      games: '++id, &year',
      userPrefs: '++id',
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
	matchNumber: number;

	isFailure: boolean;
	failureReason: string;
	isSwitch: boolean;
	isScale: boolean;
	isVault: boolean;
	isFoul: boolean;
	foulCount: number;
	foulReason: string;
	cubeCount: number;
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
  code: string;
  name: string;
}

export interface EventEntity {
  id?: number;
  code: string;
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

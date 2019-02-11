import { EventEntity, IEventTeamMatch, EventTeamEntity, TeamEntity, EventMatchEntity } from "../persistence";

export interface IGame {
  gameCode: string; // a unique code for identifying this game. internal to this application.
  year: string; // calendar year that this game was [probably] played
  name: string;
  matchInputModule: string;
  eventTeamsModule: string;
  eventTeamModule: string;

  mergeDialogClass(): any;

  getEventTeamMatches(eventCode: string): Promise<IEventTeamMatch[]>;
  exportEventJson(event: EventEntity): Promise<IEventJson>;

  /**
   * set the json object to contain exactly one match in the game specific field
   */
  setJsonEventTeamMatch(json: any, match: IEventTeamMatch);

  clearIds(json: IEventJson);
  beginMerge(json: IEventJson): Promise<IMergeState[]>;
  completeMerge(matches2018Merge: IMergeState[]): Promise<any>;

  /**
   * Get all game-specific dexie tables used by this implementation
   */
  getTables(): any[];

  importSimple(json: IEventJson): Promise<any>;

  deleteEvent(json: IEventJson|EventEntity): Promise<any>;

  validateEventTeamMatches(json: any): string[];
  
  /**
   * update a match. new match could have a different matchNumber and different team numbers.
   * this method must ensure match-team entities' matchNumber is updated, and if team numbers 
   * were changed, that match-teams for teams not scheduled in the new match are deleted.
   */
  updateMatch(newMatch: EventMatchEntity, oldMatchNumber: string): Promise<any>;
  deleteMatch(eventCode: string, oldMatchNumber: string): Promise<any>;
  deleteTeamMatch(eventCode: string, oldMatchNumber: string, teamNumber: string): Promise<any>;
}

export interface IMergeState {
  matchNumber: string;
  teamNumber: string;
  localSaved: any;
  fromFile: any;
  merged: any;
  same: boolean;
  resolved: boolean;
  takeFromFile: boolean;
  takeLocal: boolean;
}

export interface IEventJson {
  teams: TeamEntity[];
  eventTeams: EventTeamEntity[];
  event: EventEntity;
  eventMatches: EventMatchEntity[];
}

export class GamesManager {
  private games: Map<string, IGame>;

  constructor() {
    this.games = new Map<string, IGame>();
  }

  public registerGame(game: IGame) {
    if(this.games.has(game.gameCode)) {
      throw new Error(`game ${game.gameCode} (${game.name}) is already registered`);
    }
    this.games.set(game.gameCode, game);
  }

  public getGames(): IGame[] {
    return Array.from(this.games.values());
  }

  public getGamesForYear(year: string): IGame[] {
    return Array.from(this.games.values()).filter(game => game.year == year);
  }

  public getGame(gameCode): IGame {
    return this.games.get(gameCode);
  }

  public getGameMap(): Map<string, IGame> {
    return this.games; // todo: read only view?
  }
}

export var gameManager = new GamesManager();

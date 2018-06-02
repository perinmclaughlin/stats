import { EventEntity, IEventTeamMatch } from "../persistence";

export interface IGame {
  gameCode: string; // a unique code for identifying this game. internal to this application.
  year: string; // calendar year that this game was [probably] played
  name: string;
  matchInputModule: string;
  eventTeamsModule: string;
  eventTeamModule: string;

  mergeDialogClass(): any;

  getEventTeamMatches(eventCode: string): Promise<IEventTeamMatch[]>;
  exportEventJson(event: EventEntity): Promise<any>;
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

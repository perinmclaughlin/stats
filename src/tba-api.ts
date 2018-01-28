import * as TBA from "tba-api-storm";

export class TbaApi {
  private api: TBA;
  constructor() {
    this.api = new TBA("3jjSND0FVNOyI2kJjj00seaIIw5fjz4FAb0iSjSmR5sYeRkDE38u2TnixIPj8cs2")
  }

  getEventList(year): Promise<tbaEvent[]> {
    return this.api.getEventList(year);
  }
  
  getEventTeams(eventKey): Promise<Team[]> {
    return this.api.getEventTeams(eventKey);
  }
}

export interface tbaEvent {
  key: string;
  name: string;
  short_name: string;
  week: number;
  event_code: string;
  first_event_code: string;
  year: number;
  district: District;
}

export interface District {
  abbreviation: string;
  display_name: string;
  year: number;
  key: string;
}

export interface Team {
  name: string;
  nickname: string;
  team_number: number;
  city: string;
  state_prov: string;
  country: string;
}

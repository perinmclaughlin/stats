import { autoinject } from "aurelia-framework";
import { HttpClient } from "aurelia-fetch-client";

// largely stolen from https://github.com/2729StormRobotics/tba-api-storm
@autoinject
export class TbaApi {
  private auth_key: string;
  private base: string;
  private http: HttpClient;
  
  constructor() {
    this.auth_key = "3jjSND0FVNOyI2kJjj00seaIIw5fjz4FAb0iSjSmR5sYeRkDE38u2TnixIPj8cs2";
    this.base = 'https://www.thebluealliance.com/api/v3/';

    this.http = new HttpClient();
    this.http.configure(c => {
        c.defaults.headers = {
          'X-TBA-Auth-Key': this.auth_key 
        };
        c.defaults.mode = "cors";
    });
  }

  callAPI(uri) {
    return this.http.fetch(this.base + uri, {
      method: "GET",
    }).then(response => {
      if(response.status != 200) {
        throw response;
      }

      return response.json();
    });
  }

  getStatus() {
    return this.callAPI('status/');
  }

  //Teams

  getTeamList(pageNum) {
    return this.callAPI('teams/' + pageNum);
  }

  getTeamListSimple(pageNum) {
    return this.callAPI('teams/' + pageNum + '/simple');
  }

  getTeamListByYear(pageNum, year = null) {
    return this.callAPI('teams/' + year + '/' + pageNum);
  }

  getTeamListSimpleByYear(year, pageNum) {
    return this.callAPI('teams/' + year + '/' + pageNum + '/simple');
  }

  getTeam(teamNum) {
    return this.callAPI('team/frc' + teamNum);
  }

  getTeamSimple(teamNum) {
    return this.callAPI('team/frc' + teamNum + '/simple');
  }

  getYearsParticipated(teamNum) {
    return this.callAPI('team/frc' + teamNum + '/years_participated');
  }

  getTeamDistricts(teamNum) {
    return this.callAPI('team/frc' + teamNum + '/districts');
  }

  getTeamRobots(teamNum) {
    return this.callAPI('team/frc' + teamNum + '/robots');
  }

  getTeamEventList(teamNum) {
    return this.callAPI('team/frc' + teamNum + '/events');
  }

  getTeamEventListByYear(teamNum, year) {
    return this.callAPI('team/frc' + teamNum + '/events/' + year);
  }

  getTeamEventListSimple(teamNum, year) {
    return this.callAPI('team/frc' + teamNum + '/events/' + year + '/simple');
  }

  getTeamEventListKeys(teamNum) {
    return this.callAPI('team/frc' + teamNum + '/events/keys');
  }

  getTeamEventListKeysByYear(teamNum, year) {
    return this.callAPI('team/frc' + teamNum + '/events/' + year + '/keys');
  }

  getTeamEventMatchList(teamNum, eventKey) {
    return this.callAPI('team/frc' + teamNum + '/event/' + eventKey + "/matches");
  }

  getTeamEventMatchListSimple(teamNum, eventKey) {
    return this.callAPI('team/frc' + teamNum + '/event/' + eventKey + "/matches/simple");
  }

  getTeamEventMatchListKeys(teamNum, eventKey) {
    return this.callAPI('team/frc' + teamNum + '/event/' + eventKey + "/matches/simple");
  }

  getTeamEventAwards(teamNum, eventKey) {
    return this.callAPI('team/frc' + teamNum + '/event/' + eventKey + '/awards');
  }

  getTeamEventStatus(teamNum, eventKey) {
    return this.callAPI('team/frc' + teamNum + '/event/' + eventKey + '/awards');
  }

  getTeamAwards(teamNum, year) {
    return this.callAPI('team/frc' + teamNum + '/awards/' + year);
  }

  getTeamMatchList(teamNum, year) {
    return this.callAPI('team/frc' + teamNum + '/matches/' + year);
  }

  getTeamMatchListSimple(teamNum, year) {
    return this.callAPI('team/frc' + teamNum + '/matches/' + year + '/simple');
  }

  getTeamMatchListKeys(teamNum, year) {
    return this.callAPI('team/frc' + teamNum + '/matches/' + year + '/keys');
  }

  getTeamMedia(teamNum, year) {
    return this.callAPI('team/frc' + teamNum + '/media/' + year);
  }

  getTeamSocialMedia(teamNum) {
    return this.callAPI('team/frc' + teamNum + '/social_media');
  }

  //Events - work on this

  getEventList(year): Promise<tbaEvent[]> {
    return <Promise<tbaEvent[]>>this.callAPI('events/' + year);
  }
  
  getEventListSimple(year) {
    return this.callAPI('events/' + year + '/simple');
  }
  
  getEventListKeys(year) {
    return this.callAPI('events/' + year + '/keys');
  }

  getEvent(eventKey) {
    return this.callAPI('event/' + eventKey);
  }
  
  getEventSimple(eventKey) {
    return this.callAPI('event/' + eventKey + '/simple');
  }
  
  getEventAlliances(eventKey) {
    return this.callAPI('event/' + eventKey + '/alliances');
  }
  
  getEventInsights(eventKey) {
    return this.callAPI('event/' + eventKey + '/insights');
  }
  
  getEventOprs(eventKey) {
    return this.callAPI('event/' + eventKey + '/oprs');
  }
  
  getEventPredictions(eventKey) {
    return this.callAPI('event/' + eventKey + '/predictions');
  }

  getEventTeams(eventKey): Promise<Team[]> {
    return <Promise<Team[]>>this.callAPI('event/' + eventKey + '/teams');
  }
  
  getEventTeamsSimple(eventKey) {
    return this.callAPI('event/' + eventKey + '/teams/simple');
  }
  
  getEventTeamsKeys(eventKey) {
    return this.callAPI('event/' + eventKey + '/teams/keys');
  }

  getEventMatches(eventKey): Promise<Match[]> {
    return this.callAPI('event/' + eventKey + '/matches');
  }
  
  getEventMatchesSimple(eventKey) {
    return this.callAPI('event/' + eventKey + '/matches/simple');
  }
  
  getEventMatchesKeys(eventKey) {
    return this.callAPI('event/' + eventKey + '/matches/keys');
  }

  getEventRankings(eventKey) {
    return this.callAPI('event/' + eventKey + '/rankings');
  }

  getEventAwards(eventKey) {
    return this.callAPI('event/' + eventKey + '/awards');
  }

  getEventDistrictPoints(eventKey) {
    return this.callAPI('event/' + eventKey + '/district_points');
  }
  
  //Matches

  getMatch(matchKey) {
    return this.callAPI('match/' + matchKey);
  }
  
  getMatchSimple(matchKey) {
    return this.callAPI('match/' + matchKey + '/simple');
  }
  
  //Districts

  getDistrictList(year) {
    return this.callAPI('districts/' + year);
  }

  getDistrictEvents(districtShort) {
    return this.callAPI('district/' + districtShort + '/events');
  }
  
  getDistrictEventsSimple(districtShort) {
    return this.callAPI('district/' + districtShort + '/events/simple');
  }
  
  getDistrictEventsKeys(districtShort) {
    return this.callAPI('district/' + districtShort + '/events/keys');
  }

  getDistrictRankings(districtKey): Promise<TeamRanking[]> {
    return this.callAPI(`district/${districtKey}/rankings`);
  }

  getDistrictTeams(districtShort, year) {
    return this.callAPI('district/' + districtShort + '/teams');
  }
  
  getDistrictTeamsSimple(districtShort, year) {
    return this.callAPI('district/' + districtShort + '/teams/simple');
  }
  
  getDistrictTeamsKeys(districtShort, year) {
    return this.callAPI('district/' + districtShort + '/teams/keys');
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
  key: string;
}

export interface Match {
	comp_level: string;
	alliances: Alliances;
	key: string;
	match_number: number;
}

export interface Alliances {
	red: Alliance;
	blue: Alliance;
	
}

export interface Alliance {
	team_keys: string[];
}

export interface TeamRanking {
  event_points: EventPoints[];
  point_total: number;
  rank: number;
  rookie_bonus: number;
  team_key: string;
}

export interface EventPoints { 
  event_key: string;
  district_cmp: boolean;
  qual_points: number;
  alliance_points: number;
  award_points: number;
  elim_points: number;
  total: number;
}

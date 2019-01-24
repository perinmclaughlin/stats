import { autoinject } from "aurelia-framework";
import { EventEntity, EventMatchEntity, TeamEntity, EventTeamEntity, TeamMatch2019Entity, FrcStatsContext } from "../../persistence";
import { DialogService } from "aurelia-dialog";
import * as naturalSort from "javascript-natural-sort";
import { makeTeamStats, DeepSpaceTeamStatistics } from "./statistics";

@autoinject 
export class EventTeamsPage {
  public event: EventEntity;
  public eventMatches: EventMatchEntity[];
  public teams: {team: TeamEntity, eventTeam: EventTeamEntity}[];
  public matches2019: TeamMatch2019Entity[];
  public activeTab: number;
  public teamsData: DeepSpaceTeamStatistics[];

  constructor(
    private dbContext: FrcStatsContext,
    private dialogService: DialogService
  ){
    this.teams = [];
    this.eventMatches = [];
    this.matches2019 = [];
    this.activeTab = 0;
  }

  public async activate(params) {
    this.event = await this.dbContext.getEvent(params.year, params.eventCode);
    await this.getEventMatches();
    await this.getEventTeams();
    await this.get2019Matches();
  }

  private async getEventTeams() {
    let eventTeams = await this.dbContext.getEventTeams(this.event.year, this.event.eventCode);
    var gettingTeams = eventTeams.map(eventTeam => {
      return this.dbContext.getTeam(eventTeam.teamNumber).then(team => {
          this.teams.push({ team: team, eventTeam: eventTeam });
        });
    });

    await Promise.all(gettingTeams);
    this.teams.sort((a, b) => naturalSort(a.team.teamNumber, b.team.teamNumber));
  }

  private async getEventMatches() {
    let eventMatches = await this.dbContext.getEventMatches(this.event.year, this.event.eventCode);
    this.eventMatches = eventMatches;
    this.eventMatches.sort((a, b) => naturalSort(a.matchNumber, b.matchNumber));
  }

  private async get2019Matches() {
    this.matches2019 = await this.dbContext.teamMatches2019.where("eventCode").equals(this.event.eventCode).toArray();
    this.matches2019.sort((a, b) => naturalSort(a.matchNumber, b.matchNumber));

    let teamMatches = new Map<string, TeamMatch2019Entity[]>();
    for(var teamMatch of this.matches2019) {
      if(!teamMatches.has(teamMatch.teamNumber)) {
        teamMatches.set(teamMatch.teamNumber, [teamMatch])
      }else {
        teamMatches.get(teamMatch.teamNumber).push(teamMatch);
      }
    }
    this.teamsData = this.teams.map(x => makeTeamStats(teamMatches.get(x.team.teamNumber)));
  }
}

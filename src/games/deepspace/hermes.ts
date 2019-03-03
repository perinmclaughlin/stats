import { autoinject } from "aurelia-framework";
import { FrcStatsContext, TeamEntity, EventTeamEntity, EventMatchSlots, TeamMatch2019Entity, EventMatchEntity, EventEntity, EventMatchSlot } from "../../persistence";
import * as naturalSort from "javascript-natural-sort";
import { DeepSpaceTeamStatistics, makeTeamStats } from "./statistics";

@autoinject
export class viewPage {
    public event: EventEntity;
    public eventMatch: EventMatchEntity;
    public teams: {
        team: TeamEntity, slot: EventMatchSlot,
        matches: TeamMatch2019Entity[], stats: DeepSpaceTeamStatistics
    }[];
    constructor(private dbContext: FrcStatsContext) {
    }
    private async getEventTeams() {
      this.teams = []
      let eventTeams = await this.dbContext.getEventTeams(this.event.year, this.event.eventCode);
      for(var i = 0; i < EventMatchSlots.length; i++) {
        let element = EventMatchSlots[i];
        let index = element.prop;
        let teamNum = this.eventMatch[index];
        await this.dbContext.getTeam(teamNum).then(team => {
          this.teams.push({ team: team, slot: element, matches: [], stats: null })
        });
      }
    }
    private async getTeamMatches() {
      for(var team of this.teams){
        team.matches = await this.dbContext.teamMatches2019
          .where(["eventCode", "teamNumber"])
          .equals([this.event.eventCode, team.team.teamNumber]).toArray();
        team.matches.sort((a, b) => naturalSort(a.matchNumber, b.matchNumber));
        team.stats=makeTeamStats(team.team, team.matches)
      }
    }
    public async activate(
        params: any
    ) {
        this.event = await this.dbContext.getEvent(params.year, params.eventCode);
        this.eventMatch = await this.dbContext.getEventMatch(params.year, params.eventCode, params.matchNumber);
        await this.getEventTeams();
        await this.getTeamMatches();
    }
}

import { autoinject } from "aurelia-framework";
import { FrcStatsContext, TeamEntity, EventTeamEntity, EventMatchSlots, TeamMatch2019Entity, EventMatchEntity, EventEntity } from "../../persistence";
import * as naturalSort from "javascript-natural-sort";
import { DeepSpaceTeamStatistics, makeTeamStats } from "./statistics";

@autoinject
export class viewPage {
    public event: EventEntity;
    public eventMatch: EventMatchEntity;
    public teams: {
        team: TeamEntity, eventTeam: EventTeamEntity,
        matches: TeamMatch2019Entity[], stats: DeepSpaceTeamStatistics
    }[];
    constructor(private dbContext: FrcStatsContext) {
    }
    private async getEventTeams() {
        this.teams = []
        let eventTeams = await this.dbContext.getEventTeams(this.event.year, this.event.eventCode);
        var gettingTeams = eventTeams.map(eventTeam => {
            return this.dbContext.getTeam(eventTeam.teamNumber).then(team => {
                if (EventMatchSlots.some(slot => this.eventMatch[slot.prop] == team.teamNumber)) {
                    this.teams.push({ team: team, eventTeam: eventTeam, matches: [], stats: null })
                }
            });
        });

        await Promise.all(gettingTeams);
        this.teams.sort((a, b) => naturalSort(a.team.teamNumber, b.team.teamNumber));
    }
    private async getTeamMatches() {
        for(var team of this.teams){
              if (team.eventTeam.year == "2019") {
                team.matches = await this.dbContext.teamMatches2019
                  .where(["eventCode", "teamNumber"])
                  .equals([team.eventTeam.eventCode, team.eventTeam.teamNumber]).toArray();
                team.matches.sort((a, b) => naturalSort(a.matchNumber, b.matchNumber));
                team.stats=makeTeamStats(team.team, team.matches)
            }
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
import {EventTeamData} from "./model";

export class EventTeams {
	public teams: EventTeamData[];
	constructor(){
		this.teams = [];
		var team = new EventTeamData();
		team.teamNumber = "1234";
		team.matchCount = 1;
		team.failureCount = 2;
		team.scale = true;
		team.switch_cap = true;
		team.vault = false;
		team.foulCount = 3;
		team.cubeAverage = 4;
		team.eventCode = "wayak";
		this.teams.push(team);
	}
}
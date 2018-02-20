export class MatchData {
	public year: string;
	public eventCode: string;
	public teamNumber: string;
	public matchNumber: string;

	public isFailure: boolean;
	public failureReason: string;
	public isSwitch: boolean;
	public isScale: boolean;
	public isVault: boolean;
	public isFoul: boolean;
	public foulCount: string;
	public foulReason: string;
	public cubeCount: string;
}

export class EventTeamData {
	public year: string;
	public eventCode: string;
	public teamNumber: string;

	public matchCount: number;
	public failureCount: number;
	public scale: string;
	public switch_cap: string;
	public vault: string;
	public foulCount: number;
	public cubeAverage: number;
}

import { QualitativeAnswer, TeamMatch2019Entity } from "../../persistence";

export class DeepSpaceTeamStatistics {
  teamName: string;
	year: string;
	eventCode: string;
  teamNumber: string;

  avgGamepieceCount: number;
  avgCargoCount: number;
  avgHatchPanelCount: number;
  avgSandstormCargoCount: number;
  avgSandstormHatchPanelCount: number;
  avgCargoCycleTime: number;
  avgCargoCycleTimeCargoShip: number;
  avgCargoCycleTimeRocketLow: number;
  avgCargoCycleTimeRocketMid: number;
  avgCargoCycleTimeRocketHigh: number;
  avgHatchPanelCycleTime: number;
  avgHatchPanelCycleTimeRocketLow: number;
  avgHatchPanelCycleTimeRocketMid: number;
  avgHatchPanelCycleTimeRocketHigh: number;
  cargoPlacedMatchCount: number;
  hatchPanelPlacedMatchCount: number;
  matchesPlayed: number;
  cargoPickup: QualitativeAnswer;
  hatchPanelPickup: QualitativeAnswer;

  climbLevel2Attempts: number;
  climbLevel2Successes: number;
  liftLevel2Count: number;
  climbLevel3Attempts: number;
  climbLevel3Successes: number;
  avgClimbLevel3Time: number;
  liftLevel3Count: number;
}

export function makeTeamStats(x: TeamMatch2019Entity[]): DeepSpaceTeamStatistics {
  let result = new DeepSpaceTeamStatistics();

  return result;
} 

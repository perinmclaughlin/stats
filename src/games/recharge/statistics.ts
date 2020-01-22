import { QualitativeAnswer, TeamMatch2020Entity, TeamEntity} from "../../persistence";
import { print } from "util";
import { placementTime } from "./model";

export class RechargeTeamStatistics {
  teamName: string;
	year: string;
  eventCode: string;
  teamNumber: string;
  
  //declare stuff
 
}

export function makeTeamStats(team: TeamEntity, x: TeamMatch2020Entity[]): RechargeTeamStatistics {
  let result = new RechargeTeamStatistics();
  // Sums up matches
  return result;
  
} 


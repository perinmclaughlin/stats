import { QualitativeAnswer, TeamMatch2019Entity, qualitativeAnswers, TeamEntity, DeepSpaceLocation, QualitativeNumeric } from "../../persistence";
import { print } from "util";
import { placementTime } from "./model";

export class DeepSpaceTeamStatistics {
  teamName: string;
	year: string;
  eventCode: string;
  teamNumber: string;

/* The biggest variable dump I have ever seen. */

  /**The average number of cargo and hatch panels placed by the team's robot. */
  avgGamepieceCount: number;
  /**The average number of cargo and hatch panels placed by the team's robot in a match. */
  maxGamepieceCount: number;
  /**The average number of cargo placed by the team's robot. */
  avgCargoCount: number;
  /**The average number of hatch panels placed by the team's robot. */
  avgHatchPanelCount: number;
  /**The average number of cargo placed by the team's robot during the sandstorm period. */
  avgSandstormCargoCount: number;
  /**The average number of hatch panels placed by the team's robot during the sandstorm period. */
  avgSandstormHatchPanelCount: number;
  /**Robot cycle period for placing cargo. */
  avgCargoCycleTime: number;
  /**Raw cargo cycles per 60 seconds. */
  cargoCycleTimeRaw: number;
  /**Robot cycle period for placing cargo in the cargo ship. */
  avgCargoCycleTimeCargoShip: number;
  /**Raw cargo cycles per 60 seconds for cargo ship. */
  cargoCycleTimeCargoShipRaw: number;
  /**Robot cycle period for placing cargo on the lowest level on the rocket. */
  avgCargoCycleTimeRocketLow: number;
  /**Raw cargo cycles per 60 seconds for lower rocket. */
  cargoCycleTimeRocketLowRaw: number;
  /**Robot cycle period for placing cargo on the middle level of the rocket. */
  avgCargoCycleTimeRocketMid: number;
  /**Raw cargo cycles per 60 seconds for middle rocket. */
  cargoCycleTimeRocketMidRaw: number;
  /**Robot cycle period for placing cargo on the highest level of the rocket. */
  avgCargoCycleTimeRocketHigh: number;
  /**Raw cargo cycles per 60 seconds for high rocket. */
  cargoCycleTimeRocketHighRaw: number;
  /**Robot cycle period for placing hatch panels. */
  avgHatchPanelCycleTime: number;
  /**Raw hatch panel cycles per 60 seconds. */
  hatchPanelCycleTimeRaw: number;
  /**Robot cycle period for placing hatch panels on the cargo ship. */
  avgHatchPanelCycleTimeCargoShip: number;
  /**Raw hatch panel cycles per 60 seconds for cargo ship. */
  hatchPanelCycleTimeCargoShipRaw: number;
  /**Robot cycle period for placing hatch panels on the lowest level of the rocket. */
  avgHatchPanelCycleTimeRocketLow: number;
  /**Raw hatch panel cycles per 60 seconds for lower rocket. */
  hatchPanelCycleTimeRocketLowRaw: number;
  /**Robot cycle period for placing hatch panels on the middle level of the rocket. */
  avgHatchPanelCycleTimeRocketMid: number;
  /**Raw hatch panel cycles per 60 seconds for middle rocket. */
  hatchPanelCycleTimeRocketMidRaw: number;
  /**Robot cycle period for placing hatch panels on the highest level of the rocket. */
  avgHatchPanelCycleTimeRocketHigh: number;
  /**Raw hatch panel cycles per 60 seconds for high rocket. */
  hatchPanelCycleTimeRocketHighRaw: number;
  /**The number of matches where a team placed at least one cargo. */
  cargoPlacedMatchCount: number;
  /**The number of matches where a team placed at least one hatch panel. */
  hatchPanelPlacedMatchCount: number;
  /**The number of matches a team has played. */
  matchesPlayed: number;
  /**A rating of how effectively a team can pick up cargo. */
  cargoPickup: QualitativeAnswer;
  /**A rating of how effectively a team can pick up hatch panels. */
  hatchPanelPickup: QualitativeAnswer;
  /**Number of times a team has attempted to climb the second level of the pedestal. */
  climbLevel2Attempts: number;
  /**Number of times a team has successfully climbed to the second level of the pedestal. */
  climbLevel2Successes: number;
  /**Number of robots a team has lifted to the second level of the pedestal. */
  liftLevel2Count: number;
  /**Number of times a team has attemped to climb to the third level of the pedestal. */
  climbLevel3Attempts: number;
  /**Number of times a team has successfully climbed to the third level of the pedestal. */
  climbLevel3Successes: number;
  /**The time it took for a team to climb to the third level of the pedestal. */
  avgClimbLevel3Time: number;
  /**Number of robots a team has lifted to the third level of the pedestal. */
  liftLevel3Count: number;
  /**The number of matches that contain data for a team. */
  matchCount: number;
  /**The raw value used for assigning cargoPickup. */
  cargoPickupRaw: number;
  /**The raw value used for assigning hatchPanelPickup. */
  hatchPanelPickupRaw: number;
  /**The raw value used for avgCargoCount. */
  cargoCountRaw: number;
  /**The raw value used for avgHatchPanelCount. */
  hatchPanelCountRaw: number;
  /**The raw value used for avgCargoCycleTimeRocketLow. */
  cargoCountRocketLowRaw: number;
  /**The raw value used for avgCargoCycleTimeRocketMid. */
  cargoCountRocketMidRaw: number;
  /**The raw value used for avgCargoCycleTimeRocketHigh. */
  cargoCountRocketHighRaw: number;
  /**The raw value used for avgCargoCycleTimeCargoShip. */
  cargoCountCargoShipRaw: number;
  /**The raw value used for avgHatchPanelCycleTimeRocketLow. */
  hatchPanelCountRocketLowRaw: number;
  /**The raw value used for avgHatchPanelCycleTimeRocketMid. */
  hatchPanelCountRocketMidRaw: number;
  /**The raw value used for avgHatchPanelCycleTimeRocketHigh. */
  hatchPanelCountRocketHighRaw: number;
  /**The raw value used for avgHatchPanelCycleTimeCargoShip. */
  hatchPanelCountCargoShipRaw: number;
  /**The raw value used for avgSandstormCargoCount. */
  sandstormCargoCountRaw: number;
  /**The raw value used for avgSandstormHatchPanelCount. */
  sandstormHatchPanelCountRaw: number;
  /**The number of teams a team has lifted. */
  teamsLiftedCount: number;
  /**Stores the locations where a team has placed cargo. Useful for the event-team page. */
  locationsPlacedCargo: DeepSpaceLocation[];
  /**Stores the locations where a team has placed hatch panels. Useful for the event-team page. */
  locationsPlacedHatch: DeepSpaceLocation[];
  /**A string representation of locationsPlacedCargo */
  locationsCargoString: string;
  /**A string representation of locationsPlacedHatch */
  locationsHatchString: string;
  /**The percentage of matches where a team placed cargo. */
  cargoPercent: number;
  /**The percentage of matches where a team placed hatch panels. */
  hatchPanelPercent: number;
  /**A rating of how efficient a robot's drivetrain is. */
  drivetrainStrength: QualitativeAnswer;
  /**Notes on the vulnerabilities of a robot's drivetrain. */
  defenseWeaknesses: string;
  /**Foul count. */
  foulCount: number;
  /**Failure count. */
  failureCount: number;
}

export function makeTeamStats(team: TeamEntity, x: TeamMatch2019Entity[]): DeepSpaceTeamStatistics {
  let result = new DeepSpaceTeamStatistics();
  //Many many vars created just for the for loop below.
  let cargoCount = 0;
  let cargoSandstorm = 0;
  let hatchCount = 0;
  let hatchSandstorm = 0;
  let cargoPickupRatings = [];
  let hatchPickupRatings = [];
  let drivetrainStrengthRatings = [];
  let cycleCargo = [];
  let cycleHatch = [];
  let cycleCargoLow = [];
  let cycleCargoShip = [];
  let cycleCargoMid = [];
  let cycleCargoHigh = [];
  let cycleHatchLow = [];
  let cycleHatchShip = [];
  let cycleHatchMid = [];
  let cycleHatchHigh = [];
  let mapCargo = new Map();
  let mapHatch = new Map();
  let level3Times = [];

  result.matchCount = 0;
  result.cargoPickupRaw = 0;
  result.hatchPanelPickupRaw = 0;

  result.cargoCountRaw = 0;
  result.hatchPanelCountRaw = 0;
  result.sandstormCargoCountRaw = 0;
  result.sandstormHatchPanelCountRaw = 0;
  result.cargoCountRocketHighRaw = 0;
  result.cargoCountRocketLowRaw = 0;
  result.cargoCountRocketMidRaw = 0;
  result.cargoCountCargoShipRaw = 0;
  result.hatchPanelCountCargoShipRaw = 0;
  result.hatchPanelCountRocketHighRaw = 0;
  result.hatchPanelCountRocketLowRaw = 0;
  result.hatchPanelCountRocketMidRaw = 0;

  result.teamsLiftedCount = 0;
  result.cargoCycleTimeRaw = 0;
  result.cargoCycleTimeCargoShipRaw = 0;
  result.cargoCycleTimeRocketHighRaw = 0;
  result.cargoCycleTimeRocketLowRaw = 0;
  result.cargoCycleTimeRocketMidRaw = 0;
  result.hatchPanelCycleTimeRaw = 0;
  result.hatchPanelCycleTimeCargoShipRaw = 0;
  result.hatchPanelCycleTimeRocketHighRaw = 0;
  result.hatchPanelCycleTimeRocketLowRaw = 0;
  result.hatchPanelCycleTimeRocketMidRaw = 0;
  result.climbLevel2Attempts = 0;
  result.climbLevel2Successes = 0;
  result.climbLevel3Attempts = 0;
  result.climbLevel3Successes = 0;

  result.avgCargoCycleTime = 160;
  result.avgCargoCycleTimeCargoShip = 160;
  result.avgCargoCycleTimeRocketHigh = 160;
  result.avgCargoCycleTimeRocketLow = 160;
  result.avgCargoCycleTimeRocketMid = 160;
  result.avgHatchPanelCycleTime = 160;
  result.avgHatchPanelCycleTimeCargoShip = 160;
  result.avgHatchPanelCycleTimeRocketHigh = 160;
  result.avgHatchPanelCycleTimeRocketLow = 160;
  result.avgHatchPanelCycleTimeRocketMid = 160;

  result.locationsCargoString = "";
  result.locationsHatchString = "";
  result.cargoPercent = 0;
  result.hatchPanelPercent = 0;
  result.liftLevel2Count = 0;
  result.liftLevel3Count = 0;

  result.cargoPlacedMatchCount = 0;
  result.hatchPanelPlacedMatchCount = 0;
  result.matchesPlayed = x.length;
  result.locationsPlacedCargo = [];
  result.locationsPlacedHatch = [];
  result.defenseWeaknesses = "";
  result.avgClimbLevel3Time = 999;
  result.foulCount = 0;
  result.failureCount = 0;

  result.matchCount = x.length;
  result.maxGamepieceCount = 0;

  result.teamNumber = team.teamNumber;
  result.teamName = team.teamName;

  //This for loop is a nightmare.
  for(var i = 0; i < x.length; i++) {
    var alreadyAddedCargo = false;
    var alreadyAddedHatch = false;

    if(x[i].isFoul) {
      result.foulCount++;
    }
    if(x[i].isFailure) {
      result.failureCount++;
    }

    if(x[i].level3ClimbAttempted && x[i].level3ClimbSucceeded && x[i].level3ClimbBegin != null && x[i].level3ClimbEnd != null) {
      level3Times.push(x[i].level3ClimbBegin - x[i].level3ClimbEnd);
    }

    if((x[i].didLiftLevel3 && x[i].lifted.length > 0) && x[i].liftedSomeone) {
      result.liftLevel3Count += x[i].lifted.length;
    } else if((!x[i].didLiftLevel3 && x[i].lifted.length > 0) && x[i].liftedSomeone) {
      result.liftLevel2Count += x[i].lifted.length;
    } else {
      result.liftLevel2Count += 0;
      result.liftLevel3Count += 0;
    }

    let matchCargoCount = 0;
    let matchHatchPanelCount = 0;
    for(var j = 0; j < x[i].placements.length; j++) {
      if(x[i].placements[j].gamepiece == "Cargo") {
        mapCargo.set(x[i].placements[j].location, 1);
      } else if(x[i].placements[j].gamepiece == "Hatch Panel") {
        mapHatch.set(x[i].placements[j].location, 1);
      } else {
        console.log("DeepSpaceGamepiece of", x[i].placements[j].gamepiece, "is invalid.");
      }

      if(j != 0 && x[i].placements[j].gamepiece == "Cargo") {
        if((!x[i].placements[j].sandstorm && !x[i].placements[j - 1].sandstorm) || (x[i].placements[j].sandstorm && x[i].placements[j - 1].sandstorm)) {
          cycleCargo.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          if(x[i].placements[j].location == "Cargo Ship") {
            cycleCargoShip.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else if(x[i].placements[j].location == "Rocket Low") {
            cycleCargoLow.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else if(x[i].placements[j].location == "Rocket Mid") {
            cycleCargoMid.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else if(x[i].placements[j].location == "Rocket High") {
            cycleCargoHigh.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else {
            console.log("Hmm, appears there is an invalid location of", x[i].placements[j].location);
          }
        } else {
          cycleCargo.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          if(x[i].placements[j].location == "Cargo Ship") {
            cycleCargoShip.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else if(x[i].placements[j].location == "Rocket Low") {
            cycleCargoLow.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else if(x[i].placements[j].location == "Rocket Mid") {
            cycleCargoMid.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else if(x[i].placements[j].location == "Rocket High") {
            cycleCargoHigh.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else {
            console.log("Hmm, appears there is an invalid location of", x[i].placements[j].location);
          }
        }
      }

      if(j != 0 && x[i].placements[j].gamepiece == "Hatch Panel") {
        if((!x[i].placements[j].sandstorm && !x[i].placements[j - 1].sandstorm) || (x[i].placements[j].sandstorm && x[i].placements[j - 1].sandstorm)) {
          cycleHatch.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          if(x[i].placements[j].location == "Cargo Ship") {
            cycleHatchShip.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else if(x[i].placements[j].location == "Rocket Low") {
            cycleHatchLow.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else if(x[i].placements[j].location == "Rocket Mid") {
            cycleHatchMid.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else if(x[i].placements[j].location == "Rocket High") {
            cycleHatchHigh.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else {
            console.log("Hmm, appears there is an invalid location of", x[i].placements[j].location);
          }
        } else {
          cycleHatch.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          if(x[i].placements[j].location == "Cargo Ship") {
            cycleHatchShip.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else if(x[i].placements[j].location == "Rocket Low") {
            cycleHatchLow.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else if(x[i].placements[j].location == "Rocket Mid") {
            cycleHatchMid.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else if(x[i].placements[j].location == "Rocket High") {
            cycleHatchHigh.push(placementTime(x[i].placements[j - 1]) - placementTime(x[i].placements[j]));
          } else {
            console.log("Hmm, appears there is an invalid location of", x[i].placements[j].location);
          }
        }
      }

      if(x[i].placements[j].gamepiece == "Cargo") {
        cargoCount++;
        matchCargoCount++;
        //console.log(cargoCount);
        if(!alreadyAddedCargo) {
          result.cargoPlacedMatchCount++;
          alreadyAddedCargo = !alreadyAddedCargo;
        }
        switch(x[i].placements[j].location) {
          case "Cargo Ship":
            result.cargoCountCargoShipRaw++;
            //console.log("result.cargoCountCargoShipRaw for team", team.teamNumber, "is", result.cargoCountCargoShipRaw);
            break;
          case "Rocket Low":
            result.cargoCountRocketLowRaw++;
            //console.log("result.cargoCountRocketLowRaw for team", team.teamNumber, "is", result.cargoCountRocketLowRaw);
            break;
          case "Rocket Mid":
            result.cargoCountRocketMidRaw++;
            //console.log("result.cargoCountRocketMidRaw for team", team.teamNumber, "is", result.cargoCountRocketMidRaw);
            break;
          case "Rocket High":
            result.cargoCountRocketHighRaw++;
            //console.log("result.cargoCountRocketHighRaw for team", team.teamNumber, "is", result.cargoCountRocketHighRaw);
            break;
          default:
            break;
        }
      }
      if(x[i].placements[j].gamepiece == "Hatch Panel") {
        hatchCount++;
        matchHatchPanelCount++;
        //console.log(hatchCount);
        if(!alreadyAddedHatch) {
          result.hatchPanelPlacedMatchCount++;
          alreadyAddedHatch = !alreadyAddedHatch;
        }
        switch(x[i].placements[j].location) {
          case "Cargo Ship":
            result.hatchPanelCountCargoShipRaw++;
            //console.log("result.hatchPanelCountCargoShipRaw for team", team.teamNumber, "is", result.hatchPanelCountCargoShipRaw);
            break;
          case "Rocket Low":
            result.hatchPanelCountRocketLowRaw++;
            //console.log("result.hatchPanelCountRocketLowRaw for team", team.teamNumber, "is", result.hatchPanelCountRocketLowRaw);
            break;
          case "Rocket Mid":
            result.hatchPanelCountRocketMidRaw++;
            //console.log("result.hatchPanelCountRocketMidRaw for team", team.teamNumber, "is", result.hatchPanelCountRocketMidRaw);
            break;
          case "Rocket High":
            result.hatchPanelCountRocketHighRaw++;
            //console.log("result.hatchPanelCountRocketHighRaw for team", team.teamNumber, "is", result.hatchPanelCountRocketHighRaw);
            break;
          default:
            break;
        }
      }
      if(x[i].placements[j].gamepiece == "Cargo" && x[i].placements[j].sandstorm == true) {
        cargoSandstorm++;
      }
      if(x[i].placements[j].gamepiece == "Hatch Panel" && x[i].placements[j].sandstorm == true) {
        hatchSandstorm++;
        if(!alreadyAddedHatch) {
          result.hatchPanelPlacedMatchCount++;
          alreadyAddedHatch = !alreadyAddedHatch;
        }
      }

      if(matchHatchPanelCount + matchCargoCount > result.maxGamepieceCount) {
        result.maxGamepieceCount = matchHatchPanelCount + matchCargoCount;
      }
    }
  }

  //Most assignments will occur here.
  if(result.matchesPlayed == 0) {
    result.avgCargoCount = 0;
    result.avgHatchPanelCount = 0;
    result.avgGamepieceCount = 0;
    result.avgSandstormCargoCount = 0;
    result.avgSandstormHatchPanelCount = 0;
    result.drivetrainStrength = {
      numeric: 0,
      name: "N/A"
    };
  }
  else {
    result.cargoCountRaw = cargoCount;
    result.hatchPanelCountRaw = hatchCount;

    result.avgCargoCount = cargoCount / result.matchesPlayed;
    result.avgHatchPanelCount = hatchCount / result.matchesPlayed;
    result.avgGamepieceCount = (cargoCount + hatchCount) / result.matchesPlayed;
    result.avgSandstormCargoCount = cargoSandstorm / result.matchesPlayed;
    result.avgSandstormHatchPanelCount = hatchSandstorm / result.matchesPlayed;

    result.teamsLiftedCount += (result.liftLevel2Count + result.liftLevel3Count);

    //Raw cycle times --> NOT ELLERY'S CYCLE TIMES
    result.cargoCycleTimeRaw = (result.cargoCountRaw / 160) * 60;
    //console.log("result.cargoCycleTimeRaw for team", team.teamNumber, "is", result.cargoCycleTimeRaw);
    result.hatchPanelCycleTimeRaw = (result.hatchPanelCountRaw / 160) * 60;
    //console.log("result.hatchPanelCycleTimeRaw for team", team.teamNumber, "is", result.hatchPanelCycleTimeRaw);
    result.cargoCycleTimeCargoShipRaw = (result.cargoCountCargoShipRaw / 160) * 60;
    //console.log("result.cargoCycleTimeCargoShipRaw for team", team.teamNumber, "is", result.cargoCycleTimeCargoShipRaw);
    result.hatchPanelCycleTimeCargoShipRaw = (result.hatchPanelCountCargoShipRaw / 160) * 60;
    //console.log("result.hatchPanelCycleTimeCargoShipRaw for team", team.teamNumber, "is", result.hatchPanelCycleTimeCargoShipRaw);
    result.cargoCycleTimeRocketLowRaw = (result.cargoCountRocketLowRaw / 160) * 60;
    //console.log("result.cargoCycleTimeRocketLowRaw for team", team.teamNumber, "is", result.cargoCycleTimeRocketLowRaw);
    result.hatchPanelCycleTimeRocketLowRaw = (result.hatchPanelCountRocketLowRaw / 160) * 60;
    //console.log("result.hatchPanelCycleTimeRocketLowRaw for team", team.teamNumber, "is", result.hatchPanelCycleTimeRocketLowRaw);
    result.cargoCycleTimeRocketMidRaw = (result.cargoCountRocketMidRaw / 160) * 60;
    //console.log("result.cargoCycleTimeRocketMidRaw for team", team.teamNumber, "is", result.cargoCycleTimeRocketMidRaw);
    result.hatchPanelCycleTimeRocketMidRaw = (result.hatchPanelCountRocketMidRaw / 160) * 60;
    //console.log("result.hatchPanelCycleTimeRocketMidRaw for team", team.teamNumber, "is", result.hatchPanelCycleTimeRocketMidRaw);
    result.cargoCycleTimeRocketHighRaw = (result.cargoCountRocketHighRaw / 160) * 60;
    //console.log("result.cargoCycleTimeRocketHighRaw for team", team.teamNumber, "is", result.cargoCycleTimeRocketHighRaw);
    result.hatchPanelCycleTimeRocketHighRaw = (result.hatchPanelCountRocketHighRaw / 160) * 60;
    //console.log("result.hatchPanelCycleTimeRocketHighRaw for team", team.teamNumber, "is", result.hatchPanelCycleTimeRocketHighRaw);

    result.hatchPanelPercent = (result.hatchPanelPlacedMatchCount / result.matchCount) * 100;
    //console.log("calculated hatchPanelPercent by dividing ", result.hatchPanelPlacedMatchCount, " by ", result.matchCount);
    result.cargoPercent = (result.cargoPlacedMatchCount / result.matchCount) * 100;
    //console.log("calculated cargoPercent by dividing ", result.cargoPlacedMatchCount, " by ", result.matchCount);

    let temp = 0;
    let increment = 0;
    for(var u = 0; u < cycleCargo.length; u++) {
      temp += (cycleCargo[u]);
      //console.log("For team", result.teamNumber, "temp is currently", temp);
      //console.log("For team", result.teamNumber, "cycleCargo[",u,"] is", cycleCargo[u]);
      increment++;
    }
    if(increment != 0) {
      result.avgCargoCycleTime = temp / increment;
      //console.log("temp for team", result.teamNumber, "is", temp,", and increment is", increment);
    }
//    console.log("result.avgCargoCycleTime for team", team.teamNumber, "is", result.avgCargoCycleTime);
    temp = 0;
    increment = 0;
    for(var u = 0; u < cycleCargoShip.length; u++) {
      temp += (cycleCargoShip[u]);
      increment++;
    }
    if(increment != 0) {
      result.avgCargoCycleTimeCargoShip = temp / increment;
    }
  //  console.log("result.avgCargoCycleTimeCargoShip for team", team.teamNumber, "is", result.avgCargoCycleTimeCargoShip);
    temp = 0;
    increment = 0;
    for(var u = 0; u < cycleCargoLow.length; u++) {
      temp += (cycleCargoLow[u]);
      increment++;
    }
    if(increment != 0) {
      result.avgCargoCycleTimeRocketLow = temp / increment;
    }
    //console.log("result.avgCargoCycleTimeRocketLow for team", team.teamNumber, "is", result.avgCargoCycleTimeRocketLow);
    temp = 0;
    increment = 0;
    for(var u = 0; u < cycleCargoMid.length; u++) {
      temp += (cycleCargoMid[u]);
      increment++;
    }
    if(increment != 0) {
      result.avgCargoCycleTimeRocketMid = temp / increment;
    }
//    console.log("result.avgCargoCycleTimeRocketMid for team", team.teamNumber, "is", result.avgCargoCycleTimeRocketMid);
    temp = 0;
    increment = 0;
    for(var u = 0; u < cycleCargoHigh.length; u++) {
      temp += (cycleCargoHigh[u]);
      increment++;
    }
    if(increment != 0) {
      result.avgCargoCycleTimeRocketHigh = temp / increment;
    }
  //  console.log("result.avgCargoCycleTimeRocketHigh for team", team.teamNumber, "is", result.avgCargoCycleTimeRocketHigh);
    temp = 0;
    increment = 0;

    for(var u = 0; u < cycleHatch.length; u++) {
      temp += (cycleHatch[u]);
      increment++;
    }
    if(increment != 0) {
      result.avgHatchPanelCycleTime = temp / increment;
    }
    //console.log("result.avgHatchPanelCycleTime for team", team.teamNumber, "is", result.avgHatchPanelCycleTime);
    temp = 0;
    increment = 0;
    for(var u = 0; u < cycleHatchShip.length; u++) {
      temp += (cycleHatchShip[u]);
      increment++;
    }
    if(increment != 0) {
      result.avgHatchPanelCycleTimeCargoShip = temp / increment;
    }
//    console.log("result.avgHatchPanelCycleTimeCargoShip for team", team.teamNumber, "is", result.avgHatchPanelCycleTimeCargoShip);
    temp = 0;
    increment = 0;
    for(var u = 0; u < cycleHatchLow.length; u++) {
      temp += (cycleHatchLow[u]);
      increment++;
    }
    if(increment != 0) {
      result.avgHatchPanelCycleTimeRocketLow = temp / increment;
    }
  //  console.log("result.avgHatchPanelCycleTimeRocketLow for team", team.teamNumber, "is", result.avgHatchPanelCycleTimeRocketLow);
    temp = 0;
    increment = 0;
    for(var u = 0; u < cycleHatchMid.length; u++) {
      temp += (cycleHatchMid[u]);
      increment++;
    }
    if(increment != 0) {
      result.avgHatchPanelCycleTimeRocketMid = temp / increment;
    }
    //console.log("result.avgHatchPanelCycleTimeRocketMid for team", team.teamNumber, "is", result.avgHatchPanelCycleTimeRocketMid);
    temp = 0;
    increment = 0;
    for(var u = 0; u < cycleHatchHigh.length; u++) {
      temp += (cycleHatchHigh[u]);
      increment++;
    }
    if(increment != 0) {
      result.avgHatchPanelCycleTimeRocketHigh = temp / increment;
    }
    //console.log("result.avgHatchPanelCycleTimeRocketHigh for team", team.teamNumber, "is", result.avgHatchPanelCycleTimeRocketHigh);

    for(var i = 0; i < x.length; i++) {
      if(x[i].level2ClimbAttempted) {
        result.climbLevel2Attempts++;
      }
      if(x[i].level3ClimbAttempted) {
        result.climbLevel3Attempts++;
      }
      if(x[i].level2ClimbSucceeded) {
        result.climbLevel2Successes++;
      }
      if(x[i].level3ClimbSucceeded) {
        result.climbLevel3Successes++;
      }
      if(x[i].cargoPickup != 0) {
        cargoPickupRatings.push(x[i].cargoPickup);
      }
      if(x[i].hatchPanelPickup != 0) {
        hatchPickupRatings.push(x[i].hatchPanelPickup);
      }
      if(x[i].defenseCapability != 0) {
        drivetrainStrengthRatings.push(x[i].defenseCapability);
      }
      //console.log("x[",i,"].defenseCapability for team", result.teamNumber, "is", x[i].defenseCapability);
    }

    result.sandstormCargoCountRaw = cargoSandstorm;
    result.sandstormHatchPanelCountRaw = hatchSandstorm;

    if(isNaN(result.avgCargoCycleTime)) {
      result.avgCargoCycleTime = 0;
    }
    if(isNaN(result.avgCargoCycleTimeCargoShip)) {
      result.avgCargoCycleTimeCargoShip = 0;
    }
    if(isNaN(result.avgCargoCycleTimeRocketHigh)) {
      result.avgCargoCycleTimeRocketHigh = 0;
    }
    if(isNaN(result.avgCargoCycleTimeRocketLow)) {
      result.avgCargoCycleTimeRocketLow = 0;
    }
    if(isNaN(result.avgCargoCycleTimeRocketMid)) {
      result.avgCargoCycleTimeRocketMid = 0;
    }
    if(isNaN(result.avgHatchPanelCycleTime)) {
      result.avgHatchPanelCycleTime = 0;
    }
    if(isNaN(result.avgHatchPanelCycleTimeCargoShip)) {
      result.avgHatchPanelCycleTimeCargoShip = 0;
    }
    if(isNaN(result.avgHatchPanelCycleTimeRocketHigh)) {
      result.avgHatchPanelCycleTimeRocketHigh = 0;
    }
    if(isNaN(result.avgHatchPanelCycleTimeRocketLow)) {
      result.avgHatchPanelCycleTimeRocketLow = 0;
    }
    if(isNaN(result.avgHatchPanelCycleTimeRocketMid)) {
      result.avgHatchPanelCycleTimeRocketMid = 0;
    }
  }

  if(level3Times.length > 0) {
    result.avgClimbLevel3Time = 0;
    for(var i = 0; i < level3Times.length; i++) {
      result.avgClimbLevel3Time += level3Times[i];
    }
    result.avgClimbLevel3Time = result.avgClimbLevel3Time / level3Times.length;
  }

  result.drivetrainStrength = calculateAvgQualitative(drivetrainStrengthRatings);
  result.cargoPickup = calculateAvgQualitative(cargoPickupRatings);
  result.hatchPanelPickup = calculateAvgQualitative(hatchPickupRatings)

  if(mapCargo.size > 0) {
    result.locationsPlacedCargo = Array.from(mapCargo.keys());
  }
  if(mapHatch.size > 0) {
    result.locationsPlacedHatch = Array.from(mapHatch.keys());
  }

  result.teamName = team.teamName;
  result.teamNumber = team.teamNumber;

  return result;
} 

function calculateAvgQualitative(ratings: QualitativeNumeric[]): QualitativeAnswer {
  let sum = ratings.reduce((a, b) => a + b, 0);
  let count = ratings.length;
  let hatchPickup = count == 0 ? 0 : sum / count;
  if(hatchPickup > 0 && hatchPickup <= 15) {
    return {
      numeric: 10,
      name: "Poor"
    };
  } else if(hatchPickup > 15 && hatchPickup <= 25) {
    return {
      numeric: 20,
      name: "Decent"
    };
  } else if(hatchPickup > 25 && hatchPickup <= 35) {
    return  {
      numeric: 30,
      name: "Good"
    };
  } else if(hatchPickup > 35) {
    return {
      numeric: 40,
      name: "Excellent"
    };
  } else if(hatchPickup == 0) {
    return {
      numeric: 0,
      name: "N/A"
    };
  } else {
    console.info("invalid: ", hatchPickup);
    return {
      numeric: 0,
      name: "INVALID"
    };
  }
}

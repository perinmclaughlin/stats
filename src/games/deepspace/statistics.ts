import { QualitativeAnswer, TeamMatch2019Entity, qualitativeAnswers, TeamEntity } from "../../persistence";
import { print } from "util";

export class DeepSpaceTeamStatistics {
  teamName: string;
	year: string;
  eventCode: string;
  teamNumber: string;

/* The biggest variable dump I have ever seen. */

  /**The average number of cargo and hatch panels placed by the team's robot. */
  avgGamepieceCount: number;
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
  /**Robot cycle period for placing cargo in the cargo ship. */
  avgCargoCycleTimeCargoShip: number;
  /**Robot cycle period for placing cargo on the lowest level on the rocket. */
  avgCargoCycleTimeRocketLow: number;
  /**Robot cycle period for placing cargo on the middle level of the rocket. */
  avgCargoCycleTimeRocketMid: number;
  /**Robot cycle period for placing cargo on the highest level of the rocket. */
  avgCargoCycleTimeRocketHigh: number;
  /**Robot cycle period for placing hatch panels. */
  avgHatchPanelCycleTime: number;
  /**Robot cycle period for placing hatch panels on the lowest level of the rocket. */
  avgHatchPanelCycleTimeRocketLow: number;
  /**Robot cycle period for placing hatch panels on the middle level of the rocket. */
  avgHatchPanelCycleTimeRocketMid: number;
  /**Robot cycle period for placing hatch panels on the highest level of the rocket. */
  avgHatchPanelCycleTimeRocketHigh: number;
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
  /**The raw value used for avgSandstormCargoCount. */
  sandstormCargoCountRaw: number;
  /**The raw value used for avgSandstormHatchPanelCount. */
  sandstormHatchPanelCountRaw: number;
  /**The number of teams a team has lifted. */
  teamsLiftedCount: number;
}

export function makeTeamStats(team: TeamEntity, x: TeamMatch2019Entity[]): DeepSpaceTeamStatistics {
  let result = new DeepSpaceTeamStatistics();
  //Many many vars created just for the for loop below.
  let cargoCount = 0;
  let cargoSandstorm = 0;
  let hatchCount = 0;
  let hatchSandstorm = 0;
  let cargoPickup = 0;
  let hatchPickup = 0;
  result.matchCount = 0;
  result.cargoPickupRaw = 0;
  result.hatchPanelPickupRaw = 0;
  result.cargoCountRaw = 0;
  result.hatchPanelCountRaw = 0;
  result.sandstormCargoCountRaw = 0;
  result.sandstormHatchPanelCountRaw = 0;
  result.teamsLiftedCount = 0;

  result.cargoPlacedMatchCount = 0;
  result.hatchPanelPlacedMatchCount = 0;
  result.matchesPlayed = x.length;

  //This for loop is a nightmare.
  for(var i = 0; i < x.length; i++) {
    var alreadyAddedCargo = false;
    var alreadyAddedHatch = false;
    for(var j = 0; j < x[i].placements.length; j++) {
      if(x[i].placements[j].gamepiece == "Cargo") {
        cargoCount++;
        if(!alreadyAddedCargo) {
          result.cargoPlacedMatchCount++;
          alreadyAddedCargo = !alreadyAddedCargo;
        }
      }
      if(x[i].placements[j].gamepiece == "Hatch Panel") {
        hatchCount++;
        if(!alreadyAddedHatch) {
          result.hatchPanelPlacedMatchCount++;
          alreadyAddedHatch = !alreadyAddedHatch;
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
    }
  }

  //Most assignments will occur here.
  if(result.matchesPlayed == 0) {
    result.avgCargoCount = 0;
    result.avgHatchPanelCount = 0;
    result.avgGamepieceCount = 0;
    result.avgSandstormCargoCount = 0;
    result.avgSandstormHatchPanelCount = 0;
    cargoPickup = 0;
  }
  else {
    result.avgCargoCount = cargoCount / result.matchesPlayed;
    result.avgHatchPanelCount = hatchCount / result.matchesPlayed;
    result.avgGamepieceCount = (cargoCount + hatchCount) / result.matchesPlayed;
    result.avgSandstormCargoCount = cargoSandstorm / result.matchesPlayed;
    result.avgSandstormHatchPanelCount = hatchSandstorm / result.matchesPlayed;

    for(var i = 0; i < x.length; i++) {
      if(x[i].lifted.length == 0) {
        result.teamsLiftedCount = 0;
      } else {
        result.teamsLiftedCount += x[i].lifted.length;
      }
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
      if(x[i].lifted.length > 0 && x[i].lifted.length != null) {
        for(var k = 0; k < x[i].lifted.length; k++) {
          result.liftLevel3Count++;
        }
      }
      cargoPickup += x[i].cargoPickup;
      hatchPickup += x[i].hatchPanelPickup;
      result.matchCount++;
    }

    cargoPickup = cargoPickup / result.matchesPlayed;
    result.cargoPickupRaw = cargoPickup;
    hatchPickup = hatchPickup / result.matchesPlayed;
    result.hatchPanelPickupRaw = hatchPickup;
    result.sandstormCargoCountRaw = cargoSandstorm;
    result.sandstormHatchPanelCountRaw = hatchSandstorm;
  }

  result.cargoCountRaw = cargoCount;
  result.hatchPanelCountRaw = hatchCount;

/* Until we can verify that the commented-out lines below will work, they will not be implemented. */
  //result.avgCargoCycleTime = result.avgCargoCount / _Match Time_;
  result.avgCargoCycleTime = 0;
  //result.avgHatchPanelCycleTime = result.avgHatchPanelCount / _Match Time_;
  result.avgHatchPanelCycleTime = 0;
/* And there is noooo way these lines will work (in fact, they are structured to not work), but I am */
/* sure that it will be figured out. Eventually.                                                     */
  //result.avgCargoCycleTimeCargoShip = _cargoCount for cargo ship_ / _some time value_;
  //result.avgCargoCountRocketLow = _cargoCount for rocketLow_ / _some time value_;
  //result.avgCargoCycleTimeRocketMid = _cargoCount for rocketMid_ / _some time value_;
  //result.avgCargoCycleTimeRocketHigh = _cargoCount for rocketHigh_ / _some time value_;
  //result.avgHatchPanelCycleTimeCargoShip = _hatchPanelCount for cargo ship_ / _some time value_;
  //result.avgHatchPanelCountRocketLow = _hatchPanelCount for rocketLow_ / _some time value_;
  //result.avgHatchPanelCycleTimeRocketMid = _hatchPanelCount for rocketMid_ / _some time value_;
  //result.avgHatchPanelCycleTimeRocketHigh = _hatchPanelCount for rocketHigh_ / _some time value_;

  //result.climbLevel3Time = _some time value_;
  //result.liftLevel2Count = _something_;
  //result.liftLevel3Count = _something_;

  //Ahh, a lovely long if-else chain.
  if(cargoPickup > 0 && cargoPickup <= 10) {
    result.cargoPickup = {
      numeric: 10,
      name: "Poor"
    };
  } else if(cargoPickup > 10 && cargoPickup <= 20) {
    result.cargoPickup = {
      numeric: 20,
      name: "Decent"
    };
  } else if(cargoPickup > 20 && cargoPickup <= 30) {
    result.cargoPickup = {
      numeric: 30,
      name: "Good"
    };
  } else if(cargoPickup > 30) {
    result.cargoPickup = {
      numeric: 40,
      name: "Excellent"
    };
  } else if(cargoPickup == 0) {
    result.cargoPickup = {
      numeric: 0,
      name: "N/A"
    };
  } else {
    result.cargoPickup = {
      numeric: 0,
      name: "INVALID"
    };
  }

  //Ahh, another lovely long if-else chain.
  if(hatchPickup > 0 && hatchPickup <= 10) {
    result.hatchPanelPickup = {
      numeric: 10,
      name: "Poor"
    };
  } else if(hatchPickup > 10 && hatchPickup <= 20) {
    result.hatchPanelPickup = {
      numeric: 20,
      name: "Decent"
    };
  } else if(hatchPickup > 20 && hatchPickup <= 30) {
    result.hatchPanelPickup = {
      numeric: 30,
      name: "Good"
    };
  } else if(hatchPickup > 30) {
    result.hatchPanelPickup = {
      numeric: 40,
      name: "Excellent"
    };
  } else if(hatchPickup == 0) {
    result.hatchPanelPickup = {
      numeric: 0,
      name: "N/A"
    };
  } else {
    result.hatchPanelPickup = {
      numeric: 0,
      name: "INVALID"
    };
  }

  result.teamName = team.teamName;
  result.teamNumber = team.teamNumber;

  return result;
} 

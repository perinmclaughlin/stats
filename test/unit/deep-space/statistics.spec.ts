import { DeepSpaceTeamStatistics, makeTeamStats } from '../../../src/games/deepspace/statistics';
import { TeamMatch2019Entity, make2019match, TeamEntity } from '../../../src/persistence';
import { assignIn } from 'lodash';

describe('make team stats', () => {
  let team: TeamEntity;

  beforeEach(() => {
    team = {
      teamNumber: "2222",
      teamName: "Tacos",
      description: "",
      city: "",
      stateprov: "",
      country: "",
      districtCode: "",
    };

  });

  it('should include info', () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];

    let results = makeTeamStats(team, data);
    expect(results.teamNumber).toBe("2222");
    expect(results.teamName).toBe("Tacos");
  });

  it('should calc matches played', () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
      make2019match('STUFF', team.teamNumber, '2'),
      make2019match('STUFF', team.teamNumber, '3')
    ];
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Cargo Ship",
      when: 67.5,
      sandstorm: false
    });
    data[1].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket High",
      when: 45,
      sandstorm: false
    });
    data[2].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Rocket Low",
      when: 110,
      sandstorm: false
    });
    data[2].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Rocket Low",
      when: 90,
      sandstorm: false
    });
    var stats = makeTeamStats(team, data);
    expect(stats.matchesPlayed).toBe(3);
    expect(stats.cargoPlacedMatchCount).toBe(2);
    expect(stats.hatchPanelPlacedMatchCount).toBe(1);
  });

  it("should calculate locations cargo placed", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Rocket High",
      when: 10,
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Cargo Ship",
      when: 5,
      sandstorm: true
    });

    var stats = makeTeamStats(team, data);
    console.log("stats.locationsPlacedCargo for team", stats.teamNumber, "is", stats.locationsPlacedCargo);
    console.log("stats.locationsPlacedHatch for team", stats.teamNumber, "is", stats.locationsPlacedHatch);
    expect(stats.locationsPlacedCargo).toEqual(["Rocket High", "Cargo Ship"]);
    expect(stats.locationsPlacedHatch).toEqual([]);
  });

  it("should calculate locations hatch panel placed", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket High",
      when: 10,
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Cargo Ship",
      when: 5,
      sandstorm: true
    });

    var stats = makeTeamStats(team, data);
    console.log("stats.locationsPlacedCargo for team", stats.teamNumber, "is", stats.locationsPlacedCargo);
    console.log("stats.locationsPlacedHatch for team", stats.teamNumber, "is", stats.locationsPlacedHatch);
    expect(stats.locationsPlacedHatch).toEqual(["Rocket High", "Cargo Ship"]);
    expect(stats.locationsPlacedCargo).toEqual([]);
  });

  it("should calculate average hatch panel cycle time", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Rocket High",
      when: 10,
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Cargo Ship",
      when: 5,
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket Low",
      when: 1,
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket Mid",
      when: 120,
      sandstorm: false,
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket High",
      when: 101,
      sandstorm: false,
    });

    var stats = makeTeamStats(team, data);
    expect(stats.avgHatchPanelCycleTimeCargoShip).toBe(5);
    expect(stats.avgHatchPanelCycleTimeRocketLow).toBe(4);
    expect(stats.avgHatchPanelCycleTimeRocketMid).toBe(16);
    expect(stats.avgHatchPanelCycleTimeRocketHigh).toBe(19);
    expect(stats.avgHatchPanelCycleTime).toBe(11);
    expect(stats.avgHatchPanelCount).toBe(4);
  });

  it("should calculate average hatch panel cycle time (string)", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Rocket High",
      when: <any>"10",
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Cargo Ship",
      when: <any>"5",
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket Low",
      when: <any>"1",
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket Mid",
      when: <any>"120",
      sandstorm: false,
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket High",
      when: <any>"101",
      sandstorm: false,
    });

    var stats = makeTeamStats(team, data);
    console.log("Avg Hatch Cycle Times for team", stats.teamNumber, "are:\nCargo Ship:", stats.avgHatchPanelCycleTimeCargoShip, "\nRocket Low:", stats.avgHatchPanelCycleTimeRocketLow, "\nRocket Mid:", stats.avgHatchPanelCycleTimeRocketMid, "\nRocket High:", stats.avgHatchPanelCycleTimeRocketHigh);
    console.log("Avg Hatch Counts for team", stats.teamNumber, "are:\nTotal:", stats.avgHatchPanelCount, "\nSandstorm:", stats.avgSandstormHatchPanelCount);
    expect(stats.avgHatchPanelCycleTimeCargoShip).toBe(5);
    expect(stats.avgHatchPanelCycleTimeRocketLow).toBe(4);
    expect(stats.avgHatchPanelCycleTimeRocketMid).toBe(16);
    expect(stats.avgHatchPanelCycleTimeRocketHigh).toBe(19);
    expect(stats.avgHatchPanelCycleTime).toBe(11);
    expect(stats.avgHatchPanelCount).toBe(4);
    expect(stats.avgSandstormHatchPanelCount).toBe(2);
  });

  it("should exclude defense time in average hatch panel cycle time", () => {
    // do we want to do this?

  })

  it("should exclude credit time in average hatch panel cycle time", () => {
    // do we want to do this?

  })

  it("should result in large hatch panel cycle time and small count for no data", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];

    var stats = makeTeamStats(team, data);
    expect(stats.avgHatchPanelCycleTime).toBe(160);
    expect(stats.avgHatchPanelCycleTimeCargoShip).toBe(160);
    expect(stats.avgHatchPanelCycleTimeRocketLow).toBe(160);
    expect(stats.avgHatchPanelCycleTimeRocketMid).toBe(160);
    expect(stats.avgHatchPanelCycleTimeRocketHigh).toBe(160);
    expect(stats.avgHatchPanelCount).toBe(0);
    expect(stats.avgSandstormHatchPanelCount).toBe(0);
  });

  it("should ignore first gamepiece (hatch panel) placed for cycle time, but not count", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket High",
      when: 10,
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Cargo Ship",
      when: 5,
      sandstorm: true
    });

    var stats = makeTeamStats(team, data);
    expect(stats.avgHatchPanelCycleTime).toBe(160);
    expect(stats.avgHatchPanelCount).toBe(1);
    expect(stats.avgSandstormHatchPanelCount).toBe(1);
  });

  it("should calculate average cargo cycle time and count", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket High",
      when: 10,
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Cargo Ship",
      when: 5,
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Rocket Low",
      when: 1,
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Rocket Mid",
      when: 120,
      sandstorm: false,
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Rocket High",
      when: 101,
      sandstorm: false,
    });

    var stats = makeTeamStats(team, data);
    expect(stats.avgCargoCycleTimeCargoShip).toBe(5);
    expect(stats.avgCargoCycleTimeRocketLow).toBe(4);
    expect(stats.avgCargoCycleTimeRocketMid).toBe(16);
    expect(stats.avgCargoCycleTimeRocketHigh).toBe(19);
    expect(stats.avgCargoCycleTime).toBe(11);

    expect(stats.avgCargoCount).toBe(4);
    expect(stats.avgSandstormCargoCount).toBe(2);
  });

  it("should calculate average hatch panel cycle time (string)", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket High",
      when: <any>"10",
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Cargo Ship",
      when: <any>"5",
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Rocket Low",
      when: <any>"1",
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Rocket Mid",
      when: <any>"120",
      sandstorm: false,
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Rocket High",
      when: <any>"101",
      sandstorm: false,
    });

    var stats = makeTeamStats(team, data);
    expect(stats.avgCargoCycleTimeCargoShip).toBe(5);
    expect(stats.avgCargoCycleTimeRocketLow).toBe(4);
    expect(stats.avgCargoCycleTimeRocketMid).toBe(16);
    expect(stats.avgCargoCycleTimeRocketHigh).toBe(19);
    expect(stats.avgCargoCycleTime).toBe(11);
    expect(stats.avgCargoCount).toBe(4);
    expect(stats.avgSandstormCargoCount).toBe(2);
  });

  it("should result in large cargo cycle time and small count for no data", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];

    var stats = makeTeamStats(team, data);
    expect(stats.avgCargoCycleTime).toBe(160);
    expect(stats.avgCargoCycleTimeCargoShip).toBe(160);
    expect(stats.avgCargoCycleTimeRocketLow).toBe(160);
    expect(stats.avgCargoCycleTimeRocketMid).toBe(160);
    expect(stats.avgCargoCycleTimeRocketHigh).toBe(160);
    expect(stats.avgCargoCount).toBe(0);
    expect(stats.avgSandstormCargoCount).toBe(0);
  });

  it("should ignore first gamepiece (cargo) placed for cycle time, but not average count", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Cargo",
      location: "Rocket High",
      when: 10,
      sandstorm: true
    });
    data[0].placements.push({
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Cargo Ship",
      when: 5,
      sandstorm: true
    });

    var stats = makeTeamStats(team, data);
    expect(stats.avgCargoCycleTime).toBe(160);
    expect(stats.avgCargoCount).toBe(1);
    expect(stats.avgSandstormCargoCount).toBe(1);
  });

  it("should calculate cargo pickup", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
      make2019match('STUFF', team.teamNumber, '2'),
      make2019match('STUFF', team.teamNumber, '3'),
      make2019match('STUFF', team.teamNumber, '4'),
      make2019match('STUFF', team.teamNumber, '5'),
    ];

    data[0].cargoPickup = 10;
    data[1].cargoPickup = 10;
    data[2].cargoPickup = 10;
    data[3].cargoPickup = 10;
    data[4].cargoPickup = 20;

    let results = makeTeamStats(team, data);
    expect(results.cargoPickup.numeric).toBe(10);

  });

  it("should calculate cargo pickup", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
      make2019match('STUFF', team.teamNumber, '2'),
      make2019match('STUFF', team.teamNumber, '3'),
      make2019match('STUFF', team.teamNumber, '4'),
      make2019match('STUFF', team.teamNumber, '5'),
    ];

    data[0].cargoPickup = 10;
    data[1].cargoPickup = 20;
    data[2].cargoPickup = 20;
    data[3].cargoPickup = 20;
    data[4].cargoPickup = 20;

    let results = makeTeamStats(team, data);
    expect(results.cargoPickup.numeric).toBe(20);

  });

  it("should calculate hatch panel pickup", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
      make2019match('STUFF', team.teamNumber, '2'),
      make2019match('STUFF', team.teamNumber, '3'),
      make2019match('STUFF', team.teamNumber, '4'),
      make2019match('STUFF', team.teamNumber, '5'),
    ];

    data[0].hatchPanelPickup = 10;
    data[1].hatchPanelPickup = 10;
    data[2].hatchPanelPickup = 10;
    data[3].hatchPanelPickup = 10;
    data[4].hatchPanelPickup = 20;

    let results = makeTeamStats(team, data);
    expect(results.hatchPanelPickup.numeric).toBe(10);

  });

  it("should calculate hatch panel pickup", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
      make2019match('STUFF', team.teamNumber, '2'),
      make2019match('STUFF', team.teamNumber, '3'),
      make2019match('STUFF', team.teamNumber, '4'),
      make2019match('STUFF', team.teamNumber, '5'),
    ];

    data[0].hatchPanelPickup = 10;
    data[1].hatchPanelPickup = 20;
    data[2].hatchPanelPickup = 20;
    data[3].hatchPanelPickup = 20;
    data[4].hatchPanelPickup = 20;

    let results = makeTeamStats(team, data);
    expect(results.hatchPanelPickup.numeric).toBe(20);

  });

  it("should calculate lift count", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
      make2019match('STUFF', team.teamNumber, '2'),
      make2019match('STUFF', team.teamNumber, '3'),
      make2019match('STUFF', team.teamNumber, '4'),
      make2019match('STUFF', team.teamNumber, '5'),
    ];
    assignIn(data[0], {
      liftedSomeone: true,
      didLiftLevel3: false,
      lifted: ["330", "971"],
    });
    assignIn(data[1], {
      liftedSomeone: true,
      didLiftLevel3: true,
      lifted: ["330"],
    });
    assignIn(data[2], {
      liftedSomeone: true,
      didLiftLevel3: true,
      lifted: ["330", "971"],
    });
    assignIn(data[3], {
      liftedSomeone: false,
      didLiftLevel3: false,
      lifted: [],
    });
    assignIn(data[4], {
      liftedSomeone: true,
      didLiftLevel3: true,
      lifted: ["330", "971"],
    });

    let results = makeTeamStats(team, data);
    expect(results.liftLevel2Count).toBe(2);
    expect(results.liftLevel3Count).toBe(5);

  });

  it("should ignore lift count for no lifted anyone", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
      make2019match('STUFF', team.teamNumber, '2'),
      make2019match('STUFF', team.teamNumber, '3'),
      make2019match('STUFF', team.teamNumber, '4'),
      make2019match('STUFF', team.teamNumber, '5'),
    ];
    assignIn(data[0], {
      liftedSomeone: false,
      didLiftLevel3: false,
      lifted: ["330", "971"],
    });
    assignIn(data[1], {
      liftedSomeone: false,
      didLiftLevel3: true,
      lifted: ["330", "971"],
    });

    let results = makeTeamStats(team, data);
    expect(results.liftLevel2Count).toBe(0);
    expect(results.liftLevel3Count).toBe(0);

  });

  it("should calculate climb time", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];
    data[0].level3ClimbAttempted = true;
    data[0].level3ClimbSucceeded = true;
    data[0].level3ClimbBegin = 20;
    data[0].level3ClimbEnd = 5;

    let results = makeTeamStats(team, data);
    expect(results.avgClimbLevel3Time).toBe(15);
  });

  it("should ignore climb time for climb not attempted", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];
    data[0].level3ClimbAttempted = false;
    data[0].level3ClimbSucceeded = false;
    data[0].level3ClimbBegin = 20;
    data[0].level3ClimbEnd = 5;

    let results = makeTeamStats(team, data);
    expect(results.avgClimbLevel3Time).toBe(999);
  });

  it("should ignore climb time for climb not succeeded", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];
    data[0].level3ClimbAttempted = true;
    data[0].level3ClimbSucceeded = false;
    data[0].level3ClimbBegin = 20;
    data[0].level3ClimbEnd = 5;

    let results = makeTeamStats(team, data);
    expect(results.avgClimbLevel3Time).toBe(999);
  });

  it("should ignore climb time for climb times not provided", () => {
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', team.teamNumber, '1'),
    ];
    data[0].level3ClimbAttempted = true;
    data[0].level3ClimbSucceeded = true;
    data[0].level3ClimbBegin = null;
    data[0].level3ClimbEnd = null;

    let results = makeTeamStats(team, data);
    expect(results.avgClimbLevel3Time).toBe(999);
  });
})

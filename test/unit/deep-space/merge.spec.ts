import { TeamMatch2019Entity, DeepSpaceEvent, matches2019AreEqual, DeepSpaceGamepiece, make2019match } from "../../../src/persistence";
import { makePlacementMergeStates, doPrint } from "../../../src/games/deepspace/model";
import { assignIn } from "lodash";

function makeMatchInput() {
  let a = make2019match("waamv", "1258", "1");
  assignIn(a, {
    "eventCode": "waamv",
    "teamNumber": "1258",
    "matchNumber": "1",
    "cargoPickup": 30,
    "isFailure": false,
    "failureReason": null,
    "isFoul": false,
    "foulReason": null,
    "hatchPanelPickup": 20,
    "level2ClimbAttempted": false,
    "level2ClimbSucceeded": false,
    "level3ClimbAttempted": true,
    "level3ClimbBegin": null,
    "level3ClimbEnd": null,
    "level3ClimbSucceeded": false,
    "lifted": [],
    "liftedBy": null,
    "notes": null,
    "placements": [{
      "eventType": "Gamepiece Placement",
      "gamepiece": "Cargo",
      "location": "Rocket High",
      "sandstorm": false,
      "when": 40
    }],
  });
  return a;
}

describe('matches2019AreEqual', () => {

  let modelChecks = [
    {
      property: "cargoPickup",
      value1: 20,
      value2: 30,
    },
    {
      property: "hatchPanelPickup",
      value1: 20,
      value2: 30,
    },
    {
      property: "level3ClimbBegin", 
      value1: 20,
      value2: 30,
    },
    {
      property: "level3ClimbEnd", 
      value1: 20,
      value2: 30,
    },
    {
      property: "level3ClimbAttempted", 
      value1: false,
      value2: true,
    },
    {
      property: "level3ClimbSucceeded", 
      value1: false,
      value2: true,
    },
    {
      property: "level2ClimbAttempted", 
      value1: false,
      value2: true,
    },
    {
      property: "level2ClimbSucceeded", 
      value1: false,
      value2: true,
    },
    {
      property: "isFailure", 
      value1: false,
      value2: true,
    },
    {
      property: "isFoul", 
      value1: false,
      value2: true,
    },
    {
      property: "failureReason", 
      value1: "tacos",
      value2: "burritos",
    },
    {
      property: "foulReason", 
      value1: "tacos",
      value2: "burritos",
    },
    {
      property: "lifted", 
      value1: ["3223"],
      value2: ["1338"],
    },
    {
      property: "lifted", 
      value1: ["3223"],
      value2: ["3223", "1318"],
    },
    {
      property: "lifted", 
      value1: ["3223", "2046"],
      value2: ["3223", "1318"],
    },
  ];

  modelChecks.forEach(item => {
    it(`should check ${item.property} equality`, () => {
      let a = makeMatchInput();
      a[item.property] = item.value1;

      let b = makeMatchInput();
      b[item.property] = item.value2;

      let result = matches2019AreEqual(a, b);
      expect(result).toBe(false);
    });
  });

  let placementChecks = [
    {
      property: "eventType",
      value1: "Gamepiece Placement",
      value2: "Begin Defense",
    },
    {
      property: "gamepiece",
      value1: "Cargo",
      value2: "Hatch Panel",
    },
    {
      property: "location",
      value1: "Rocket High",
      value2: "Rocket Low",
    },
    {
      property: "when",
      value1: 30,
      value2: 20,
    },
    {
      property: "sandstorm",
      value1: true,
      value2: false,
    },
  ];

  placementChecks.forEach(item => {
    it(`should check ${item.property} equality`, () => {
      let a = makeMatchInput();
      a.placements[0][item.property] = item.value1;

      let b = makeMatchInput();
      b.placements[0][item.property] = item.value2;

      let result = matches2019AreEqual(a, b);
      expect(result).toBe(false);
    });
  });
});

describe("makePlacementMergeStates", () => {
  it("should group equal things", () => {
    let fromFile = makeMatchInput();
    let fromLocal = makeMatchInput();

    let results = makePlacementMergeStates(fromFile, fromLocal);
    expect(results.length).toBe(1);
    expect(results[0].fromFile).toBe(fromFile.placements[0]);
    expect(results[0].localSaved).toBe(fromLocal.placements[0]);
  });

  it("should group when 'when's within 15 seconds", () => {
    let fromFile = makeMatchInput();
    let fromLocal = makeMatchInput();
    fromLocal.placements[0].when = 54;

    let results = makePlacementMergeStates(fromFile, fromLocal);
    expect(results.length).toBe(1);
    expect(results[0].fromFile).toBe(fromFile.placements[0]);
    expect(results[0].localSaved).toBe(fromLocal.placements[0]);
  });

  it("should order by 'when' descending", () => {
    let fromFile = makeMatchInput();
    let fromLocal = makeMatchInput();
    fromLocal.placements[0].when = 64;

    let results = makePlacementMergeStates(fromFile, fromLocal);
    expect(results.length).toBe(2);
    expect(results[0].localSaved).toBe(fromLocal.placements[0]);
    expect(results[1].fromFile).toBe(fromFile.placements[0]);
  });

  it("should group the closer one when 'when's within 15 seconds", () => {
    let fromFile = makeMatchInput();
    let fromLocal = makeMatchInput();
    fromLocal.placements[0].when = 54;
    fromLocal.placements.push({
      "eventType": "Gamepiece Placement",
      "gamepiece": "Cargo",
      "location": "Rocket High",
      "sandstorm": false,
      "when": 41
    })

    let results = makePlacementMergeStates(fromFile, fromLocal);
    expect(results.length).toBe(2);
    expect(results[0].localSaved).toBe(fromLocal.placements[1]);
    expect(results[1].fromFile).toBe(fromFile.placements[0]);
    expect(results[1].localSaved).toBe(fromLocal.placements[0]);
  });

  it("should not group when 'when's differ by more than 15 seconds", () => {
    let fromFile = makeMatchInput();
    let fromLocal = makeMatchInput();
    fromLocal.placements[0].when = 56;

    let results = makePlacementMergeStates(fromFile, fromLocal);
    expect(results.length).toBe(2);
    expect(results[0].localSaved).toBe(fromLocal.placements[0]);
    expect(results[1].fromFile).toBe(fromFile.placements[0]);
  });

  it("should not group when eventTypes differ", () => {
    let fromFile = makeMatchInput();
    let fromLocal = makeMatchInput();
    fromLocal.placements[0].eventType = "Begin Defense";
    fromLocal.placements[0].when = 30;

    let results = makePlacementMergeStates(fromFile, fromLocal);
    expect(results.length).toBe(2);
    expect(results[0].fromFile).toBe(fromFile.placements[0]);
    expect(results[1].localSaved).toBe(fromLocal.placements[0]);
  });
});

import { placementTime } from "../../../src/games/deepspace/model";
import { DeepSpaceEvent } from "../../../src/persistence";

describe('placementTime', () => {
  it("should calculate time for teleop seconds remaining", () => {
    let placement : DeepSpaceEvent = {
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket Low",
      when: 100,
      sandstorm: false,
    };

    expect(placementTime(placement)).toBe(100);
  });

  it("should calculate time for sandstorm seconds remaining", () => {
    let placement : DeepSpaceEvent = {
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket Low",
      when: 10,
      sandstorm: true,
    };

    expect(placementTime(placement)).toBe(145);
  });

  it("should calculate time for teleop seconds remaining (string)", () => {
    let placement : DeepSpaceEvent = {
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket Low",
      when: <any>"100",
      sandstorm: false,
    };

    expect(placementTime(placement)).toBe(100);
  });

  it("should calculate time for sandstorm seconds remaining (string)", () => {
    let placement : DeepSpaceEvent = {
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Rocket Low",
      when: <any>"10",
      sandstorm: true,
    };

    expect(placementTime(placement)).toBe(145);
  });
})

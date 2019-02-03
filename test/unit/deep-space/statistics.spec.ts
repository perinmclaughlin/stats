import { DeepSpaceTeamStatistics, makeTeamStats } from '../../../src/games/deepspace/statistics';
import { TeamMatch2019Entity, make2019match, TeamEntity } from '../../../src/persistence';

describe('make team stats', () => {
  it('should calc matches played', () => {
    var team : TeamEntity = {
      teamNumber: "2222",
      teamName: "Tacos",
      description: "",
      city: "",
      stateprov: "",
      country: "",
      districtCode: "",
    };
    var data: TeamMatch2019Entity[] = [
      make2019match('STUFF', '0000', '1'),
      make2019match('STUFF', '0000', '2'),
      make2019match('STUFF', '0000', '3')
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
  })
})

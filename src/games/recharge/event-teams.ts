import { autoinject } from "aurelia-framework";
import { EventEntity, EventMatchEntity, TeamEntity, EventTeamEntity, TeamMatch2019Entity, FrcStatsContext } from "../../persistence";
import { DialogService } from "aurelia-dialog";
import * as naturalSort from "javascript-natural-sort";
import { makeTeamStats, DeepSpaceTeamStatistics } from "./statistics";
import { gameManager } from "../index";

@autoinject 
export class EventTeamsPage {
  public event: EventEntity;
  public eventMatches: EventMatchEntity[];
  public teams: {team: TeamEntity, eventTeam: EventTeamEntity}[];
  public matches2019: TeamMatch2019Entity[];
  public activeTab: number;
  public teamsData: DeepSpaceTeamStatistics[];
  public gameName: string;
  public showDevStuff: boolean;
  public noCycleTime = 160.0
  public noClimbTime = 999.0

  constructor(
    private dbContext: FrcStatsContext,
    private dialogService: DialogService
  ){
    this.teams = [];
    this.eventMatches = [];
    this.matches2019 = [];
    this.activeTab = 0;
    this.showDevStuff = false;
  }

  public async activate(params) {
    let game = gameManager.getGame(params.year);
    this.gameName = game.name;
    this.event = await this.dbContext.getEvent(params.year, params.eventCode);
    await this.getEventMatches();
    await this.getEventTeams();
    await this.get2019Matches();
  }

  private async getEventTeams() {
    let eventTeams = await this.dbContext.getEventTeams(this.event.year, this.event.eventCode);
    var gettingTeams = eventTeams.map(eventTeam => {
      return this.dbContext.getTeam(eventTeam.teamNumber).then(team => {
          this.teams.push({ team: team, eventTeam: eventTeam });
        });
    });

    await Promise.all(gettingTeams);
    this.teams.sort((a, b) => naturalSort(a.team.teamNumber, b.team.teamNumber));
  }

  private async getEventMatches() {
    let eventMatches = await this.dbContext.getEventMatches(this.event.year, this.event.eventCode);
    this.eventMatches = eventMatches;
    this.eventMatches.sort((a, b) => naturalSort(a.matchNumber, b.matchNumber));
  }

  private async get2019Matches() {
    this.matches2019 = await this.dbContext.teamMatches2019.where("eventCode").equals(this.event.eventCode).toArray();
    this.matches2019.sort((a, b) => naturalSort(a.matchNumber, b.matchNumber));

    let teamMatches = new Map<string, TeamMatch2019Entity[]>();
    for(var teamMatch of this.matches2019) {
      if(!teamMatches.has(teamMatch.teamNumber)) {
        teamMatches.set(teamMatch.teamNumber, [teamMatch])
      }else {
        teamMatches.get(teamMatch.teamNumber).push(teamMatch);
      }
    }
    this.teamsData = this.teams.map(x => makeTeamStats(x.team, teamMatches.get(x.team.teamNumber) || []));
  }

  public showDevValues() {
    this.showDevStuff = !this.showDevStuff;
  }

  public sortByTeamNumber() {
    this.teamsData.sort((a,b) => naturalSort(a.teamNumber, b.teamNumber));
  }

  public sortByCargoCount() {
    this.teamsData.sort((a,b) => b.avgCargoCount - a.avgCargoCount);
  }

  public sortByCargoPickup() {
    this.teamsData.sort((a,b) => b.cargoPickup.numeric - a.cargoPickup.numeric);
  }

  public sortByHatchPickup() {
    this.teamsData.sort((a,b) => b.hatchPanelPickup.numeric - a.hatchPanelPickup.numeric);
  }

  public sortByCargoCountShip() {
    this.teamsData.sort((a,b) => b.cargoCountCargoShipRaw - a.cargoCountCargoShipRaw);
  }

  public sortByCargoCountLow() {
    this.teamsData.sort((a,b) => b.cargoCountRocketLowRaw - a.cargoCountRocketLowRaw);
  }

  public sortByCargoCountMid() {
    this.teamsData.sort((a,b) => b.cargoCountRocketMidRaw - a.cargoCountRocketMidRaw);
  }

  public sortByCargoCountHigh() {
    this.teamsData.sort((a,b) => b.cargoCountRocketHighRaw - a.cargoCountRocketHighRaw);
  }

  public sortByHatchCount() {
    this.teamsData.sort((a,b) => b.avgHatchPanelCount - a.avgHatchPanelCount);
  }

  public sortByCount() {
    this.teamsData.sort((a,b) => b.avgGamepieceCount - a.avgGamepieceCount);
  }

  public sortByMaxCount() {
    this.teamsData.sort((a,b) => b.maxGamepieceCount - a.maxGamepieceCount);
  }

  public sortByHatchCountShip() {
    this.teamsData.sort((a,b) => b.hatchPanelCountCargoShipRaw - a.hatchPanelCountCargoShipRaw);
  }

  public sortByHatchCountLow() {
    this.teamsData.sort((a,b) => b.hatchPanelCountRocketLowRaw - a.hatchPanelCountRocketLowRaw);
  }

  public sortByHatchCountMid() {
    this.teamsData.sort((a,b) => b.hatchPanelCountRocketMidRaw - a.hatchPanelCountRocketMidRaw);
  }

  public sortByClimbTime() {
    this.teamsData.sort((a,b) => a.avgClimbLevel3Time - b.avgClimbLevel3Time);
  }

  public sortByHatchCountHigh() {
    this.teamsData.sort((a,b) => b.hatchPanelCountRocketHighRaw - a.hatchPanelCountRocketHighRaw);
  }

  public sortByCargoCycle() {
    console.info(this.teamsData.map(x => x.avgCargoCycleTime));
    this.teamsData.sort((a,b) => a.avgCargoCycleTime - b.avgCargoCycleTime);
  }

  public sortByCargoCycleShip() {
    this.teamsData.sort((a,b) => a.avgCargoCycleTimeCargoShip - b.avgCargoCycleTimeCargoShip);
  }

  public sortByCargoCycleLow() {
    this.teamsData.sort((a,b) => a.avgCargoCycleTimeRocketLow - b.avgCargoCycleTimeRocketLow);
  }

  public sortByCargoCycleMid() {
    this.teamsData.sort((a,b) => a.avgCargoCycleTimeRocketMid - b.avgCargoCycleTimeRocketMid);
  }

  public sortByCargoCycleHigh() {
    this.teamsData.sort((a,b) => a.avgCargoCycleTimeRocketHigh - b.avgCargoCycleTimeRocketHigh);
  }

  public sortByHatchCycle() {
    this.teamsData.sort((a,b) => a.avgHatchPanelCycleTime - b.avgHatchPanelCycleTime);
  }

  public sortByHatchCycleShip() {
    this.teamsData.sort((a,b) => a.avgHatchPanelCycleTimeCargoShip - b.avgHatchPanelCycleTimeCargoShip);
  }

  public sortByHatchCycleLow() {
    this.teamsData.sort((a,b) => a.avgHatchPanelCycleTimeRocketLow - b.avgHatchPanelCycleTimeRocketLow);
  }

  public sortByHatchCycleMid() {
    this.teamsData.sort((a,b) => a.avgHatchPanelCycleTimeRocketMid - b.avgHatchPanelCycleTimeRocketMid);
  }

  public sortByHatchCycleHigh() {
    this.teamsData.sort((a,b) => a.avgHatchPanelCycleTimeRocketHigh - b.avgHatchPanelCycleTimeRocketHigh);
  }

  public sortByCargoCountSandstorm() {
    this.teamsData.sort((a,b) => b.avgSandstormCargoCount - a.avgSandstormCargoCount);
  }

  public sortByHatchCountSandstorm() {
    this.teamsData.sort((a,b) => b.avgSandstormHatchPanelCount - a.avgSandstormHatchPanelCount);
  }

  public sortByLevel2Climb() {
    this.teamsData.sort((a,b) => {
      let x = b.climbLevel2Successes - a.climbLevel2Successes;
      if(x == 0) {
        return b.climbLevel2Attempts - a.climbLevel2Attempts;
      }else {
        return x;
      }
    });
  }

  public sortByLevel3Climb() {
    this.teamsData.sort((a,b) => {
      let x = b.climbLevel3Successes - a.climbLevel3Successes;
      if(x == 0) {
        return b.climbLevel3Attempts - a.climbLevel3Attempts;
      }else {
        return x;
      }
    });
  }

  public sortByLevel2Lift() {
    this.teamsData.sort((a,b) => b.liftLevel2Count - a.liftLevel2Count);
  }

  public sortByLevel3Lift() {
    this.teamsData.sort((a,b) => b.liftLevel3Count - a.liftLevel3Count);
  }
}

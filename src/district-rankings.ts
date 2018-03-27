import { autoinject } from "aurelia-framework";
import { TbaApi, TeamRanking } from "./tba-api";

@autoinject
export class DistrictRankingsPage {
  // district chairmans: 0
  // engineering inspiration: 9
  // rookie all star: 10
  public rankings: TeamRanking[];
  public districtKeys = ["2014pnw", "2015pnw", "2016pnw", "2017pnw", "2018pnw"];
  public districtKey: string;

  constructor(private api: TbaApi) {
    this.districtKey = this.districtKeys[this.districtKeys.length-1];
  }

  activate() {
    return this.load();
  }

  public load() {
    this.rankings = [];
    return this.api.getDistrictRankings(this.districtKey).then(rankings => {
      console.info(rankings);
      this.rankings = rankings;
      this.sortByPreDcmp();
    });
  }

  public preDcmpSum(ranking: TeamRanking) {
    let result = 0;
    for(var event of ranking.event_points) {
      if(!event.district_cmp) {
        result += event.total || 0;
      }
    }
    result += ranking.rookie_bonus || 0;
    return result;
  }

  public sortByPreDcmp() {
    this.rankings.sort((a, b) => this.preDcmpSum(b) - this.preDcmpSum(a));
  }

  public dcmpScore(ranking: TeamRanking) {
    for(var event of ranking.event_points) {
      if(event.district_cmp) {
        return event.total;
      }
    }
    return 0;
  }

  public sortByDcmp() {
    this.rankings.sort((a, b) => this.dcmpScore(b) - this.dcmpScore(a));
  }

  public sortByTotal() {
    this.rankings.sort((a, b) => b.point_total - a.point_total);
  }
}

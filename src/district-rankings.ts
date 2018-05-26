import { autoinject } from "aurelia-framework";
import { TbaApi, TeamRanking } from "./tba-api";
import { sortByPreDcmp, sortByDcmp, sortByTotal, preDcmpSum} from "./district-ranking-utils";

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
      this.rankings = rankings;
      this.sortByPreDcmp();
    });
  }

  public preDcmpSum(ranking) {
    return preDcmpSum(ranking);
  }

  public sortByPreDcmp() {
    sortByPreDcmp(this.rankings);
  }

  public sortByDcmp() {
    sortByDcmp(this.rankings);
  }

  public sortByTotal() {
    sortByTotal(this.rankings);
  }
}

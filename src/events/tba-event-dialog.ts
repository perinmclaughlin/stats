import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { TbaApi, District, tbaEvent } from "../tba-api";
import { FrcStatsContext } from "../persistence";

@autoinject
export class TbaEventDialog {
  events: any[];

  constructor(
    private dbContext: FrcStatsContext,
    private tbaApi: TbaApi,
    private controller: DialogController) {
    this.events = [];
  }

  activate() {
    this.controller.settings.lock = false;
    this.controller.settings.overlayDismiss = true;

    this.load();
  }

  load() {
    this.tbaApi.getEventList('2018').then(events => {
      this.events = [];
      for(var evnt of events) {
        if(evnt.district && evnt.district.abbreviation == "pnw") {
          this.events.push(evnt);
        }
      }
      this.events.sort((a, b) => a.week - b.week);
    });
  }

  importEvent(evnt) {
    this.saveEvent(evnt).then(x => {
      return this.saveDistrict(evnt.district);
    }).then(x => {
      return this.saveTeams(evnt);
    });
  }

  private getDistrictCode(district: District) {
    return district ? district.abbreviation : null;
  }

  private saveEvent(evnt: tbaEvent) {
    return this.dbContext.events.put({
      code: evnt.event_code,
      name: evnt.name, 
      districtCode: this.getDistrictCode(evnt.district),
      tbaKey: evnt.key,
      year: '2018',
    });
  }

  private saveDistrict(district: District) {
    if (district == null) return Promise.resolve();

    let districtCode = district.abbreviation;

    return this.dbContext.districts
      .where('code').equals(districtCode)
      .first().then(localDistrict => {
        if(localDistrict == null) {
          this.dbContext.districts.put({
            code: districtCode,
            name: district.display_name,
          })
        }
      }).catch(error => {
        console.info('error saving district: ', district);
        throw error;
      });
  }

  private saveTeams(evnt: tbaEvent) {
    return Promise.all([
      this.dbContext.eventTeams
      .where(["year", "eventCode"])
      .equals(["2018", evnt.event_code]).toArray(),
      this.tbaApi.getEventTeams(evnt.key),
    ]).then(results => {
      let localTeams = results[0];
      let importedTeams = results[1];
      // todo: maybe warn if local has extra teams?

      importedTeams.forEach(team => {
        this.dbContext.eventTeams.put({
          year: '2018',
          eventCode: evnt.event_code,
          teamNumber: ""+team.team_number,
        });

        this.dbContext.teams
          .where("teamNumber").equals(""+team.team_number)
          .first().then(localTeam => {
            if(localTeam != null) return Promise.resolve(null);

            return this.dbContext.teams.put({
              teamNumber: ""+team.team_number,
              teamName: ""+team.nickname,
              description: "",
              city: team.city,
              stateprov: team.state_prov,
              country: team.country,
              districtCode: this.getDistrictCode(evnt.district),
            });
          }).catch(error => {
            console.info('error saving team ', team);
            throw error;
          });
      });
    });
  }
}

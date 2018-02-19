import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { TbaApi, District, tbaEvent } from "../tba-api";
import { FrcStatsContext, EventMatchEntity } from "../persistence";

@autoinject
export class TbaEventDialog {
  year = "2018";
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
    this.tbaApi.getEventList(this.year).then(events => {
      this.events = [];
      for(var evnt of events) {
        if(evnt.district && evnt.district.abbreviation == "pnw") {
          this.events.push(evnt);
        }
      }
      this.events.sort((a, b) => a.week - b.week);
    });
  }

  yearChanged() {
    this.load();
  }

  importEvent(evnt: tbaEvent) {
    this.saveEvent(evnt).then(x => {
      return this.saveDistrict(evnt.district);
    }).then(x => {
      return this.saveTeams(evnt);
    }).then(aValue => {
      return this.saveMatchEvent(evnt);
    });
  }

  private saveMatchEvent(evnt: tbaEvent)
  {
    return this.tbaApi.getEventMatches(evnt.key).then(matches =>{
      var someValue = 0;
		  matches.forEach(match => {
        if(match.comp_level == "qm"){
          let localMatch: EventMatchEntity = {
            year: this.year,
            eventCode: evnt.event_code,
            matchNumber: match.match_number,
            teamNumbers_red: [],
            teamNumbers_blue: [],
          };
          let promises1 = match.alliances.blue.team_keys.map(team_key => {
            return this.dbContext.teams.where("tbaKey").equals(team_key).first().then(localTeam => {
              localMatch.teamNumbers_blue.push(localTeam.teamNumber);
            })
          });
          let promises2 = match.alliances.red.team_keys.map(team_key => {
            return this.dbContext.teams.where("tbaKey").equals(team_key).first().then(localTeam => {
              localMatch.teamNumbers_red.push(localTeam.teamNumber);
            })
          });
          console.info(localMatch.eventCode, localMatch.matchNumber);
          Promise.all(promises1.concat(promises2)).then(z => {
            this.dbContext.eventMatches.put(localMatch);
          });
        }
        
      });
	  });
  }

  private getDistrictCode(district: District) {
    return district ? district.abbreviation : null;
  }

  private saveEvent(evnt: tbaEvent) {
    return this.dbContext.events.put({
      eventCode: evnt.event_code,
      name: evnt.name, 
      districtCode: this.getDistrictCode(evnt.district),
      tbaKey: evnt.key,
      year: this.year,
    });
  }

  private saveDistrict(district: District) {
    if (district == null) return Promise.resolve();

    let districtCode = district.abbreviation;

    return this.dbContext.districts
      .where('districtCode').equals(districtCode)
      .first().then(localDistrict => {
        if(localDistrict == null) {
          this.dbContext.districts.put({
            districtCode: districtCode,
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
      .equals([this.year, evnt.event_code]).toArray(),
      this.tbaApi.getEventTeams(evnt.key),
    ]).then(results => {
      let localTeams = results[0];
      let importedTeams = results[1];
      // todo: maybe warn if local has extra teams?
      let promises = importedTeams.map(team => {
        this.dbContext.eventTeams.put({
          year: this.year,
          eventCode: evnt.event_code,
          teamNumber: ""+team.team_number,
        });

        return this.dbContext.teams
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
			        tbaKey: team.key,
            });
          }).catch(error => {
            console.info('error saving team ', team);
            throw error;
          });
      });

      return Promise.all(promises);
    });
  }
}

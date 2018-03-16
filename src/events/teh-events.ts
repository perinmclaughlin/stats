import { autoinject } from "aurelia-framework";
import { DialogService, DialogOpenResult } from "aurelia-dialog";

import { FrcStatsContext, EventEntity, GameEntity } from "../persistence";
import { TbaEventDialog } from "./tba-event-dialog";
import { JsonImportDialog } from "./json-import-dialog";
import { ConfirmDialog } from "../event-matches/confirm-dialog";

@autoinject
export class Events {
  events: EventEntity[];
  games: Map<string, GameEntity>;

  constructor(
    private dialogService: DialogService,
    private dbContext: FrcStatsContext) {
    this.events = [];
    this.games = new Map<string, GameEntity>();
  }

  public activate() {
    return Promise.all([
      this.loadEvents(),
      this.dbContext.games.toArray()
    ]).then(results => {
      this.games.clear();
      for(var game of results[1]) {
        this.games[game.year] = game;
      }
    });
  }

  private loadEvents() {
      return this.dbContext.events.toArray().then(events => {
        this.events = events;
      });
  }

  public tbaImport() {
    this.dialogService.open({
      model: {},
      viewModel: TbaEventDialog,
    }).then(result => {
      if('closeResult' in result) {
        let openDialogResult = <DialogOpenResult>result;
        return openDialogResult.closeResult.then(() => {
          this.loadEvents();
        });
      }
    });
  }

  public exportEvent(event: EventEntity) {
    let json = {
      teams: [],
      eventTeams: [],
      event: event,
      eventMatches: [],
      matches2018: [],
    };

    let teamsPromise = this.dbContext.eventTeams
      .where(["year", "eventCode"])
      .equals([event.year, event.eventCode]).toArray()
      .then(eventTeams => {

        json.eventTeams = eventTeams;
        return Promise.all(eventTeams.map(eventTeam => this.dbContext.teams.where("teamNumber").equals(eventTeam.teamNumber).first()));
      }).then(teams => {
        json.teams = teams;
      });

    let eventMatchesPromise = this.dbContext.eventMatches
      .where(["year", "eventCode"])
      .equals([event.year, event.eventCode]).toArray()
      .then(eventMatches => {
        json.eventMatches = eventMatches;
      });

    let matches2018Promise = Promise.resolve("yup");
    if(event.year == "2018") {
      matches2018Promise = this.dbContext.teamMatches2018
        .where("eventCode")
        .equals(event.eventCode).toArray()
        .then(matches2018 => {
          json.matches2018 = matches2018;
        }).then(() => "yup");
    }

    Promise.all([teamsPromise, eventMatchesPromise, matches2018Promise]).then(() => {
      this.downloadJson(event, json);
    });
  }

  private downloadJson(event, json) {
    let name = `${event.year}-${event.eventCode}.json`
    let file = new Blob([JSON.stringify(json)], {type: "application/json"});
    let a = document.createElement("a");
    let url = URL.createObjectURL(file);
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  public importJson() {
    this.dialogService.open({
      model: {},
      viewModel: JsonImportDialog,
    }).whenClosed(() => {
      this.loadEvents();
    });
  }

  public deleteEvent(event) {
    this.dialogService.open({
      viewModel: ConfirmDialog,
      model: ["Are you SURE that you want to delete that?", "Press 'OKAY' to confirm"],
    }).whenClosed(dialogResult => {
      if(!dialogResult.wasCancelled) {
        this.dbContext.transaction("rw", [
          this.dbContext.events,
          this.dbContext.eventTeams,
          this.dbContext.eventMatches,
          this.dbContext.teamMatches2018,
        ], () => {
          let eventPromise = this.dbContext.events.delete(event.id);
          let eventTeamsPromise = this.dbContext.eventTeams
            .where(["year", "eventCode"])
            .equals([event.year, event.eventCode])
            .delete();
          let eventMatchesPromise = this.dbContext.eventMatches
            .where(["year", "eventCode"])
            .equals([event.year, event.eventCode])
            .delete();
          let promises : Promise<any>[] = [eventPromise, eventTeamsPromise, eventMatchesPromise];

          if(event.year == "2018") {
            promises.push(
              this.dbContext.teamMatches2018
              .where("eventCode")
              .equals(event.eventCode)
              .delete()
            );
          }

          return Promise.all(promises);
        }).then(() => {
          this.loadEvents();
        });
      }
    });

  }
}

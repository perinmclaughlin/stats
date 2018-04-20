import { autoinject } from "aurelia-framework";
import { DialogService, DialogOpenResult } from "aurelia-dialog";

import { FrcStatsContext, EventEntity, GameEntity } from "../persistence";
import { TbaEventDialog } from "./tba-event-dialog";
import { JsonImportDialog } from "./json-import-dialog";
import { JsonExportDialog } from "./json-export-dialog";
import { ConfirmDialog } from "../event-matches/confirm-dialog";
import { JsonExporter } from "./event-to-json";

@autoinject
export class Events {
  events: EventEntity[];
  games: Map<string, GameEntity>;

  constructor(
    private dialogService: DialogService,
    private jsonExporter: JsonExporter,
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
    this.dialogService.open({
      model: {
        event: event,
      },
      viewModel: JsonExportDialog,
    });
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

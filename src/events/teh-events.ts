import { autoinject } from "aurelia-framework";
import { DialogService, DialogOpenResult } from "aurelia-dialog";

import { FrcStatsContext, EventEntity, GameEntity } from "../persistence";
import { TbaEventDialog } from "./tba-event-dialog";
import { JsonImportDialog } from "./json-import-dialog";
import { JsonExportDialog } from "./json-export-dialog";
import { ConfirmDialog } from "../event-matches/confirm-dialog";
import { GoogleDriveApi } from "../google-apis";
import { gameManager, IGame } from "../games/index";

@autoinject
export class Events {
  events: EventEntity[];
  games: Map<string, IGame>;

  constructor(
    private dialogService: DialogService,
    private gdriveApi: GoogleDriveApi,
    private dbContext: FrcStatsContext) {
    this.events = [];
    this.games = gameManager.getGameMap();
  }

  public activate() {
      return this.loadEvents();
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


  public localImportJson() {
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

  public gdriveImportJson() {
    this.gdriveApi.openJsonSelector().then(data => {
      console.info("I Gots data: ", data);
      var doc = data.docs[0];
      if(doc.mimeType != "application/json") {
        alert("you didn't pick a json file!");
      }else {
        this.gdriveApi.getFile(doc.id).then(result => {
          this.dialogService.open({
            model: {
              selectFile: false,
              json: result.result,
            },
            viewModel: JsonImportDialog,
          }).whenClosed(() => {
            this.loadEvents();
          });
        });
      }
    });
  }

  public toggled(state) {
  }
}

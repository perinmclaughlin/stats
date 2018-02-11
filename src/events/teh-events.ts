import { autoinject } from "aurelia-framework";
import { DialogService, DialogOpenResult } from "aurelia-dialog";
import 'xlsx';
import { FrcStatsContext, EventEntity, GameEntity } from "../persistence";
import { TbaEventDialog } from "./tba-event-dialog";

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

  public download() {
    var wb = window.XLSX.utils.book_new();





   var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent("hello"));
    element.setAttribute('download', "robodata.xlsx");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

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
}

import { autoinject, bindable } from "aurelia-framework";
import { DialogController, DialogService, DialogCloseResult } from "aurelia-dialog";
import { TeamMatch2019Entity, FrcStatsContext, EventEntity, BingoEntity, makeBingoEntity } from "../../persistence";
import { IBingoPersistence } from "../../utilities/bingo-cell2";
import { BingoEntryDialog } from "./bingo-entry";

@autoinject
export class DeepSpaceBingoDialog implements IBingoPersistence {
  public static properties = [
    "sovietRussia",
    "sovietPop",
    "panelInBay",
    "haloGrunt",
    "beRamp",
    "panelFits",
    "defenseRocket",
    "timber",
    "reach",
    "faceplantClimb",
    "suckyClimb",
  ];
  public map: Map<string, BingoEntity>;
  public m: any;
  public model: DeepSpaceBingoInput;
  private dialogService: DialogService;
  showEntryDialog: Function;

  constructor(private controller: DialogController, private dbContext: FrcStatsContext) {
  }

  async activate(model: DeepSpaceBingoInput) {
    this.controller.settings.lock = false;
    this.controller.settings.overlayDismiss = true;

    this.model = model;
    this.dialogService = model.dialogService;
    await this.load();
  }

  async load() {
    this.map = new Map();
    this.m = {};
    for (var prop of DeepSpaceBingoDialog.properties) {
      this.m[prop] = false;
    }
    let bingos = await this.dbContext.getBingo(this.model.event.year, this.model.event.eventCode);
    for (var bingo of bingos) {
      this.map.set(bingo.cell, bingo);
      this.m[bingo.cell] = true;
    }

  }

  public static open(dialogService: DialogService, model: DeepSpaceBingoInput) {
    return dialogService.open({
      model: model,
      viewModel: DeepSpaceBingoDialog
    });
  }

  showBingoEntryDialog(cell: string): Promise<DialogCloseResult> {
    let entry = this.map.get(cell);
    if(entry == null) {
      entry = makeBingoEntity(this.model.event.year, this.model.event.eventCode, cell);
      this.map.set(cell, entry);
    }
    entry.matchNumber = this.model.matchNumber;
    entry.teamNumber = this.model.teamNumber;
    return BingoEntryDialog.open(this.dialogService, {
      entry: entry,
      matches: this.model.matches,
      teams: this.model.teams,
    }).whenClosed(async dialogResult => {
      if(!dialogResult.wasCancelled) {
        await this.save(entry);
      }
      return dialogResult;
    });
  }

  private save(entry: BingoEntity) {
    return this.dbContext.bingos.put(entry);
  }

  public removeEntry(cell: string) {
    let entry = this.map.get(cell);
    if (entry != null) {
      let id = entry.id;
      if(id != null) {
        this.dbContext.bingos.delete(id);
      }
    }
  }
}

export interface DeepSpaceBingoInput {
  event: EventEntity,
  matchNumber: string;
  teamNumber: string;
  dialogService: DialogService;
  matches: string[];
  teams: string[];
}

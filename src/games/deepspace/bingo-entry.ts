import { autoinject, bindable } from "aurelia-framework";
import { DialogService, DialogController } from "aurelia-dialog";
import { BingoEntity, FrcStatsContext, EventMatchSlots } from "../../persistence";
import { BindingEngine } from "aurelia-binding";

@autoinject
export class BingoEntryDialog {
  @bindable entry: BingoEntity;
  teams: string[];
  matches: string[];

  constructor(
    private dbContext: FrcStatsContext,
    private bindingEngine: BindingEngine,
    private controller: DialogController) {
  }

  async activate(model) {
    this.controller.settings.lock = false;
    this.controller.settings.overlayDismiss = true;

    this.entry = model.entry;
    this.teams = model.teams;
    this.matches = model.matches;


    await this.updateTeams();
    this.observeStuff();
  }

  observeStuff() {
    this.bindingEngine.propertyObserver(this.entry, "matchNumber").subscribe((newValue, oldValue) => {
      this.updateTeams();
    })
  }

  async updateTeams() {
    let eventMatch = await this.dbContext.getEventMatch(this.entry.year, this.entry.eventCode, this.entry.matchNumber);
    this.teams = EventMatchSlots.map(slot => eventMatch[slot.prop]);
  }

  public static open(dialogService: DialogService, model: BingoEntryDialogModel) {
    return dialogService.open({
      model: model,
      viewModel: BingoEntryDialog
    });
  }
}

export interface BingoEntryDialogModel {
  teams: string[];
  matches: string[];
  entry: BingoEntity;

}

import { autoinject } from "aurelia-framework";
import { DialogService, DialogController } from "aurelia-dialog";
import { FrcStatsContext, UserStateEntity } from "../../persistence";

@autoinject
export class SettingsDialog { 
  userPrefs: UserStateEntity;

  constructor(
    public controller: DialogController,
    private dbContext: FrcStatsContext,
  ) {
    this.controller.settings.lock = false;
    this.controller.settings.overlayDismiss = true;

  }

  public async activate(model: SettingsDialog) {
    this.userPrefs = await this.dbContext.getUserPrefs();

  }

  public async save() {
    await this.dbContext.userPrefs.put(this.userPrefs);
  }

  public static open(dialogService: DialogService, model: SettingsDialogInput) {
    return dialogService.open({
      model: model,
      viewModel: SettingsDialog,
    });
  }
}

export interface SettingsDialogInput {

}

import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { EventMatchMergeState } from "../../model";
import { ValidationRules, ValidationController, ValidationControllerFactory } from "aurelia-validation";
import { BootstrapRenderer } from "../../utilities/bootstrap-renderer";

@autoinject
export class EventMatchMergeDialog {
  state: EventMatchMergeState;
  private validationController: ValidationController;
  private rules: any[];
  private renderer: BootstrapRenderer;
  public errorMessage: string;

  public static properties = [
    "blue1", "blue2", "blue3",
    "red1", "red2", "red3",
  ];

  constructor(
    private controller: DialogController,
    validationControllerFactory: ValidationControllerFactory,
  ) {
    this.validationController = validationControllerFactory.createForCurrentScope();
  }

  activate(model) {
    this.state = model.state;

    this.setupValidation();
  }

  deactivate() {
    this.teardownValidation();
  }

  setupValidation() {
    this.rules = 
      ValidationRules
      .ensure("blue1")
      .satisfiesRule("teamExists")
      .ensure("blue2")
      .satisfiesRule("teamExists")
      .ensure("blue3")
      .satisfiesRule("teamExists")
      .ensure("red1")
      .satisfiesRule("teamExists")
      .ensure("red2")
      .satisfiesRule("teamExists")
      .ensure("red3")
      .satisfiesRule("teamExists")
      .rules;

    this.renderer = new BootstrapRenderer({showMessages: true});
    this.validationController.addRenderer(this.renderer);
  }

  private teardownValidation() {
    this.validationController.removeRenderer(this.renderer);
  }

  takeAllFromDb() {
    for (var prop of EventMatchMergeDialog.properties) {
      this.state.merged[prop] = this.state.localSaved[prop];
    }
  }

  takeAllFromFile() {
    for (var prop of EventMatchMergeDialog.properties) {
      this.state.merged[prop] = this.state.fromFile[prop];
    }
  }

  resolve() {
    this.validationController.validate({object: this.state.merged, rules: this.rules}).then(validationResult => {
        if(validationResult.valid) {
          this.state.resolved = true;
          this.controller.ok();
        }
        else{
          this.errorMessage = "There are validation errors.";
          this.state.resolved = false;
        }
    });
  }
}

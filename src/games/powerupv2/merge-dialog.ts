import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { ValidationController, ValidationControllerFactory, ValidationRules } from "aurelia-validation";
import { BootstrapRenderer } from "../../utilities/bootstrap-renderer";
import { Match2018MergeState } from "../powerup/model";
import { EventMatchEntity } from "../../persistence";

@autoinject
export class Match2018V2MergeDialog {
  state: Match2018MergeState;
  private validationController: ValidationController;
  private renderer: BootstrapRenderer;
  public rules: any[];
  public errorMessage: string;

  public static properties = [
    "vaultCount", "vaultCycleTime", "scaleCount", "scaleCycleTime", 
    "allySwitchCount", "allySwitchCycleTime", "oppoSwitchCount", "oppoSwitchCycleTime",
    "isFailure", "failureReason", "isFoul", "foulReason",
    "climbed", "lifted", "notes",
    "startingPosition",
    "autoCrossedLine", "autoCubeLeftSwitch", "autoCubeRightSwitch",
    "autoCubeLeftScale", "autoCubeRightScale",
  ];

  constructor (
    validationControllerFactory: ValidationControllerFactory,
    private controller: DialogController
  ) {
    this.validationController = validationControllerFactory.createForCurrentScope();
  }

  activate(model) {
    this.state = model.state;

    for (var prop of Match2018V2MergeDialog.properties) {
      if(this.state.localSaved[prop] == this.state.fromFile[prop]) {
        this.state.merged[prop] = this.state.localSaved[prop];
      }
    }

    this.setupValidation();
  }

  deactivate() {
    this.teardownValidation();
  }

  private setupValidation() {
    this.rules = ValidationRules
      .ensure("vaultCount") 
      .required()
      .satisfiesRule("isNumeric")
      .ensure("scaleCount")
      .required()
      .satisfiesRule("isNumeric")
      .ensure("vaultCycleTime")
      .required()
      .satisfiesRule("isNumeric")
      .ensure("scaleCycleTime")
      .required()
      .satisfiesRule("isNumeric")
      .ensure("allySwitchCount")
      .required()
      .satisfiesRule("isNumeric")
      .ensure("allySwitchCycleTime")
      .required()
      .satisfiesRule("isNumeric")
      .ensure("oppoSwitchCount")
      .required()
      .satisfiesRule("isNumeric")
      .ensure("oppoSwitchCycleTime")
      .required()
      .satisfiesRule("isNumeric")
      .rules;

    this.renderer = new BootstrapRenderer({showMessages: true});
    this.validationController.addRenderer(this.renderer);
  }

  private teardownValidation() {
    this.validationController.removeRenderer(this.renderer);
  }

  liftedEqual() {
    if(this.state.localSaved.lifted == null && this.state.fromFile.lifted == null) {
      return true;
    }
    if(this.state.localSaved.lifted.length != this.state.fromFile.lifted.length) {
      return false;
    }

    for(var i = 0; i < this.state.localSaved.lifted.length; i++) {
      if(this.state.localSaved.lifted[i] != this.state.fromFile.lifted[i]) {
        return false;
      }
    }
    return true;
  }

  public takeAllFromDb() {
    for (var prop of Match2018V2MergeDialog.properties) {
      this.state.merged[prop] = this.state.localSaved[prop];
    }
  }

  public takeAllFromFile() {
    for (var prop of Match2018V2MergeDialog.properties) {
      this.state.merged[prop] = this.state.fromFile[prop];
    }
  }



  public resolve() {
    this.validationController.validate({object: this.state.merged, rules: this.rules })
      .then(validationResult => {
        if(validationResult.valid) {
          this.state.resolved = true;
          this.controller.ok();
        }
        else{
          this.errorMessage = "You screwed up.";
          this.state.resolved = false;
        }
      });
  }
}

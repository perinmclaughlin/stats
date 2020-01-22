import { autoinject } from "aurelia-framework";
import { DialogController, DialogService } from "aurelia-dialog";
import { ValidationController, ValidationControllerFactory, ValidationRules } from "aurelia-validation";
import { BootstrapRenderer } from "../../utilities/bootstrap-renderer";
import { Match2019MergeState, MergeDialogModel, setupValidationRules, makePlacementMergeStates, PlacementMergeState } from "./model";
import { allDeepSpaceGamepieceTypes, allDeepSpaceLocations, DeepSpaceEventType } from "../../persistence";

@autoinject
export class Match2019MergeDialog {
  state: Match2019MergeState;
  private validationController: ValidationController;
  private renderer: BootstrapRenderer;
  public rules: any[];
  public placementRules: any[];
  public errorMessage: string;
  public placementMergeStates : PlacementMergeState[];
  public gamepieces = allDeepSpaceGamepieceTypes;
  public locations = allDeepSpaceLocations;
  public gamepiecePlacement : DeepSpaceEventType = "Gamepiece Placement";

  public static properties = [
    "cargoPickup", "hatchPanelPickup",
    "isFailure", "failureReason", "isFoul", "foulReason",
    "level2ClimbAttempted", "level2ClimbSucceeded",
    "level3ClimbAttempted", "level3ClimbSucceeded",
    "level3ClimbBegin", "level3ClimbEnd",
    "lifted",
    "liftedBy",
    "notes",
  ];

  public static placementProperties = [
    "gamepiece", "location", "when", "sandstorm",
  ];

  constructor (
    validationControllerFactory: ValidationControllerFactory,
    private controller: DialogController
  ) {
    this.validationController = validationControllerFactory.createForCurrentScope();
  }

  activate(model: MergeDialogModel) {
    this.state = model.state;
    this.controller.settings.lock = false;
    this.controller.settings.overlayDismiss = true;

    for (var prop of Match2019MergeDialog.properties) {
      if(this.state.localSaved[prop] == this.state.fromFile[prop]) {
        this.state.merged[prop] = this.state.localSaved[prop];
      }
    }

    this.placementMergeStates = makePlacementMergeStates(this.state.fromFile, this.state.localSaved);
    for (var state of this.placementMergeStates) {
      state.setSameFields();
    }

    this.setupValidation();
  }

  deactivate() {
    this.teardownValidation();
  }

  private setupValidation() {
    let allRules = setupValidationRules();
    this.rules = allRules.rules;
    this.placementRules = allRules.placementRules;

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
    for (var prop of Match2019MergeDialog.properties) {
      this.state.merged[prop] = this.state.localSaved[prop];
    }
  }

  public takeAllFromFile() {
    for (var prop of Match2019MergeDialog.properties) {
      this.state.merged[prop] = this.state.fromFile[prop];
    }
  }

  public validateAll() {
    let validationPromises = this.state.merged.placements.map(placement => {
      return this.validationController.validate({
        object: placement,
        rules: this.placementRules
      });
    });
    validationPromises.push(this.validationController.validate({
      object: this.state.merged,
      rules: this.rules,
    }));

    return Promise.all(validationPromises);
  }

  public async resolve() {
    this.state.merged.placements = [];
    for(var state of this.placementMergeStates) {
      if(state.include) {
        this.state.merged.placements.push(state.merged);
      }
    }

    let results = await this.validateAll();
      if(results.every(result => result.valid)) {
        this.state.resolved = true;
        this.controller.ok();
      }
      else{
        this.errorMessage = "You screwed up.";
        this.state.resolved = false;
      }
  }


  public takeLocalPlacement(p: PlacementMergeState) {
    if(p.localSaved == null) {
      p.include = false;
    }else{
      p.include = true;
      for(var prop of Match2019MergeDialog.placementProperties) {
        p.merged[prop] = p.localSaved[prop];
      }
    }
  }

  public takeFilePlacement(p: PlacementMergeState) {
    if(p.fromFile == null) {
      p.include = false;
    }else{
      p.include = true;
      for(var prop of Match2019MergeDialog.placementProperties) {
        p.merged[prop] = p.fromFile[prop];
      }
    }

  }

  public static open(dialogService: DialogService, model: MergeDialogModel) {
    return dialogService.open({model: model, viewModel: Match2019MergeDialog});
  }
}

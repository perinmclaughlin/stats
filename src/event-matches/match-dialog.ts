import { autoinject } from "aurelia-framework";
import { ValidationController, ValidationControllerFactory, ValidationRules } from "aurelia-validation";
import { FrcStatsContext, EventTeamEntity, EventMatchEntity, EventEntity, TeamEntity } from "../persistence";
import { DialogController } from "aurelia-dialog";
import { DialogService } from "aurelia-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { BootstrapRenderer } from "../utilities/bootstrap-renderer";

@autoinject
export class MatchDialog {
  private x: number;
  private dialog_matchNumber: number;
  private dialog_teamNumbers_blue0: string;
  private dialog_teamNumbers_blue1: string;
  private dialog_teamNumbers_blue2: string;
  private dialog_teamNumbers_red0: string;
  private dialog_teamNumbers_red1: string;
  private dialog_teamNumbers_red2: string;
  public match: EventMatchEntity;
  public prevMatchNumber: string;
  public teams: string[];
  public isNull: boolean = false;
  public minInput = 1;
  public mode = "add";

  private validationController: ValidationController;
  private renderer: BootstrapRenderer;
  public rules: any[];

  constructor(
    private dbContext: FrcStatsContext,
    private controller: DialogController,
    validationControllerFactory: ValidationControllerFactory,
    private dialogService: DialogService
  ){

    this.validationController = validationControllerFactory.createForCurrentScope();

  }

  activate(model) {
    this.controller.settings.lock = false;
    this.controller.settings.overlayDismiss = true;
    this.teams = model.teams;
    this.mode = model.mode;

    let promise = Promise.resolve("yup");

    this.match = {
      matchNumber: null,
      year: model.year,
      eventCode: model.eventCode,
      red1: "",
      red2: "",
      red3: "",
      blue1: "",
      blue2: "",
      blue3: "",
    };

    if(this.mode == "edit") {
      this.prevMatchNumber = model.matchNumber;
      promise = this.dbContext.eventMatches
        .where(["year", "eventCode", "matchNumber"])
        .equals([model.year, model.eventCode, model.matchNumber])
        .first().then(savedMatch => {
          if(savedMatch != null) {
            this.match = savedMatch;
          }else{
            this.mode = "add";
          }
          return "yup";
        })
    }

    this.setupValidation();
    return promise;
  }

  deactivate() {
    this.teardownValidation();
  }

  private setupValidation() {

    this.setupRules();

    this.rules = ValidationRules
      .ensure("matchNumber") 
      .required()
      .satisfiesRule("matchNoExists")
      .satisfiesRule("isNumeric")
      .ensure("blue1")
      .required()
      .ensure("blue2")
      .required()
      .satisfiesRule("isNotBlue1")
      .ensure("blue3")
      .required()
      .satisfiesRule("isNotBlue1")
      .satisfiesRule("isNotBlue2")
      .ensure("red1")
      .required()
      .satisfiesRule("isNotBlue1")
      .satisfiesRule("isNotBlue2")
      .satisfiesRule("isNotBlue3")
      .ensure("red2")
      .required()
      .satisfiesRule("isNotBlue1")
      .satisfiesRule("isNotBlue2")
      .satisfiesRule("isNotBlue3")
      .satisfiesRule("isNotRed1")
      .ensure("red3")
      .required()
      .satisfiesRule("isNotBlue1")
      .satisfiesRule("isNotBlue2")
      .satisfiesRule("isNotBlue3")
      .satisfiesRule("isNotRed1")
      .satisfiesRule("isNotRed2")
      .on(this.match)
      .rules;

    this.renderer = new BootstrapRenderer({showMessages: true});
    this.validationController.addRenderer(this.renderer);
  }

  private setupRules() {
    [1,2,3].forEach(n => {
      ValidationRules.customRule(
        "isNotBlue" + n,
        (teamNumber: string, obj: EventMatchEntity) => {
          if(teamNumber == null || teamNumber == "") {
            return true;
          }
          return teamNumber != obj['blue' + n];
        }, "is already in ${$getDisplayName('blue" + n + "')}"
      );
      ValidationRules.customRule(
        "isNotRed" + n,
        (teamNumber: string, obj: EventMatchEntity) => {
          if(teamNumber == null || teamNumber == "") {
            return true;
          }
          return teamNumber != obj['red' + n];
        }, "is already in ${$getDisplayName('red" + n + "')}"
      );
    });

    ValidationRules.customRule(
      "matchNoExists",
      (matchNumber: string, obj: EventMatchEntity) => {
        if(matchNumber == null) {
          return true;
        }
        return this.dbContext.eventMatches
          .where(["year", "eventCode", "matchNumber"])
          .equals([obj.year, obj.eventCode, matchNumber]).first()
          .then(savedMatch => {
            if(this.mode == "add") {
              return savedMatch == null;
            }else {
              return savedMatch == null || savedMatch.id == obj.id;
            }
          });
      }, "match already exists.");
  }

  private teardownValidation() {
    this.validationController.removeRenderer(this.renderer);
  }

  save() {
    this.validationController.validate({object: this.match, rules: this.rules}).then(validationResult => {
      if(!validationResult.valid) {
        throw new Error("invalid - stop save");
      }
      console.info("validation succeeded");
    }).then(() => {
      console.info(this.match);
      this.dbContext.eventMatches
        .where(["year", "eventCode", "matchNumber"])
        .equals([this.match.year, this.match.eventCode, this.match.matchNumber]).first()
        .then(savedMatch => {
          if(savedMatch != null){
            this.match.id = savedMatch.id;
          }
        }).then(() => {
          return this.dbContext.eventMatches.put(this.match);
        }).then(() => {
          if(this.mode == "edit" && this.prevMatchNumber != this.match.matchNumber) {
            return this.dbContext.teamMatches2018
              .where(["eventCode", "matchNumber"])
              .equals([this.match.eventCode, this.prevMatchNumber])
              .toArray()
              .then(matches2018 => {
                for(var match of matches2018) {
                  match.matchNumber = this.match.matchNumber;
                }

                return this.dbContext.teamMatches2018.bulkPut(matches2018);
              }).then(() => "yup");
          }else {
            return Promise.resolve("yup");
          }
        }).then(() => {
          console.info("dupr I saved");
          this.controller.ok();
        });
    });
  }
}

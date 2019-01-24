import { autoinject } from "aurelia-framework";
import { BootstrapRenderer } from "../../utilities/bootstrap-renderer";
import { ValidationController, ValidationControllerFactory, ValidationRules } from "aurelia-validation";
import { TeamMatch2019Entity, TeamEntity, EventEntity, EventMatchEntity, FrcStatsContext, make2019match, EventMatchSlots, DeepSpaceEvent } from "../../persistence";
import { Disposable, BindingEngine } from "aurelia-binding";
import { DialogService } from "aurelia-dialog";
import { Router } from "aurelia-router";
import { scrollToTop } from "../../utilities/scroll";
import { getTeamNumbers } from "../merge-utils";
import { DeepSpaceBingoDialog } from "./deepspace-bingo";
import { QrCodeDisplayDialog } from "../../qrcodes/display-dialog";
import { clone } from "lodash";
import { nextMatchNumber, previousMatchNumber } from "../../model";

@autoinject 
export class MatchInputPage {
  public model: TeamMatch2019Entity;
  public team: TeamEntity;
  public event: EventEntity;
  public eventMatch: EventMatchEntity;
  public partner1: string;
  public partner2: string;
  public liftedPartner1 = false;
  public liftedPartner2 = false;
  public isBlue = false;
  public isRed = false;
  public errorMessage: string;
  public errorNotScheduled = false;
  public hasNextMatch = false;
  public hasPreviousMatch = false;

  public rules: any[];
  public placementRules: any[];
  private validationController: ValidationController;
  private renderer: BootstrapRenderer;
  private observers: Disposable[];

  constructor(
    private bindingEngine: BindingEngine,
    private dialogService: DialogService,
    private dbContext: FrcStatsContext,
    validationControllerFactory: ValidationControllerFactory,
    private router: Router
    ){
    this.validationController = validationControllerFactory.createForCurrentScope();
  }

  public async activate(params) {
    let promise = Promise.resolve("yup");
    scrollToTop();
    
    await this.load(params);
    this.observeFields();
    this.setupValidation();
  }

  public deactivate() {
    this.unobserveFields();
    this.teardownValidation();
  }

  private observeFields() {
    this.observers = [];

    this.observers.push(this.bindingEngine.propertyObserver(this, 'liftedPartner1').subscribe(liftedPartner1 => {
      if(liftedPartner1 && this.model.lifted.indexOf(this.partner1) == -1) {
        this.model.lifted.push(this.partner1);
      }else if(!liftedPartner1 && this.model.lifted.indexOf(this.partner1) != -1) {
        this.model.lifted = this.model.lifted.filter(teamNumber => teamNumber != this.partner1);
      }
    }));

    this.observers.push(this.bindingEngine.propertyObserver(this, 'liftedPartner2').subscribe(liftedPartner2 => {
      if(liftedPartner2 && this.model.lifted.indexOf(this.partner2) == -1) {
        this.model.lifted.push(this.partner2);
      }else if(!liftedPartner2 && this.model.lifted.indexOf(this.partner2) != -1) {
        this.model.lifted = this.model.lifted.filter(teamNumber => teamNumber != this.partner2);
      }
    }));
  }

  private unobserveFields() {
    for(var observer of this.observers) {
      observer.dispose();
    }
    this.observers = [];
  }

  public async load(params) {
    let matches = await this.dbContext.getTeamMatches2019({
      eventCode: params.eventCode,
      teamNumber: params.teamNumber,
      matchNumber: params.matchNumber,
    });
    if (matches.length == 0) {
      this.model = make2019match(params.eventCode, params.teamNumber, params.matchNumber);
    } else {
      this.model = matches[0];
    }

    this.team = await this.dbContext.getTeam(params.teamNumber)
    this.event = await this.dbContext.getEvent(params.year, params.eventCode);
    this.eventMatch = await this.dbContext.getEventMatch(params.year, params.eventCode, params.matchNumber);
    let nextMatch = await this.dbContext.getEventMatch(params.year, params.eventCode, nextMatchNumber(params.matchNumber));
    let prevMatch = await this.dbContext.getEventMatch(params.year, params.eventCode, previousMatchNumber(params.matchNumber));
    this.hasNextMatch = nextMatch != null;
    this.hasPreviousMatch = prevMatch != null;
    let teamNumbers = getTeamNumbers(this.eventMatch);
    if (!teamNumbers.has(params.teamNumber)) {
      this.errorNotScheduled = true;
    }

    var blues = [this.eventMatch.blue1, this.eventMatch.blue2, this.eventMatch.blue3];
    var reds = [this.eventMatch.red1, this.eventMatch.red2, this.eventMatch.red3];
    this.isBlue = blues.indexOf(this.team.teamNumber) != -1;
    this.isRed = reds.indexOf(this.team.teamNumber) != -1;
    if (this.isBlue) {
      var others = blues.filter(teamNumber => teamNumber != this.team.teamNumber);
      this.partner1 = others[0];
      this.partner2 = others[1];
    } else if (this.isRed) {
      var others = reds.filter(teamNumber => teamNumber != this.team.teamNumber);
      this.partner1 = others[0];
      this.partner2 = others[1];
    }

    if (this.model.lifted == null) {
      this.model.lifted = [];
    }

    if (this.model.lifted.indexOf(this.partner1) != -1) {
      this.liftedPartner1 = true;
    }
    if (this.model.lifted.indexOf(this.partner2) != -1) {
      this.liftedPartner2 = true;
    }
  }

  private setupValidation() {
    this.rules = ValidationRules
      .ensure((obj: TeamMatch2019Entity) => obj.cargoPickup)
        .required()
        .satisfiesRule("isQualitativeNumeric")
      .ensure((obj: TeamMatch2019Entity) => obj.hatchPanelPickup)
        .required()
        .satisfiesRule("isQualitativeNumeric")
      .required()
      .rules;

      this.placementRules = ValidationRules
      .ensure((obj: DeepSpaceEvent) => obj.location)
        .required()
        .when((obj: DeepSpaceEvent) => obj.eventType == "Gamepiece Placement")
      .rules;

    this.renderer = new BootstrapRenderer({showMessages: true});
    this.validationController.addRenderer(this.renderer);
  }

  private teardownValidation() {
    this.validationController.removeRenderer(this.renderer);
  }

  public showBingo() {
    DeepSpaceBingoDialog.open(this.dialogService, {
        match: this.model,
    });
  }

  public exportToQrCode() {
    if(this.model.id == null){
      return;
    }
    QrCodeDisplayDialog.open(this.dialogService,
      { data: this.prepareQrCodeData() },
    )
  }

  public prepareQrCodeData() {
    let model = clone(this.model);
    delete model['id'];
    model['year'] = this.event.year;
    let result = JSON.stringify(model);
    return result;
  }

  public addPlacement() {
    let placement : DeepSpaceEvent = {
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: null,
      sandstorm: false,
      when: null,
    };

    this.model.placements.push(placement);
  }

  public validateAll() {
    let validationPromises = this.model.placements.map(placement => this.validationController.validate({
      object: placement,
      rules: this.placementRules
    }));
    validationPromises.push(this.validationController.validate({
      object: this.model,
      rules: this.rules,
    }));

    return Promise.all(validationPromises);
  }

  public async save() {
    let validationResults = await this.validateAll();
    if (validationResults.every(validationResult => validationResult.valid)) {
      this.fixupNumericProperties();

      let savedMatches = await this.dbContext.getTeamMatches2019({
        eventCode: this.model.eventCode,
        teamNumber: this.model.teamNumber,
        matchNumber: this.model.matchNumber,
      });
      if (savedMatches.length != 0) {
        this.model.id = savedMatches[0].id;
      }
      await this.dbContext.teamMatches2019.put(this.model);
      await this.load({
        year: this.event.year,
        eventCode: this.model.eventCode,
        matchNumber: this.model.matchNumber,
        teamNumber: this.model.teamNumber
      });
      // yay, you saved! we're not taking you anywhere
    } else {
      this.errorMessage = "there are validation errors";
      console.info(validationResults.filter(v => !v.valid));
    }
  }

  private fixupNumericProperties() {
    // TODO
    var numericProperties = [
      'scaleCount', 'scaleCycleTime',
      'allySwitchCount', 'allySwitchCycleTime',
      'oppoSwitchCount', 'oppoSwitchCycleTime',
      'vaultCount', 'vaultCycleTime'
    ];
    for (var prop of numericProperties) {
      if (this.model[prop] == "Infinity") {
        this.model[prop] = Infinity;
      } else if (typeof this.model[prop] == "string") {
        this.model[prop] = parseInt(this.model[prop]);
      }
    }
  }

  public async gotoMatch(matchNumber: string) {
    let eventCode = this.model.eventCode;
    let year = this.event.year;
    let slot = EventMatchSlots.filter(slot => 
      this.eventMatch[slot.prop] == this.model.teamNumber
    )[0];
    let nextEventMatch = await this.dbContext.getEventMatch(this.event.year, this.event.eventCode, matchNumber);
    let teamNumber = nextEventMatch[slot.prop];

    this.router.navigateToRoute("match-team", {
      year: year,
      eventCode: eventCode,
      teamNumber: teamNumber,
      matchNumber: matchNumber,
    });
  }

  public async gotoNextMatch() {
    await this.gotoMatch(nextMatchNumber(this.model.matchNumber));
  }

  public async gotoPreviousMatch() {
    await this.gotoMatch(previousMatchNumber(this.model.matchNumber));
  }
}

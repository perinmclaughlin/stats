import { autoinject } from "aurelia-framework";
import { BootstrapRenderer } from "../../utilities/bootstrap-renderer";
import { ValidationController, ValidationControllerFactory, ValidationRules } from "aurelia-validation";
import { TeamMatch2019Entity, TeamEntity, EventEntity, EventMatchEntity, FrcStatsContext, make2019match, EventMatchSlots, DeepSpaceEvent, qualitativeAnswers, allDeepSpaceLocations, allDeepSpaceGamepieceTypes } from "../../persistence";
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
  public qualifiedAnswers = qualitativeAnswers;
  public locationArray = allDeepSpaceLocations;
  public gamepieceArray = allDeepSpaceGamepieceTypes;
  public maxWhen = 135;
  public hasSaved: boolean;
  public slots: any;

  public rules: any[];
  public placementRules: any[];
  public validationController: ValidationController;
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
    this.hasSaved = false;
    this.slots = null;
  }

  public async activate(params) {
    let promise = Promise.resolve("yup");
    scrollToTop();
    this.observeFields();
    
    await this.load(params);
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

  private observeModel() {
    this.observers.push(this.bindingEngine.propertyObserver(this.model, 'level3ClimbAttempted').subscribe(() => {
      if(!this.model.level3ClimbAttempted) {
        this.model.level3ClimbSucceeded = false;
      }
    }));
    this.observers.push(this.bindingEngine.propertyObserver(this.model, 'level2ClimbAttempted').subscribe(() => {
      if(!this.model.level2ClimbAttempted) {
        this.model.level2ClimbSucceeded = false;
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

    this.observeModel();

    this.team = await this.dbContext.getTeam(params.teamNumber)
    this.event = await this.dbContext.getEvent(params.year, params.eventCode);
    this.eventMatch = await this.dbContext.getEventMatch(params.year, params.eventCode, params.matchNumber);
    this.slots = EventMatchSlots.filter(slot => 
      this.eventMatch[slot.prop] == this.model.teamNumber
    )[0];
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
      .ensure((obj: TeamMatch2019Entity) => obj.level3ClimbBegin)
        .satisfiesRule("minimum", 0)
        .satisfiesRule("maximum", 135)
      .ensure((obj: TeamMatch2019Entity) => obj.level3ClimbEnd)
        .satisfiesRule("minimum", 0)
        .satisfiesRule("maximum", 135)
      .ensure((obj: TeamMatch2019Entity) => obj.level3ClimbSucceeded)
        .satisfiesRule("attempted", "level3ClimbAttempted")
      .ensure((obj: TeamMatch2019Entity) => obj.level2ClimbSucceeded)
        .satisfiesRule("attempted", "level2ClimbAttempted")
    .rules;

    this.placementRules = ValidationRules
      .ensure((obj: DeepSpaceEvent) => obj.location)
        .required()
        .satisfiesRule("isDeepSpaceLocation")
        .when((obj: DeepSpaceEvent) => obj.eventType == "Gamepiece Placement")
      .ensure((obj: DeepSpaceEvent) => obj.gamepiece)
        .required()
        .satisfiesRule("isDeepSpaceGamepiece")
        .when((obj: DeepSpaceEvent) => obj.eventType == "Gamepiece Placement")
      .ensure((obj: DeepSpaceEvent) => obj.when)
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
      gamepiece: null,
      location: null,
      sandstorm: false,
      when: null,
    };

    this.model.placements.push(placement);
  }

  public deleteRow(index:number){
    this.model.placements.splice(index, 1);
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
    console.info(validationResults);
    if (validationResults.every(validationResult => validationResult.valid)) {
      this.fixupNumericProperties();

      let savedMatches = await this.dbContext.getTeamMatches2019({
        eventCode: this.model.eventCode,
        teamNumber: this.model.teamNumber,
        matchNumber: this.model.matchNumber,
      });
      let modelToSave = JSON.parse(JSON.stringify(this.model))
      if (savedMatches.length != 0) {
        modelToSave.id = savedMatches[0].id;
      }
      await this.dbContext.teamMatches2019.put(modelToSave);
      await this.load({
        year: this.event.year,
        eventCode: this.model.eventCode,
        matchNumber: this.model.matchNumber,
        teamNumber: this.model.teamNumber
      });
      // yay, you saved! we're not taking you anywhere
      this.hasSaved = true;
      setTimeout(() => {
        this.hasSaved = false;
      }, 3000);
    } else {
      this.errorMessage = "There are validation errors!";
      setTimeout(() => {
        this.errorMessage = null;
      }, 3000);
      console.info(validationResults.filter(v => !v.valid));
      this.hasSaved = false;
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

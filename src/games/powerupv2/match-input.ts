import { autoinject } from "aurelia-framework";
import { BindingEngine, Disposable } from "aurelia-binding";
import { DialogService } from "aurelia-dialog";
import { Router } from "aurelia-router";
import { ValidationController, ValidationControllerFactory, ValidationRules } from "aurelia-validation";
import { 
  FrcStatsContext, 
  TeamMatch2018V2Entity, make2018v2match, 
  TeamEntity, EventEntity, EventMatchEntity,
} from "../../persistence";
import { MatchData } from "../../model";
import { BootstrapRenderer } from "../../utilities/bootstrap-renderer";
import { PowerupBingoDialog } from "../powerup/powerup-bingo";
import { actionTypes, actionTypeMap } from "./action-types";



@autoinject
export class MatchTeamPage2 {
  public model: TeamMatch2018V2Entity;
  public team: TeamEntity;
  public event: EventEntity;
  public eventMatch: EventMatchEntity;
  public partner1: string;
  public partner2: string;
  public isBlue = false;
  public isRed = false;
  public errorMessage: string;
  public defaultMax = 100;

  public rules: any[];
  public matchRunning: boolean;
  public intervalId: any;
  public time: number;
  public actionType: number;
  private validationController: ValidationController;
  private renderer: BootstrapRenderer;
  public mode = "add";
  public hasErrors = false;

  public liftedPartner1 = false;
  public liftedPartner2 = false;

  private observers: Disposable[];

  public currentTime = 150;
  public actionTypes = actionTypes;
  public actionTypeMap = actionTypeMap;

  constructor(
    private bindingEngine: BindingEngine,
    private dialogService: DialogService,
    private dbContext: FrcStatsContext,
    validationControllerFactory: ValidationControllerFactory,
    private router: Router
    ){
    this.validationController = validationControllerFactory.createForCurrentScope();
  }

  public activate(params) {
    let promise = Promise.resolve("yup");
    
    return this.load(params).then(() => {
      this.observeFields();
      this.setupValidation();
    }).catch(err => {
      this.hasErrors = true;
      return null;
    });
  }

  public deactivate() {
    this.unobserveFields();
    this.teardownValidation();
  }

  private observeFields() {
    this.observers = [];
  }

  private unobserveFields() {
    for(var observer of this.observers) {
      observer.dispose();
    }
    this.observers = [];
  }

  public load(params) {

    var matchPromise = this.dbContext.teamMatches2018V2.where(['eventCode', 'teamNumber', 'matchNumber'])
      .equals([params.eventCode, params.teamNumber, params.matchNumber]).first()
    .then(match => {
      if(match == null) {
        match = make2018v2match(params.eventCode, params.teamNumber, params.matchNumber);
      }

      this.model = match;
    });

    var teamPromise = this.dbContext.teams.where('teamNumber').equals(params.teamNumber).first().then(team => {
      this.team = team;
    });

    var eventPromise = this.dbContext.events.where('eventCode').equals(params.eventCode).first().then(evnt => {
      this.event = evnt;
    });

    var eventMatchPromise = this.dbContext.eventMatches
      .where(["year", "eventCode", "matchNumber"])
      .equals([params.year, params.eventCode, params.matchNumber]).first()
      .then(eventMatch => {
        this.eventMatch = eventMatch;
      });

    return Promise.all([matchPromise, teamPromise, eventPromise, eventMatchPromise]).then(() => {
      var blues = [this.eventMatch.blue1, this.eventMatch.blue2, this.eventMatch.blue3];
      var reds = [this.eventMatch.red1, this.eventMatch.red2, this.eventMatch.red3];
      this.isBlue = blues.indexOf(this.team.teamNumber) != -1;
      this.isRed = reds.indexOf(this.team.teamNumber) != -1;
      if(this.isBlue) {
        var others = blues.filter(teamNumber => teamNumber != this.team.teamNumber);
        this.partner1 = others[0];
        this.partner2 = others[1];
      }else if(this.isRed) {
        var others = reds.filter(teamNumber => teamNumber != this.team.teamNumber);
        this.partner1 = others[0];
        this.partner2 = others[1];
      }

    });
  }

  public click() {
    this.validationController.validate({
      object: this.model,
      rules: this.rules,
    }).then(validationResult => {
      var i = 0;
      if(validationResult.valid) {
        var numericProperties = [
        ];
        for (var prop of numericProperties) {
          if(this.model[prop] == "Infinity") {
            this.model[prop] = Infinity;
          }else if(typeof this.model[prop] == "string") {
            this.model[prop] = parseInt(this.model[prop]);
          }
        }
    
        this.dbContext.teamMatches2018V2.where(['eventCode', 'teamNumber', 'matchNumber'])
          .equals([this.model.eventCode, this.model.teamNumber, this.model.matchNumber]).first()
        .then(savedMatch => {
          if(savedMatch != null) {
            this.model.id = savedMatch.id;
          }
        }).then(() => {
          return this.dbContext.teamMatches2018V2.put(this.model);
        }).then(() => {
          return this.load({
            year: this.event.year,
            eventCode: this.model.eventCode,
            matchNumber: this.model.matchNumber,
            teamNumber: this.model.teamNumber
          });
        }).then(() => {
          this.router.navigateToRoute("event-matches", {
            year: this.event.year,
            eventCode: this.model.eventCode,
          });
        });
      }else{
        this.errorMessage = "there are validation errors";
      }
    });
  }

  private setupValidation() {
    this.rules = ValidationRules
      .ensure("scaleKnockedOutCount")
      .satisfiesRule("isNumeric")
      .on(this.model)
      .rules;

    this.renderer = new BootstrapRenderer({showMessages: true});
    this.validationController.addRenderer(this.renderer);
  }

  private teardownValidation() {
    this.validationController.removeRenderer(this.renderer);
  }

  public showBingo() {
    this.dialogService.open({
      model: {
        match: this.model,
      },
      viewModel: PowerupBingoDialog,
    });
  }

  public beginMatch() {
    this.currentTime = 150;
    this.matchRunning = true;
    this.intervalId = setInterval(() => {
      this.currentTime--;
      if (this.currentTime == 0) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.matchRunning = false;
      }
    }, 1000);
  }

  public startThingHappened() {
    if(this.matchRunning) {
      this.time = this.currentTime;
    }
  }

  public saveThing() {
    this.model.actions.push({
      time: this.time,
      actionTypeId: this.actionType,
    });

    this.time = null;
    this.actionType = null;
  }

  public currentTimeDisplay(currentTime) {
    if(currentTime > 135) {
      return `Auto ${currentTime - 135}`;
    }
    return `Teleop ${currentTime}`;
  }
}


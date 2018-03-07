import { autoinject } from "aurelia-framework";
import { BindingEngine, Disposable } from "aurelia-binding";
import { MatchData } from "./model";
import { 
  FrcStatsContext, 
  TeamMatch2018Entity, make2018match, 
  TeamEntity, EventEntity, EventMatchEntity,
} from "./persistence";
import { ValidationController, ValidationControllerFactory, ValidationRules } from "aurelia-validation";
import { BootstrapRenderer } from "./bootstrap-renderer";
import { Router } from "aurelia-router";


@autoinject
export class MatchTeamPage {
  public model: TeamMatch2018Entity;
  public team: TeamEntity;
  public event: EventEntity;
  public eventMatch: EventMatchEntity;
  public partner1: string;
  public partner2: string;
  public isBlue = false;
  public isRed = false;

  public rules: any[];
  private validationController: ValidationController;
  private renderer: BootstrapRenderer;
  public mode = "add";

  public liftedPartner1 = false;
  public liftedPartner2 = false;

  private observers: Disposable[];

  constructor(
    private bindingEngine: BindingEngine,
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
    });
  }

  public deactivate() {
    this.unobserveFields();
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

  public load(params) {

    var matchPromise = this.dbContext.teamMatches2018.where(['eventCode', 'teamNumber', 'matchNumber'])
      .equals([params.eventCode, params.teamNumber, params.matchNumber]).first()
    .then(match => {
      if(match == null) {
        match = make2018match(params.eventCode, params.teamNumber, params.matchNumber);
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

      if(this.model.lifted == null) {
        this.model.lifted = [];
      }

      if(this.model.lifted.indexOf(this.partner1) != -1) {
        this.liftedPartner1 = true;
      }
      if(this.model.lifted.indexOf(this.partner2) != -1) {
        this.liftedPartner2 = true;
      }
    });
  }

  public decrement(prop: string) {
    let value = parseInt(<any>this.model[prop]);
    if(value <= 0 || isNaN(value)) {
      value = 0;
    }else {
      value--;
    }

    this.model[prop] = value;
  }

  public decrement5(prop: string) {
    let value = parseInt(<any>this.model[prop]);
    if(value <= 0 || isNaN(value)) {
      value = 0;
    }else {
      value-=5;
    }

    this.model[prop] = value;
  }

  public increment(prop: string) {
    let value = parseInt(<any>this.model[prop]);
    if(value < 0 || isNaN(value)) {
      value = 0;
    }else {
      value++;
    }

    this.model[prop] = value;
  }

  public increment5(prop: string) {
    let value = parseInt(<any>this.model[prop]);
    if(value < 0 || isNaN(value)) {
      value = 0;
    }else {
      value+=5;
    }

    this.model[prop] = value;
  }

  public click() {
    this.validationController.validate({
      object: this.model,
      rules: this.rules,
    }).then(validationResult => {
      var i = 0;
      if(validationResult.valid){
        var numericProperties = [
          'scaleCount', 'scaleCycleTime', 
          'allySwitchCount', 'allySwitchCycleTime', 
          'oppoSwitchCount', 'oppoSwitchCycleTime', 
          'vaultCount', 'vaultCycleTime'
        ];
        for (var prop of numericProperties) {
          if(this.model[prop] == "Infinity") {
            this.model[prop] = Infinity;
          }else if(typeof this.model[prop] == "string") {
            this.model[prop] = parseInt(this.model[prop]);
          }
        }
    
        this.dbContext.teamMatches2018.where(['eventCode', 'teamNumber', 'matchNumber'])
          .equals([this.model.eventCode, this.model.teamNumber, this.model.matchNumber]).first()
        .then(savedMatch => {
          if(savedMatch != null) {
            this.model.id = savedMatch.id;
          }
        }).then(() => {
          return this.dbContext.teamMatches2018.put(this.model);
        }).then(() => {
          return this.load({
            year: this.event.year,
            eventCode: this.model.eventCode,
            matchNumber: this.model.matchNumber,
            teamNumber: this.model.teamNumber
          });
        }).then(() => {
          this.router.navigateToRoute("event", {
            year: this.event.year,
            eventCode: this.model.eventCode,
          });
        });
      }
    });
  }

  private setupValidation() {
    this.setupRules();

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
      .on(this.model)
      .rules;

    this.renderer = new BootstrapRenderer({showMessages: true});
    this.validationController.addRenderer(this.renderer);
  }

  private setupRules() {

    ValidationRules.customRule(
      "isNumeric",
      (vaultCount: string, obj: EventMatchEntity) => {
        if(vaultCount == null || vaultCount == "") {
          return true;
        }
        let pattern = /^\d*$/;
        if(!pattern.test(vaultCount)){
          return false;
        }
        return true;
      }, "Your input needs to be a number."
    );
  }
}

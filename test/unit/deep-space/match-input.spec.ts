import { ComponentTester } from "aurelia-testing";
import { TeamMatch2019Entity, make2019match, QualitativeNumeric, DeepSpaceEvent } from '../../../src/persistence'
import { Container } from 'aurelia-framework';
import { MatchInputPage } from '../../../src/games/deepspace/match-input';
import { bootstrap } from "aurelia-bootstrapper";
import { configureWazzis } from "../../../src/main";
import { CustomValidationRules } from "../../../src/custom-validation-rules";


describe('deep space match-input', () => {
  
  let componentTester: ComponentTester;
  let container: Container;
  let data: TeamMatch2019Entity;
  let placement: DeepSpaceEvent;
  let page: MatchInputPage;

  beforeAll(() => {
    componentTester = new ComponentTester();
    componentTester.bootstrap(aurelia => {
      container = aurelia.container;
      return configureWazzis(aurelia);
    });
    return componentTester.create(bootstrap).then(() => {
      // validation rules need to be initialized
      container.get(CustomValidationRules);
    });
  });

  afterAll(() => {
    componentTester.dispose();
  });


  beforeEach(() => {
    page = makePage();
    data = make2019match('SOMETHING', '0000', '1');
    placement = {
      eventType: "Gamepiece Placement",
      gamepiece: "Hatch Panel",
      location: "Cargo Ship",
      sandstorm: false,
      when: 120,
    };
    data.level3ClimbBegin = null;
    data.level3ClimbEnd = null;
  });


  function makePage() {
    let page: MatchInputPage = container.get(MatchInputPage);
    page.setupValidation();

    return page;
  }
 
  it('validates valid data', () => {
    return page.validationController.validate({
      object: data,
      rules: page.rules
    }).then((validationResults) => {
      expect(validationResults.valid).toBe(true)
    })
  });

  function validateSingle(propertyName, errorMessage) {
    return page.validationController.validate({
      object: data,
      rules: page.rules
    }).then((validationResults) => {
      expect(validationResults.valid).toBe(false);
      let failedResults = validationResults.results.filter(r => !r.valid);
      if(failedResults.length > 1) {
        console.info(failedResults[0]);
        console.info(failedResults[1]);
      }
      expect(failedResults[0].propertyName).toBe(propertyName);
      expect(failedResults[0].message).toBe(errorMessage);
      expect(failedResults.length).toBe(1);
      
    });
  }

  it('validates null hatchPanelPickup', () => {
    data.hatchPanelPickup = <any>null; 

    return validateSingle("hatchPanelPickup", "Hatch Panel Pickup is required.");
  });

  it('validates invalid hatchPanelPickup', () => {
    data.hatchPanelPickup = <QualitativeNumeric>-1; 

    return validateSingle("hatchPanelPickup", "invalid qualitative value");
  });

  it('validates null cargoPickup', () => {
    data.cargoPickup = <any>null; 

    return validateSingle("cargoPickup", "Cargo Pickup is required.");
  });

  it('validates invalid cargoPickup', () => {
    data.cargoPickup = <QualitativeNumeric>-1; 

    return validateSingle("cargoPickup", "invalid qualitative value");
  });

  let level3ClimbData = [
    { time: -1, message: "must be greater than or equal to 0.", beginOrEnd: "level3ClimbBegin" },
    { time: 136, message: "must be less than or equal to 135.", beginOrEnd: "level3ClimbBegin" },
    { time: -1, message: "must be greater than or equal to 0.", beginOrEnd: "level3ClimbEnd" },
    { time: 136, message: "must be less than or equal to 135.", beginOrEnd: "level3ClimbEnd" },
    { time: "extra dip", message: "Your input needs to be a number.", beginOrEnd: "level3ClimbBegin" },
    { time: "cheese", message: "Your input needs to be a number.", beginOrEnd: "level3ClimbEnd" }
  ];

  level3ClimbData.forEach(item => {
    it(`somebody climbed level 3 with match time of ${item.time}`, () => {
      data[item.beginOrEnd] = item.time;
  
      return validateSingle(item.beginOrEnd, `${item.message}`);
    });
  });

  //Because end time can't be BEFORE start time
  it('somehow a team climbed before they started', () => {
    data.level3ClimbBegin = 30;
    data.level3ClimbEnd = 60;

    return validateSingle("level3ClimbBegin", `you can't finish something BEFORE you start it!`);
  });

  it('\"you cannot succeed if you don\'t try!\" level 2', () => {
    data.level2ClimbAttempted = false;
    data.level2ClimbSucceeded = true;
    return validateSingle("level2ClimbSucceeded", `You can't succeed if you don't try!`);
  });

  it('\"you cannot succeed if you don\'t try!\" level 3', () => {
    data.level3ClimbAttempted = false;
    data.level3ClimbSucceeded = true;
    return validateSingle("level3ClimbSucceeded", `You can't succeed if you don't try!`);
  });

  it('a team can\'t lift someone who is lifting them', () => {
    data.lifted = ["1111", "2222"];
    data.liftedBy = "1111"
    return validateSingle("liftedBy", `A team cannot lift someone that is lifting them.`);
  });

  it('validates valid placement', () => {
    page.validationController.validate({
      object: placement,
      rules: page.placementRules
    }).then((validationResults) => {
      expect(validationResults.valid).toBe(true)
    })
  });
  
  function validateSinglePlacement(propertyName, errorMessage) {
    return page.validationController.validate({
      object: placement,
      rules: page.placementRules
    }).then((validationResults) => {
      expect(validationResults.valid).toBe(false);
      let failedResults = validationResults.results.filter(r => !r.valid);
      expect(failedResults[0].propertyName).toBe(propertyName);
      expect(failedResults[0].message).toBe(errorMessage);
      expect(failedResults.length).toBe(1);
      if(failedResults.length > 1) {
        console.info(failedResults[1]);
      }
    });
  }

  it("validates placement gamepiece", () => {
    placement.gamepiece = null;
    return validateSinglePlacement("gamepiece", "Gamepiece is required.")
  });
})

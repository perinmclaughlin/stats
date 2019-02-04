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
  });


  function makePage() {
    let page: MatchInputPage = container.get(MatchInputPage);
    page.setupValidation();

    return page;
  }
 
  it('validates valid data', () => {
    page.validationController.validate({
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
      expect(failedResults[0].propertyName).toBe(propertyName);
      expect(failedResults[0].message).toBe(errorMessage);
      expect(failedResults.length).toBe(1);
      if(failedResults.length > 1) {
        console.info(failedResults[1]);
      }
    });
  }

  it('validates null hatchPanelPickup', () => {
    data.hatchPanelPickup = null; 

    return validateSingle("hatchPanelPickup", "Hatch Panel Pickup is required.");
  });

  it('validates invalid hatchPanelPickup', () => {
    data.hatchPanelPickup = <QualitativeNumeric>-1; 

    return validateSingle("hatchPanelPickup", "invalid qualitative value");
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
  })
})

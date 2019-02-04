import { autoinject } from "aurelia-framework";
import { ValidationRules } from "aurelia-validation";
import { FrcStatsContext, EventMatchEntity, qualitativeAnswers, DeepSpaceGamepiece, allDeepSpaceLocations } from "./persistence";

function isEmpty(z) {
  return z == null || z == "";
}

@autoinject
export class CustomValidationRules {
  constructor(private dbContext: FrcStatsContext) {
    ValidationRules.customRule(
      "isNumeric",
      (value: string, obj: any) => {
        if(value == null || value == "") {
          return true;
        }
        return /^\d*$/.test(value);
      }, "Your input needs to be a number."
    );

    ValidationRules.customRule(
      "teamExists",
      (teamNumber: string, obj: EventMatchEntity) => {
        return this.dbContext.eventTeams
          .where(["year", "eventCode", "teamNumber"])
          .equals([obj.year, obj.eventCode, teamNumber]).first()
          .then(teamEvent => {
            return teamEvent != null;
          });
      }, "team is not attending this event."
    );

    ValidationRules.customRule(
      "maximum",
      (input: string, obj: any, maxValue) => {
        let value = parseInt(input);
        if(isNaN(value)) {
          return true;
        }
        return value <= maxValue;
      }, `must be less than or equal to \${$config.maxValue}.`,
      (maxValue) => ({maxValue}),
    );

    ValidationRules.customRule(
      "minimum",
      (input: string, obj: any, minValue) => {
        let value = parseInt(input);
        if(isNaN(value)) {
          return true;
        }
        return value >= minValue;
      }, `must be greater than or equal to \${config.minValue}.`,
      (minValue) => ({minValue}),
    );

    ValidationRules.customRule(
      "attempted",
      (input: boolean, obj: any, attemptedProperty: string) => {
        let succeeded = input;
        let attempted = obj[attemptedProperty];
        if(succeeded && !attempted) {
          return false;
        }
        else {
          return true;
        }
      },
      `You can't succeed if you don't try!`
    );

    ValidationRules.customRule(
      "isQualitativeNumeric",
      (input: number, obj: any) => {
        return qualitativeAnswers.some(ans => ans.numeric == input);
      },
      `invalid qualitative value`
    );

    ValidationRules.customRule(
      "isDeepSpaceGamepiece",
      (input: string, obj: any) => {
        if (isEmpty(input)) {
          return true;
        }
        switch(input) {
          case "Cargo":
            return true;
            break;
          case "Hatch Panel":
            return true;
            break;
          default:
            return false;
            break;
        }
      },
      `not a game piece`
    );
    ValidationRules.customRule(
      "isDeepSpaceLocation",
      (input: string, obj: any) => {
        if (isEmpty(input)) {
          return true;
        }
        return allDeepSpaceLocations.some(loc => loc == input);
      },
      `not a game piece`
    );
  }
}

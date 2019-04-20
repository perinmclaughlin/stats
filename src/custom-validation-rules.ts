import { autoinject } from "aurelia-framework";
import { ValidationRules } from "aurelia-validation";
import { FrcStatsContext, EventMatchEntity, qualitativeAnswers, DeepSpaceGamepiece, allDeepSpaceLocations } from "./persistence";

export function isEmpty(z) {
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
        } /*else if(value == <any>Infinity || value == <any>-Infinity) {
          return true;
        }*/
        return /^-?\d*$/.test(value);
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
      }, `must be greater than or equal to \${$config.minValue}.`,
      (minValue) => ({minValue}),
    );

    ValidationRules.customRule(
      "isParadox", (end: number, obj: any, startPropName: string) => {
        let start = obj[startPropName];
        end = parseInt(<any>end);
        if((isNaN(start) || isNaN(end)) && isNaN(start) != isNaN(end)) {
          return false;
        } else if(isNaN(start) && isNaN(end)) {
          return true;
        }
        return start > end;
      },
      `you can't finish something BEFORE you start it!`,
      () => ({}),
    );

    ValidationRules.customRule(
      "didNotLiftAndGetLiftedBy", (input: string, obj: any, getLifted: (a: any) => string[]) => {
        let didLift = getLifted(obj);

        if(input == null || obj == null) {
          return true;
        }
        for(var i = 0; i < didLift.length; i++) {
          if(input == didLift[i]) {
            return false;
          }
        }
        return true;
      },
      `A team cannot lift someone that is lifting them.`,
      () => ({}),
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
        if(input == null) {
          return true;
        }
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

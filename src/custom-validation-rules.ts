import { autoinject } from "aurelia-framework";
import { ValidationRules } from "aurelia-validation";
import { FrcStatsContext, EventMatchEntity } from "./persistence";

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
  }
}

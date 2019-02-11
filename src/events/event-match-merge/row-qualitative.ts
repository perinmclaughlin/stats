import {autoinject, customElement, containerless, bindable} from "aurelia-framework";
import { EventMatchMergeState } from "../../model";
import { QualitativeNumeric, qualitativeAnswers } from "../../persistence";

@autoinject
@customElement("row-qualitative")
@containerless
export class EventMatchMergeRowQualitative {
    @bindable state: EventMatchMergeState;
    @bindable property: string;
    @bindable displayName: string;
    @bindable rules: any[];

    public qualitativeAnswers = qualitativeAnswers;

    private displayValue(numeric: QualitativeNumeric) {
        let answers = qualitativeAnswers.filter(x => x.numeric == numeric);
        if(answers.length == 0) {
          return "?!";
        }
        return answers[0].name;
    }

    public get localDisplayValue() {
        return this.displayValue(this.state.localSaved[this.property]);
    }

    public get fromFileDisplayValue() {
        return this.displayValue(this.state.fromFile[this.property]);
    }
}

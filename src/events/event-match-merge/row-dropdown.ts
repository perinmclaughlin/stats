import {autoinject, customElement, containerless, bindable} from "aurelia-framework";
import { QualitativeNumeric, qualitativeAnswers } from "../../persistence";
import { IMergeState } from "../../games";

@autoinject
@customElement("row-dropdown")
@containerless
export class EventMatchMergeRowDropdown {
    @bindable state: IMergeState;
    @bindable property: string;
    @bindable displayName: string;
    @bindable rules: any[];
    @bindable choices: any[];
}

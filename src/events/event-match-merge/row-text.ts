import {autoinject, customElement, containerless, bindable} from "aurelia-framework";
import { EventMatchMergeState } from "../../model";

@autoinject
@customElement("row-text")
@containerless
export class EventMatchMergeRowText {
    @bindable state: EventMatchMergeState;
    @bindable property: string;
    @bindable displayName: string;
    @bindable rules: any[];
}
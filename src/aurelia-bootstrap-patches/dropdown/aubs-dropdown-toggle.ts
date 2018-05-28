import {autoinject} from "aurelia-framework";
import {AubsDropdownCustomAttribute} from "./aubs-dropdown";

@autoinject
export class AubsDropdownToggleCustomAttribute {
  clickedListener: any;

    constructor(private dropdown: AubsDropdownCustomAttribute, private element: Element){
        this.clickedListener = () => this.dropdown.toggle();
    }

    attached() {
        this.element.addEventListener('click', this.clickedListener);
    }

    detached(){
        this.element.removeEventListener('click', this.clickedListener);
    }
}

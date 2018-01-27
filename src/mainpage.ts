import { autoinject } from "aurelia-framework";
import { MatchData } from "./model";

@autoinject
export class MainPage {
	public model: MatchData;
	constructor(){
		this.model = new MatchData();
	}
	
	public click()
	{
		console.info(this.model);
	}
}

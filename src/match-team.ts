import { autoinject } from "aurelia-framework";
import { MatchData } from "./model";

@autoinject
export class MainPage {
	public model: MatchData;
	constructor(){
		this.model = new MatchData();
		this.model.year = "2018";
		this.model.eventCode = "wayak";
	}
	
	public click()
	{
		console.info(this.model);
	}
}

import { autoinject } from "aurelia-framework";
import { Router, RouterConfiguration } from "aurelia-router";
import { PLATFORM } from "aurelia-pal";

@autoinject
export class App {
  message = 'Hello World!';

  constructor(public router: Router) {
  }


  public activate() {
    return this.router.configure(this.configureRoutes);
  }

  public configureRoutes(config: RouterConfiguration): RouterConfiguration {
    config.map([
        {
            route: ["event/:eventCode/team/:teamNumber/match/:matchNumber"], name: "match-team", moduleId: PLATFORM.moduleName("match-team"), 
            nav: false, title: "Big Honking Page", adminRoute: false,
        },
		{
			route: [""], name: "event-teams", moduleId: PLATFORM.moduleName("event-teams"), 
            nav: false, title: "Smaller Honking Page", adminRoute: false,
		},
		{
			route: ["event/:eventCode/team/:teamNumber"], name: "event-team", moduleId: PLATFORM.moduleName("event-team"), 
            nav: false, title: "Smaller Honking Page", adminRoute: false,
		},
    ]);

    return config;
  }

}

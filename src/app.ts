import { autoinject } from "aurelia-framework";
import { Router, RouterConfiguration } from "aurelia-router";
import { PLATFORM } from "aurelia-pal";
import { CustomValidationRules } from "./custom-validation-rules";
import environment from './environment';

@autoinject
export class App {
  version = environment.version;

  constructor(public router: Router, customValidationRules: CustomValidationRules) {
  }


  public activate() {
    return this.router.configure(this.configureRoutes);
  }

  public configureRoutes(config: RouterConfiguration): RouterConfiguration {
    config.map([
      {
        route: ["year/:year/event/:eventCode/team/:teamNumber/match/:matchNumber"], 
        name: "match-team", moduleId: PLATFORM.moduleName("match-team"), 
        nav: false, title: "Big Honking Page", adminRoute: false,
      },
      {
        route: ["events", ""], 
        name: "events", moduleId: PLATFORM.moduleName("events/teh-events"), 
        nav: false, title: "Smaller Honking Page", adminRoute: false,
      },
      {
        route: ["year/:year/event/:eventCode"], 
        name: "event", moduleId: PLATFORM.moduleName("teh-event"), 
        nav: false, title: "Smaller Honking Page", adminRoute: false,
      },
      {
        route: ["year/:year/event/:eventCode/team/:teamNumber"],
        name: "event-team", moduleId: PLATFORM.moduleName("event-team/event-team"), 
        nav: false, title: "Smaller Honking Page", adminRoute: false,
      },
      {
        route: ["district-rankings"],
        name: "district-rankings", moduleId: PLATFORM.moduleName("district-rankings"), 
        nav: true, title: "District Rankings", adminRoute: false,
      },
    ]);

    return config;
  }

}

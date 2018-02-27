
import { autoinject } from "aurelia-framework"
import { RouterConfiguration, Router } from "aurelia-router";
import { PLATFORM } from "aurelia-pal";

@autoinject
export class EventView {

  constructor(
  ){
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      {
        route: ["teams"], 
        name: "event-teams",
        moduleId: PLATFORM.moduleName("event-team/event-teams"),
        title: "event teams",
      },
      {
        route: ["", "matches"],
        name: "event-matches",
        moduleId: PLATFORM.moduleName("event-matches/event-matches"),
        title: "event matches",
      }]);
  }
   
}

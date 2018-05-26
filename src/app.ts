import { autoinject } from "aurelia-framework";
import { Router, RouterConfiguration } from "aurelia-router";
import { PLATFORM } from "aurelia-pal";
import { CustomValidationRules } from "./custom-validation-rules";
import environment from './environment';

@autoinject
export class App {
  version = environment.version;
  persisted: boolean;

  constructor(public router: Router, customValidationRules: CustomValidationRules) {
    this.persisted = false;
  }


  public activate() {
    return Promise.all([
      this.router.configure(this.configureRoutes),
      this.persist(),
      this.getPersisted(),
    ]);
  }

  private persist(): Promise<any> {
    if((<any>navigator).storage && (<any>navigator).storage.persist) {
      return (<any>navigator).storage.persist();
    }
    return Promise.resolve("yup");
  }

  private getPersisted(): Promise<any> {
    let promise = Promise.resolve(false);
    if((<any>navigator).storage && (<any>navigator).storage.persisted) {
      promise = (<any>navigator).storage.persisted();
    }

    return promise.then(result => {
      this.persisted = result;
    })
  }

  public configureRoutes(config: RouterConfiguration): RouterConfiguration {
    config.map([
      {
        route: ["year/:year/event/:eventCode/team/:teamNumber/match/:matchNumber"], 
        name: "match-team", moduleId: PLATFORM.moduleName("match-team"), 
        nav: false, title: "match-team", adminRoute: false,
      },
      {
        route: ["events", ""], 
        name: "events", moduleId: PLATFORM.moduleName("events/teh-events"), 
        nav: false, title: "events", adminRoute: false,
      },
      {
        route: ["year/:year/event/:eventCode"], 
        name: "event", moduleId: PLATFORM.moduleName("teh-event"), 
        nav: false, title: "event", adminRoute: false,
      },
      {
        route: ["year/:year/event/:eventCode/team/:teamNumber"],
        name: "event-team", moduleId: PLATFORM.moduleName("event-team/event-team"), 
        nav: false, title: "event-team", adminRoute: false,
      },
      {
        route: ["district-rankings"],
        name: "district-rankings", moduleId: PLATFORM.moduleName("district-rankings"), 
        nav: true, title: "District Rankings", adminRoute: false,
      },
      {
        route: ["test"],
        name: "match-team-alt", moduleId: PLATFORM.moduleName("match-team-alt"), 
        nav: true, title: "2018 Match Team", adminRoute: false,
      },
      {
        route: ["graphtest"],
        name: "graphtest", moduleId: PLATFORM.moduleName("graphtest"), 
        nav: true, title: "graph test", adminRoute: false,
      },
    ]);

    return config;
  }

}

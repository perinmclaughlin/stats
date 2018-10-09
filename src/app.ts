import { autoinject } from "aurelia-framework";
import { Router, RouterConfiguration } from "aurelia-router";
import { PLATFORM } from "aurelia-pal";
import { CustomValidationRules } from "./custom-validation-rules";
import environment from './environment';
import { gameManager } from "./games/index";

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
    let setInstruction = (instruction, moduleGetter) => {
      let game = gameManager.getGame(instruction.params.year);
      instruction.config.href = instruction.fragment;
      if(game == null) {
        instruction.config.moduleId = PLATFORM.moduleName("errors/404");
      }else{
        instruction.config.moduleId = moduleGetter(game);
      }
    };

    let navToGameMatchInput = (instruction) => {
      setInstruction(instruction, game => game.matchInputModule);
    };

    let navToGameEventTeams = (instruction) => {
      setInstruction(instruction, game => game.eventTeamsModule);
    };

    let navToGameEventTeam = (instruction) => {
      setInstruction(instruction, game => game.eventTeamModule);
    };
    
    let routes = [
      {
        route: ["year/:year/event/:eventCode/team/:teamNumber/match/:matchNumber"], 
        name: "match-team", 
        nav: false, title: "match-team", adminRoute: false,
        navigationStrategy: navToGameMatchInput
      },
      {
        route: ["events", ""], 
        name: "events", moduleId: PLATFORM.moduleName("events/teh-events"), 
        nav: false, title: "events", adminRoute: false,
      },
      {
        route: ["year/:year/event/:eventCode/matches"], 
        name: "event-matches", moduleId: PLATFORM.moduleName("event-matches/event-matches"), 
        nav: false, title: "event", adminRoute: false,
      },
      {
        route: ["year/:year/event/:eventCode/teams"], 
        name: "event-teams", 
        nav: false, title: "event", adminRoute: false,
        navigationStrategy: navToGameEventTeams
      },
      {
        route: ["year/:year/event/:eventCode/team/:teamNumber"],
        name: "event-team", 
        nav: false, title: "event-team", adminRoute: false,
        navigationStrategy: navToGameEventTeam,
      },
      {
        route: ["district-rankings"],
        name: "district-rankings", moduleId: PLATFORM.moduleName("district-rankings"), 
        nav: true, title: "District Rankings", adminRoute: false,
      },
      {
        route: ["graphtest"],
        name: "graphtest", moduleId: PLATFORM.moduleName("graphtest"), 
        nav: true, title: "graph test", adminRoute: false,
      },
      {
        route: ["qrtest"],
        name: "qrtest", moduleId: PLATFORM.moduleName("qrcodes/test"), 
        nav: true, title: "qrcode test", adminRoute: false,
      },
    ];

    config.map(routes);

    config.mapUnknownRoutes((instruction) => PLATFORM.moduleName("errors/404"));

    return config;
  }

}

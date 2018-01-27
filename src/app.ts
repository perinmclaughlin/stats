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
            route: [""], name: "mainpage", moduleId: PLATFORM.moduleName("mainpage"), 
            nav: false, title: "Big Honking Page", adminRoute: false,
        },
        {
            route: ["page1"], name: "page1", moduleId: PLATFORM.moduleName("page1"), 
            nav: false, title: "Smaller Honking Page", adminRoute: false,
        },
    ]);

    return config;
  }

}

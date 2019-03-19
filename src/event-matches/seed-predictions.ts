import { autoinject } from "aurelia-framework";
import * as naturalSort from "javascript-natural-sort";
import { FrcStatsContext, EventEntity, EventMatchEntity, EventMatchSlots, WinPrediction } from "../persistence";
import { gameManager } from "../games/index";
import { ValidationControllerFactory, ValidationController, ValidationRules } from "aurelia-validation";
import { BootstrapRenderer } from "../utilities/bootstrap-renderer";
import * as XLSX from 'xlsx';
import { isEmpty } from "../custom-validation-rules";

@autoinject
export class SeedPredictionsPage {
  gameName: string;
  event: EventEntity;
  eventMatches: EventMatchEntity[];
  seedRecords: TeamSeedRecord[];
  public validationController: ValidationController;
  public rules: any[];
  private renderer: BootstrapRenderer;
  public teamsLength: number;

  winOptions : WinPrediction[] = ["Red", "Blue", "Tie"];
  rpOptions = [1, 2];

  constructor(
    validationControllerFactory: ValidationControllerFactory,
    private dbContext: FrcStatsContext
  ) {

    this.validationController = validationControllerFactory.createForCurrentScope();
    this.seedRecords = [];

  }

  public async activate(params) {
    let game = gameManager.getGame(params.year);
    this.gameName = game.name;
	  this.event = await this.dbContext.getEvent(params.year, params.eventCode);
    this.eventMatches = await this.dbContext.getEventMatches(this.event.year, this.event.eventCode);
    this.eventMatches.sort((a,b) => naturalSort(a.matchNumber, b.matchNumber));

    this.setupValidation();
    this.calculateSeed();
  }

  private setupValidation() {
    this.rules = ValidationRules
      .ensure((m: EventMatchEntity) => m.winPrediction)
      .required()
      .rules;

    this.renderer = new BootstrapRenderer({ showMessages: true });
    this.validationController.addRenderer(this.renderer);

  }

  save() {
    this.dbContext.eventMatches.bulkPut(this.eventMatches);
  }

  public calculateSeed() {
    let teams = new Map<string, TeamSeedRecord>();
    for(var eventMatch of this.eventMatches) {
      for(var slot of EventMatchSlots) {
        let teamNumber = eventMatch[slot.prop];
        if (!teams.has(teamNumber)) {
          teams.set(teamNumber, {
            teamNumber: teamNumber,
            seed: 0,
            RP: 0,
          });
        }
        let team = teams.get(teamNumber);
        let isBlue = slot.prop.startsWith("blue");
        let isRed = slot.prop.startsWith("red");

        if(
          (eventMatch.winPrediction == "Blue" && isBlue) || 
          (eventMatch.winPrediction == "Red" && isRed)
        ) {
          team.RP += 2;
        }else if(eventMatch.winPrediction == "Tie" ) {
          team.RP += 1;
        }

        if(!isEmpty(eventMatch.redRP) && isRed) {
          team.RP += parseInt(<any>eventMatch.redRP);
        }

        if(!isEmpty(eventMatch.blueRP) && isBlue) {
          team.RP += parseInt(<any>eventMatch.blueRP);
        }
      }
    }
    this.teamsLength = teams.size;

    this.seedRecords = Array.from(teams.values());
    this.seedRecords.sort((a, b) => b.RP - a.RP);
    let i = 1;
    for(var rec of this.seedRecords) {
      rec.seed = i;
      i++;
    }
  }

  public exportPredictions() {
    let finalFileName = `${this.event.year}-${this.event.eventCode}-predictions.xlsx`;

    let data = [];
    data.push(["Seed", "Team", "RP"]);
    for(var item of this.seedRecords) {
      data.push([item.seed, item.teamNumber, item.RP]);
    }

    let file = XLSX.utils.book_new();
    let sheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(file, sheet, finalFileName);
    XLSX.writeFile(file, finalFileName);

  }
}


interface TeamSeedRecord {
  teamNumber: string;
  seed: number;
  RP: number;
}


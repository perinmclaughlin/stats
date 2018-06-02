import { autoinject } from "aurelia-framework";
import { DialogController, DialogService } from "aurelia-dialog";
import { BindingEngine, Disposable } from "aurelia-binding";
import * as naturalSort from "javascript-natural-sort";
import { FrcStatsContext, EventMatchEntity, EventEntity } from "../persistence";
import { EventMatchMergeState } from "../model";
import { EventMatchMergeDialog } from "./event-match-merge/dialog";
import { gameManager, IMergeState } from "../games/index"

@autoinject
export class JsonImportDialog {
  rawFiles: FileList;
  fileName: string;
  observers: Disposable[];
  json: any;
  yesMerging = false;
  yesExisting = false;
  noExisting = false;
  eventFromDb: EventEntity;
  showAllMatches = false;
  showAllMatchRecords = false;
  done = false;
  mergeErrored = false;
  doneMessage: string;
  fromDbEventMatches: EventMatchEntity[];
  eventMatchesMerge: EventMatchMergeState[];
  matchesMerge: IMergeState[];
  selectFile = true;

  constructor(
    private controller: DialogController,
    private dialogService: DialogService,
    private dbContext: FrcStatsContext,
    private bindingEngine: BindingEngine
  ) {
  }

  activate(options) {
    this.setupObservers();

    if(options != null) {
      if('selectFile' in options) {
        this.selectFile = options.selectFile;
      }else{
        this.selectFile = true;
      }
      if('json' in options) {
        this.json = options.json;
        this.postReadJsonFixups();
      }
    }
  }

  deactivate() {
    this.teardownObservers();
  }

  private setupObservers() {
    this.observers = [];

    this.observers.push(
      this.bindingEngine.propertyObserver(this, 'rawFiles').subscribe(() => {
        this.fileChosen();
      }));
  }

  private teardownObservers() {
    for(var observer of this.observers) {
      observer.dispose();
    }
    this.observers = [];
  }

  private fileChosen() {
    if(this.rawFiles == null || this.rawFiles.length == 0) {
      return;
    }
    this.fileName = (this.rawFiles[0].name);
    let readPromise = new Promise((resolve, reject) => {
      try{ 
        let reader = new FileReader();
        reader.onload = function() {
          resolve(JSON.parse(this.result));
        };
        reader.onerror = function(evnt) {
          reject(evnt);
        };
        reader.readAsText(this.rawFiles[0]);
      }catch(error) {
        reject(error);
      }
    });

    readPromise.then((json: any) => {
      this.json = json;

      this.postReadJsonFixups();
    });
  }

  private postReadJsonFixups() {
      this.clearIds();

      this.dbContext.events.where(["year", "eventCode"]).equals([this.json.event.year, this.json.event.eventCode]).first().then(localEvent => {
        if(localEvent == null) {
          this.yesExisting = false;
          this.noExisting = true;
        }else{
          this.yesExisting = true;
          this.noExisting = false;
          this.eventFromDb = localEvent;
        }
      });
  }

  private clearIds() {
    delete this.json.event.id;
    this.json.teams.forEach(team => delete team.id);
    this.json.eventMatches.forEach(x => delete x.id);
    this.json.eventTeams.forEach(x => delete x.id);

    let game = gameManager.getGame(this.json.event.year);
    game.clearIds(this.json);
  }

  beginMerge() {
    this.yesMerging = true;
    this.noExisting = false;
    this.yesExisting = false;

    let year = this.json.event.year;
    let eventCode = this.json.event.eventCode;

    this.eventMatchesMerge = [];
    let eventMatchMergeDict = {}
    this.matchesMerge = [];
    this.dbContext.eventMatches
      .where(["year", "eventCode"])
      .equals([year, eventCode]).toArray()
    .then(localEventMatches => {
      this.fromDbEventMatches = localEventMatches;
    }).then(() => {
      this.fromDbEventMatches.forEach(eventMatch => {
        let state = EventMatchMergeState.makeFromDb(eventMatch);
        eventMatchMergeDict[eventMatch.matchNumber] = state;
      });

      this.json.eventMatches.forEach(eventMatch => {
        if(eventMatch.matchNumber in eventMatchMergeDict) {
          let state = eventMatchMergeDict[eventMatch.matchNumber];
          state.fromFile = eventMatch;
        }else {
          let state = EventMatchMergeState.makeFromFile(eventMatch);
          eventMatchMergeDict[eventMatch.matchNumber] = state;
        }
      });

      for(var matchNumber in eventMatchMergeDict) {
        let state = eventMatchMergeDict[matchNumber]
        state.setSameness();
        this.eventMatchesMerge.push(state);
      }

      this.eventMatchesMerge.sort((a,b) => naturalSort(a.matchNumber, b.matchNumber));
    }).then(() => {
      let game = gameManager.getGame(this.json.event.year);
      game.beginMerge(this.json).then(m => {
        this.matchesMerge = m;
      });
    });

  }

  importSimple() {
    this.done = false;
    this.importSimpleTransaction().then(() => {
      this.doneMessage = "Success!";
      this.done = true;
    }).catch(() => {
      this.doneMessage = "Failed!";
      this.done = false;
    });
  }

  private importSimpleTransaction() {
    let game = gameManager.getGame(this.json.event.year);
    let tables = [
      this.dbContext.events,
      this.dbContext.teams,
      this.dbContext.eventTeams,
      this.dbContext.eventMatches,
    ];
    tables.push.apply(tables, game.getTables());

    return this.dbContext.transaction("rw", tables, () => {

      let eventPromise = this.saveEvent();
      let teamsPromises = this.saveTeams();
      let eventTeamsPromise = this.dbContext.eventTeams.bulkPut(this.json.eventTeams);
      let eventMatchesPromise = this.dbContext.eventMatches.bulkPut(this.json.eventMatches);
      let gameSpecificPromise = game.importSimple(this.json);

      return Promise.all([
        eventPromise,
        teamsPromises,
        eventTeamsPromise,
        eventMatchesPromise,
        gameSpecificPromise,
      ]);
    });
  }

  private saveEvent() {
    return this.dbContext.events.put(this.json.event);
  }

  private saveTeams() {
    return Promise.all(this.json.teams.map(team => {
      return this.dbContext.teams.where("teamNumber").equals(team.teamNumber).first().then(localTeam => {
        if(localTeam == null) {
          return this.dbContext.teams.put(team);
        }
      });
    }));
  }

  replaceEvent() {
    this.done = false;
    this.clearIds();
    let game = gameManager.getGame(this.json.event.year);
    let tables = [
      this.dbContext.events,
      this.dbContext.teams,
      this.dbContext.eventTeams,
      this.dbContext.eventMatches,
    ];

    tables.push.apply(tables, game.getTables());

    return this.dbContext.transaction("rw", tables, () => {
      let year = this.json.event.year;
      let eventCode = this.json.event.eventCode;

      let deleteEventPromise = this.dbContext.events
        .where(["year", "eventCode"])
        .equals([year, eventCode]).first()
        .then(localEvent => {
          return this.dbContext.events.delete(localEvent.id);
        });
      let deleteEventTeamsPromise = this.dbContext.eventTeams
        .where(["year", "eventCode"])
        .equals([year, eventCode]).toArray()
        .then(localEventTeams => {
          return this.dbContext.eventTeams.bulkDelete(localEventTeams.map(x => x.id));
        });
      let deleteEventMatchesPromise = this.dbContext.eventMatches
        .where(["year", "eventCode"])
        .equals([year, eventCode]).toArray()
        .then(localEventTeams => {
          return this.dbContext.eventMatches.bulkDelete(localEventTeams.map(x => x.id));
        });
      let gameSpecificDeletePromise = game.deleteEvent(this.json);

      return Promise.all([
        deleteEventPromise, 
        deleteEventTeamsPromise, 
        deleteEventMatchesPromise,
        gameSpecificDeletePromise,
      ]).then(() => {
        return this.importSimpleTransaction();
      }).catch(ex => {
        console.info("caboom!", ex);
        throw ex;
      });
    }).then(() => {
      this.doneMessage = "Success!";
      this.done = true;
    }).catch(() => {
      this.doneMessage = "Failed!";
      this.done = false;
    });
  }

  public merge(state: IMergeState) {
    let game = gameManager.getGame(this.json.event.year);
    this.dialogService.open({
      model: {
        state: state,
      },
      viewModel: game.mergeDialogClass(),
    });
  }

  public completeMerge() {
    let game = gameManager.getGame(this.json.event.year);
    let noop = Promise.resolve("yup");
    this.mergeErrored = false;
    let tables = [
      this.dbContext.events,
      this.dbContext.teams,
      this.dbContext.eventTeams,
      this.dbContext.eventMatches,
    ];
    tables.push.apply(tables, game.getTables());

    return this.dbContext.transaction("rw", tables, () => {
      let saveEventPromise = noop;
      if(this.noExisting) {
        saveEventPromise = this.saveEvent()
          .then(() => noop);
      }

      let year = this.json.event.year;
      let eventCode = this.json.event.eventCode;
      let saveTeamsPromise = this.saveTeams();
      let saveEventTeamsPromise = Promise.all(
        this.json.teams.map(team => {
          return this.dbContext.eventTeams
            .where(["year", "eventCode", "teamNumber"])
            .equals([year, eventCode, team.teamNumber]).first()
            .then(localTeam => {
              if(localTeam == null) {
                return this.dbContext.eventTeams.put({
                  year: year,
                  eventCode: eventCode,
                  teamNumber: team.teamNumber,
                });
              }
            });
        }));

      let saveEventMatchesPromise = Promise.all(
        this.eventMatchesMerge.map(state => {
          if(state.same) {
            // no need to do anything
            return noop;
          }else if (state.takeFromFile) {
            return this.dbContext.eventMatches.put(state.fromFile)
              .then(() => noop);
          }else if(!state.takeLocal && !state.takeFromFile && state.localSaved != null && state.fromFile == null) {
            return this.dbContext.eventMatches.delete(state.localSaved.id)
              .then(() => noop);
          }else if(state.merged != null) {
            state.merged.id = state.localSaved.id;
            return this.dbContext.eventMatches.put(state.merged)
              .then(() => noop);
          }else{ 
            throw new Error("crumb! we missed a case!")
          }
        }));

      let saveEventMatchRecordsPromise = game.completeMerge(this.matchesMerge);

      return Promise.all([
        saveEventPromise,
        saveTeamsPromise,
        saveEventTeamsPromise,
        saveEventMatchesPromise,
        saveEventMatchRecordsPromise,
      ]);
    }).then(() => {
      this.done = true;
      this.doneMessage = "Success!";
    }).catch(errorResponse => {
      console.info("merge error", errorResponse);
      this.mergeErrored = true;
      this.done = false;
    });
  }

  mergeEventTeams(state: EventMatchMergeState) {

    this.dialogService.open({
      model: {
        state: state,
      },
      viewModel: EventMatchMergeDialog,
    });

  }
}

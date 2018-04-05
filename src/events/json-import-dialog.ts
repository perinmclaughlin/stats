import { autoinject } from "aurelia-framework";
import { DialogController, DialogService } from "aurelia-dialog";
import { BindingEngine, Disposable } from "aurelia-binding";
import * as naturalSort from "javascript-natural-sort";
import { FrcStatsContext, EventMatchEntity, TeamMatch2018Entity, EventEntity } from "../persistence";
import { EventMatchMergeState, Match2018MergeState } from "../model";
import { Match2018MergeDialog } from "./match2018-merge/dialog";
import { EventMatchMergeDialog } from "./event-match-merge/dialog";

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
  fromDbMatches2018: TeamMatch2018Entity[];
  eventMatchesMerge: EventMatchMergeState[];
  matches2018Merge: Match2018MergeState[];

  constructor(
    private controller: DialogController,
    private dialogService: DialogService,
    private dbContext: FrcStatsContext,
    private bindingEngine: BindingEngine
  ) {
  }

  activate() {
    this.setupObservers();
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

      this.clearIds();

      this.dbContext.events.where(["year", "eventCode"]).equals([json.event.year, json.event.eventCode]).first().then(localEvent => {
        if(localEvent == null) {
          this.yesExisting = false;
          this.noExisting = true;
        }else{
          this.yesExisting = true;
          this.noExisting = false;
          this.eventFromDb = localEvent;
        }
      });

    });
  }

  private clearIds() {
    delete this.json.event.id;
    this.json.teams.forEach(team => delete team.id);
    this.json.eventMatches.forEach(x => delete x.id);
    this.json.eventTeams.forEach(x => delete x.id);
    this.json.matches2018.forEach(x => delete x.id);
  }

  beginMerge() {
    this.yesMerging = true;
    this.noExisting = false;
    this.yesExisting = false;

    let year = this.json.event.year;
    let eventCode = this.json.event.eventCode;

    this.eventMatchesMerge = [];
    let eventMatchMergeDict = {}
    this.matches2018Merge = [];
    this.dbContext.eventMatches
      .where(["year", "eventCode"])
      .equals([year, eventCode]).toArray()
    .then(localEventMatches => {
      this.fromDbEventMatches = localEventMatches;
      if(year == "2018") {
        return this.dbContext.teamMatches2018
          .where("eventCode")
          .equals(eventCode).toArray()
          .then(matches2018 => {
            this.fromDbMatches2018 = matches2018;
          });
      }
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
      if(year == "2018") {
        this.fromDbMatches2018.forEach(match2018 => {
          let state = Match2018MergeState.makeFromDb(match2018);
          state.localSaved = match2018;
          this.matches2018Merge.push(state);
        });

        this.json.matches2018.forEach(match2018 => {
          let states = this.matches2018Merge.filter(a => a.matchNumber == match2018.matchNumber && a.teamNumber == match2018.teamNumber);
          if(states.length != 0) {
            let state = states[0];
            state.fromFile = match2018;
          }else{
            let state = Match2018MergeState.makeFromFile(match2018);
            this.matches2018Merge.push(state);
          }
        });

        for(var state of this.matches2018Merge) {
          state.setSameness();
        }

        this.matches2018Merge.sort((a,b) => naturalSort(a.matchNumber, b.matchNumber));
      }
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
    return this.dbContext.transaction("rw", [
      this.dbContext.events,
      this.dbContext.teams,
      this.dbContext.eventTeams,
      this.dbContext.eventMatches,
      this.dbContext.teamMatches2018,
    ], () => {

      let eventPromise = this.saveEvent();
      let teamsPromises = this.saveTeams();
      let eventTeamsPromise = this.dbContext.eventTeams.bulkPut(this.json.eventTeams);
      let eventMatchesPromise = this.dbContext.eventMatches.bulkPut(this.json.eventMatches);
      let matches2018Promise = this.dbContext.teamMatches2018.bulkPut(this.json.matches2018);


      return Promise.all([
        eventPromise,
        teamsPromises,
        eventTeamsPromise,
        eventMatchesPromise,
        matches2018Promise,
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
    return this.dbContext.transaction("rw", [
      this.dbContext.events,
      this.dbContext.teams,
      this.dbContext.eventTeams,
      this.dbContext.eventMatches,
      this.dbContext.teamMatches2018,
    ], () => {
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
      let deleteMatches2018Promise = Promise.resolve("yup");
      if(year == "2018") {
        deleteMatches2018Promise = this.dbContext.teamMatches2018
          .where("eventCode")
          .equals(eventCode).toArray()
          .then(localMatches => {
            return this.dbContext.teamMatches2018.bulkDelete(localMatches.map(x => x.id));
          }).then(() => "yup");
      }

      return Promise.all([
        deleteEventPromise, 
        deleteEventTeamsPromise, 
        deleteEventMatchesPromise,
        deleteMatches2018Promise,
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

  public merge(state: Match2018MergeState) {
    this.dialogService.open({
      model: {
        state: state,
      },
      viewModel: Match2018MergeDialog,
    });
  }

  public completeMerge() {
    let noop = Promise.resolve("yup");
    this.mergeErrored = false;
    return this.dbContext.transaction("rw", [
      this.dbContext.events,
      this.dbContext.teams,
      this.dbContext.eventTeams,
      this.dbContext.eventMatches,
      this.dbContext.teamMatches2018,
    ], () => {
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

      let saveEventMatchRecordsPromise = noop;

      if(year == 2018) {
        saveEventMatchRecordsPromise = Promise.all(
          this.matches2018Merge.map(state => {
            if(!state.resolved) {
              console.error("item not resolved", state);
              throw new Error("item not resolved");
            }
            if(state.same || state.takeLocal) {
              return noop;
            }else if(state.takeFromFile) {
              // add record from file
              return this.dbContext.teamMatches2018.put(state.fromFile)
                .then(() => noop); //shaddap typescript
            }else if(!state.takeLocal && !state.takeFromFile && state.localSaved != null && state.fromFile == null) {
              // delete record from db
              return this.dbContext.teamMatches2018.delete(state.localSaved.id).then(() => noop);
            }else if(state.merged != null) {
              state.merged.id = state.localSaved.id;
              return this.dbContext.teamMatches2018.put(state.merged).then(() => noop);
            }else {
              throw new Error("crumb! we missed a case!");
            }
          })).then(() => noop); // shaddap typescript
      }

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

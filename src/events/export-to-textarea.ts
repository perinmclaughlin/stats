import { autoinject } from "aurelia-framework";
import { DialogController, DialogService } from "aurelia-dialog";
import { BindingEngine, Disposable } from "aurelia-binding";
import * as naturalSort from "javascript-natural-sort";
import { FrcStatsContext, EventMatchEntity, TeamMatch2018Entity, EventEntity } from "../persistence";
import { EventMatchMergeState, Match2018MergeState } from "../model";
import { Match2018MergeDialog } from "./match2018-merge/dialog";
import { EventMatchMergeDialog } from "./event-match-merge/dialog";

@autoinject
export class TextAreaExportDialog {
  json: string;
  observers: Disposable[];
  done = false;
  doneMessage: string;
  textarea: HTMLTextAreaElement;

  constructor(
    private controller: DialogController,
    private dialogService: DialogService,
    private dbContext: FrcStatsContext,
    private bindingEngine: BindingEngine
  ) {
  }

  activate(model) {
    this.json = JSON.stringify(model.json);
    this.setupObservers();
  }

  deactivate() {
    this.teardownObservers();
  }

  private setupObservers() {
    this.observers = [];
  }

  private teardownObservers() {
    for(var observer of this.observers) {
      observer.dispose();
    }
    this.observers = [];
  }

  click() {
    this.textarea.select();
  }

}

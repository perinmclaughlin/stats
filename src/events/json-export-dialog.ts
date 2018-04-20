import { autoinject } from "aurelia-framework";
import { DialogController, DialogService } from "aurelia-dialog";
import { BindingEngine, Disposable } from "aurelia-binding";
import * as naturalSort from "javascript-natural-sort";
import { FrcStatsContext, EventMatchEntity, TeamMatch2018Entity, EventEntity } from "../persistence";
import { EventMatchMergeState, Match2018MergeState } from "../model";
import { Match2018MergeDialog } from "./match2018-merge/dialog";
import { EventMatchMergeDialog } from "./event-match-merge/dialog";
import { JsonExporter } from "./event-to-json";
import { TextAreaExportDialog } from "./export-to-textarea";

@autoinject
export class JsonExportDialog {
  event: EventEntity;
  observers: Disposable[];
  done = false;
  doneMessage: string;
  textarea: HTMLTextAreaElement;

  constructor(
    private controller: DialogController,
    private dialogService: DialogService,
    private jsonExporter: JsonExporter,
    private dbContext: FrcStatsContext,
    private bindingEngine: BindingEngine
  ) {
  }

  activate(model) {
    this.event = model.event;
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

  exportTextarea() {
    this.jsonExporter.eventToJson(this.event).then(json => {
      this.dialogService.open({
        model: {
          json: json,
        },
        viewModel: TextAreaExportDialog
      })
    });
  }

  exportRawFile() {
    this.jsonExporter.eventToJson(this.event).then(json => {
      this.downloadJson(this.event, json);
    });
    
  }

  private downloadJson(event, json) {
    let name = `${event.year}-${event.eventCode}.json`
    let file = new Blob([JSON.stringify(json)], {type: "application/json"});
    let a = document.createElement("a");
    let url = URL.createObjectURL(file);
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }
}

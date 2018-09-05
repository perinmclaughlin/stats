import { autoinject } from "aurelia-framework";
import { DialogController, DialogService } from "aurelia-dialog";
import { BindingEngine, Disposable } from "aurelia-binding";
import * as naturalSort from "javascript-natural-sort";
import { debounce } from "lodash";
import { PickerResultDoc } from "gapi_module";
import { FrcStatsContext, EventMatchEntity, TeamMatch2018Entity, EventEntity } from "../persistence";
import { GoogleDriveApi, FileExistsOutput } from "../google-apis";
import { gameManager } from "../games/index";

// todo: set up validator, prevent double quotes in file names
@autoinject
export class JsonExportDialog {
  event: EventEntity;
  observers: Disposable[];
  done = false;
  doneMessage: string;
  textarea: HTMLTextAreaElement;
  fileName: string;
  driveFolder: PickerResultDoc;
  showUploadToDrive = false;
  waitingAllowUploadToDrive = false;
  waitingOnUpload = false;
  driveFileExists: FileExistsOutput;
  hasErrors = false;
  errorMessage: string;

  constructor(
    private controller: DialogController,
    private dialogService: DialogService,
    private gdriveApi: GoogleDriveApi,
    private dbContext: FrcStatsContext,
    private bindingEngine: BindingEngine
  ) {
  }

  activate(model) {
    this.event = model.event;
    this.setupObservers();
    this.fileName = `${this.event.year}-${this.event.eventCode}.json`;
  }

  deactivate() {
    this.teardownObservers();
  }

  private setupObservers() {
    this.observers = [];

    let fileNameObserver = this.bindingEngine.propertyObserver(this, "fileName").subscribe(debounce(() => {
      if(this.showUploadToDrive) {
        this.driveCheckUploadFolder();
      }
    }, 800));

    this.observers.push(fileNameObserver);
  }

  private teardownObservers() {
    for(var observer of this.observers) {
      observer.dispose();
    }
    this.observers = [];
  }

  selectGoogleDrive() {
    this.gdriveApi.openFolderSelector("Select folder in which to save file").then(result => {
      if(result.action == "picked") {
        this.driveFolder = result.docs[0]
        this.showUploadToDrive = true;
        this.driveCheckUploadFolder();
      }
    });
  }

  driveCheckUploadFolder() {
    this.waitingAllowUploadToDrive = true;
    let dto = {folderId: this.driveFolder.id, fileName: this.fileName, description: null, content: null};
    this.gdriveApi.fileExists(dto).then(result => {
      this.driveFileExists = result;
      this.waitingAllowUploadToDrive = false;
    });
  }

  exportGoogleDrive() {
    if(this.driveFileExists == null) {
      return;
    }
    if(this.driveFileExists.manyExist) {
      return;
    }

    let game = gameManager.getGame(this.event.year);

    game.exportEventJson(this.event).then(json => {
      let fileId = this.driveFileExists.exists? this.driveFileExists.fileId : null
      this.hasErrors = false;
      this.waitingOnUpload = true;
      this.gdriveApi.uploadFile({
        fileName: this.fileName,
        description: `${this.event.year} data for ${this.event.name}`,
        content: JSON.stringify(json),
        folderId: this.driveFolder.id,
        fileId: fileId,
      }).then(results => {
        this.waitingOnUpload = false;
        if(results.status != 200) {
          this.hasErrors = true;
          results.json().then(json => {
            this.errorMessage = json.error.message;
          });
        }else{
          this.doneMessage = "Success!";
          this.done = true;
        }
      }, () => {
        this.waitingOnUpload = false;
        this.hasErrors = true;
      });
    }, () => {
      this.hasErrors = true;
    });
  }

  exportRawFile() {
    let game = gameManager.getGame(this.event.year);

    game.exportEventJson(this.event).then(json => {
      this.downloadJson(this.event, json);
    });
    
  }

  private downloadJson(event, json) {
    let name = this.fileName;
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

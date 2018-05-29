import { autoinject } from "aurelia-framework";
import { PickerResult, GetFileContentResult } from "gapi_module";

@autoinject
export class GoogleDriveApi {
  developerKey = 'AIzaSyCPC9f-IBGr9L5MOAIm01UcgklHhXT3LSI';
  clientId = '587604503649-9l4eh384hpt14hnfhel1d9t7ihae9ana.apps.googleusercontent.com';
  readScope = 'https://www.googleapis.com/auth/drive.readonly';
  driveDoc = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
  private loadPromise: Promise<any>;
  private accessToken: any;
  private monkeyPatchDone = false;

  constructor() {
  }

  public openJsonSelector(): Promise<PickerResult> {
    this.trickGapi();
    return this.loadClient().then(() => {
      return this.initClient();
    }).then(() => {
      return this.authorizeRead();
    }).then(() => {
      return this.createPicker();
    });
  }

  private loadClient() {
    if(this.loadPromise == null) {
      this.loadPromise = new Promise((resolve, reject) => {
        try {
          gapi.load('auth2:client:picker', resolve);
        }catch(ex) {
          reject(ex);
        }
      });
    }

    return this.loadPromise;
  }

  private initClient() {
    return gapi.client.init({
      apiKey: this.developerKey,
      clientId: this.clientId,
      discoveryDocs: [this.driveDoc],
      scope: this.readScope,
    });
  }

  private trickGapi() {
    // https://stackoverflow.com/questions/43040405/loading-aurelia-breaks-google-api
    if(!this.monkeyPatchDone) {
      const originTest = RegExp.prototype.test;
      RegExp.prototype.test = function test(v: any) {
        if (typeof v === 'function' && v.toString().includes('__array_observer__.addChangeRecord')) {
          return true;
        }
        return originTest.apply(this, arguments);
      };

      this.monkeyPatchDone = true;
    }
  }

  private authorizeRead() {
    if(this.accessToken == null) {
      return gapi.auth2.getAuthInstance().signIn().then(result => {
        this.accessToken = result.getAuthResponse().access_token;
      });
    }
  }

  private createPicker(): Promise<PickerResult> {
    return new Promise((resolve, reject) => {
      try {
        let jsonView = new google.picker.DocsView()
          .setIncludeFolders(true)
          //.setQuery(".json")
          .setMimeTypes("application/json")
          .setSelectFolderEnabled(false);

        let picker = new google.picker.PickerBuilder()
          .addView(jsonView)
          .setTitle("Select json file for import")
          .setOAuthToken(this.accessToken)
          .setDeveloperKey(this.developerKey)
          .setCallback((data: PickerResult) => {
            if(data.action != "loaded") {
              resolve(data);
            }
          })
          .enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES)
          .setSelectableMimeTypes("application/json")
          .build();

        picker.setVisible(true);
      }catch(ex) {
        reject(ex);
      }
    });
  }

  public getFile(fileId): Promise<GetFileContentResult> {
    return gapi.client.drive.files.get({
      fileId,
      alt: "media",
    });
  }

}



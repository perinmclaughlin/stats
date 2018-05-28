import { autoinject } from "aurelia-framework";
import { PickerResult } from "gapi_module";

@autoinject
export class GoogleDriveApi {
  developerKey = 'AIzaSyCPC9f-IBGr9L5MOAIm01UcgklHhXT3LSI';
  clientId = '587604503649-9l4eh384hpt14hnfhel1d9t7ihae9ana.apps.googleusercontent.com';
  readScope = 'https://www.googleapis.com/auth/drive.readonly';
  private loadPromise: Promise<any>;
  private accessToken: any;

  constructor() {
  }

  public openJsonSelector(): Promise<PickerResult> {
    return this.loadClient().then(() => {
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

  private authorizeRead() {
    return new Promise((resolve, reject) => {
      try {
        gapi.auth2.authorize({
          client_id: this.clientId,
          scope: this.readScope
        }, (authResult) => {
          if(!authResult) {
            reject("authResult null!");
          }
          if(authResult.error) {
            reject(authResult.error);
          }
          this.accessToken = authResult.access_token;
          resolve();
        });
      }catch(ex) {
        reject(ex);
      }
    });
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

  pickerCallback() {
  }


}



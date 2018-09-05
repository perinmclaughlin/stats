import { autoinject } from "aurelia-framework";
import { PickerResult, GetFileContentResult } from "gapi_module";
import { HttpClient } from "aurelia-fetch-client";
import * as URI from "urijs";

@autoinject
export class GoogleDriveApi {
  developerKey = 'AIzaSyCPC9f-IBGr9L5MOAIm01UcgklHhXT3LSI';
  clientId = '587604503649-9l4eh384hpt14hnfhel1d9t7ihae9ana.apps.googleusercontent.com';
  readScope = 'https://www.googleapis.com/auth/drive.readonly';
  writeScope = 'https://www.googleapis.com/auth/drive.file';
  driveDoc = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
  private loadPromise: Promise<any>;
  private accessToken: string;
  private monkeyPatchDone = false;
  private http: HttpClient;
  private gapiScriptPromise: Promise<any>;

  constructor() {
    this.http = new HttpClient();
    this.http.configure(c => {
        c.defaults.headers = {
          "Authorization": null
        };
        c.defaults.mode = "cors";
    });
  }

  private setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
    this.http.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  public openFolderSelector(title: string): Promise<PickerResult> {
    this.trickGapi();
    return this.loadClient().then(() => {
      return this.initClient();
    }).then(() => {
      return this.authorizeRead();
    }).then(() => {
      return this.createFolderPicker({
        title: title,
      });
    });
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
      this.loadPromise = this.loadGapi()
      .catch(error => {
        this.loadPromise = null;
        throw error;
      })
      .then(() => new Promise((resolve, reject) => {
        try {
          gapi.load('auth2:client:picker', resolve);
        }catch(ex) {
          reject(ex);
        }
      }));
    }

    return this.loadPromise;
  }

  private loadGapi() {
      if(this.gapiScriptPromise == null) {
        this.gapiScriptPromise = new Promise((resolve, reject) => {
          let script = document.createElement("script");
          script.type = "text/javascript";
          script.src = "https://apis.google.com/js/api.js";
          script.addEventListener("load", () => resolve(script), false);
          script.addEventListener("error", () => reject(script), false);
          document.body.appendChild(script);
        });
      }

      return this.gapiScriptPromise;
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
        this.setAccessToken(result.getAuthResponse().access_token);
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

  private createFolderPicker(options): Promise<PickerResult> {
    return new Promise((resolve, reject) => {
      try {
        let jsonView = new google.picker.DocsView()
          .setIncludeFolders(true)
          .setMimeTypes("application/vnd.google-apps.folder")
          .setSelectFolderEnabled(true);

        let picker = new google.picker.PickerBuilder()
          .addView(jsonView)
          .setTitle(options.title)
          .setOAuthToken(this.accessToken)
          .setDeveloperKey(this.developerKey)
          .setCallback((data: PickerResult) => {
            if(data.action != "loaded") {
              resolve(data);
            }
          })
          .enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES)
          .setSelectableMimeTypes("application/vnd.google-apps.folder")
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

  public fileExists(input: UploadInput): Promise<FileExistsOutput> {
    return gapi.client.drive.files.list({
      q: `name = '${this.escapeFileName(input.fileName)}' and '${input.folderId}' in parents`,
    }).then(results => {
      let result = {
        exists: results.result.files.length != 0,
        manyExist: results.result.files.length > 1,
        fileId: null 
      };
      if(result.exists && !result.manyExist) {
        result.fileId = results.result.files[0].id;
      }

      return result;
      
    });
  }

  private escapeFileName(fileName: string) {
    return fileName
      .replace("'", "\\'")
      .replace("\\", "\\\\");
  }

  public uploadFile(input: UploadInput) {
    return Promise.resolve('yup').then(() => {
      return this.authorizeRead();
    }).then(() => {
      var user = gapi.auth2.getAuthInstance().currentUser.get();
      var scopes = user.getGrantedScopes()
      if(scopes.indexOf(this.writeScope) == -1) {
        return user.grant({
          scope: this.writeScope
        });
      }
    }).then(() => {
      if(input.fileId == null) {
        return this.uploadNewFile(input);
      }else{
        return this.uploadReplaceFile(input);
      }
    });
  }

  // wish I could figure out how to call gapi.client.drive.files.create to do this
  private uploadNewFile(input: UploadInput) {
    let uri = new URI("https://content.googleapis.com/upload/drive/v3/files")
    uri.addQuery({
      uploadType: "multipart",
      key: this.developerKey,
    });

    let formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify({
      name: input.fileName,
      description: input.description,
      parents: [input.folderId],
    })], {type: "application/json"}));
    formData.append("file", input.content);
    return this.http.fetch(uri.toString(), {
      method: "POST",
      body: formData,
    });
  }

  private uploadReplaceFile(input: UploadInput) {
    let uri = new URI(`https://content.googleapis.com/upload/drive/v3/files/${input.fileId}`)
    uri.addQuery({
      uploadType: "multipart",
      key: this.developerKey,
    });

    let formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify({
      name: input.fileName,
      description: input.description,
    })], {type: "application/json"}));
    formData.append("file", input.content);
    return this.http.fetch(uri.toString(), {
      method: "PATCH",
      body: formData,
    });
  }

}

export interface UploadInput {
  fileName: string;
  description: string;
  content: string;
  folderId: string;
  fileId?: string;
}

export interface FileExistsOutput {
  exists: boolean;
  manyExist: boolean;
  fileId: string;
}


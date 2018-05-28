declare module 'gapi_module' {
  class GApi {
    load(things: string, callback: Function);
    auth2: any;
  }

  interface PickerResult {
    action: string;
    docs: PickerResultDoc[];
  }

  interface PickerResultDoc {
    description: string;
    embedUrl: string;
    iconUrl: string;
    id: string;
    lastEditedUtc: number;
    mimeType: string;
    name: string;
    parentId: string;
    serviceId: string;
    sizeBytes: number;
    type: string;
    url: string;
  }

  global {
    var gapi: GApi;
    var google: any;
  }

}

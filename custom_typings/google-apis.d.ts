declare module 'gapi_module' {
  class GApi {
    load(things: string, callback: Function);
    auth2: any;
    client: any;
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

  interface GetFileContentResult {
    body: string;
    headers: any;
    result: any;
    status: number;
  }

  global {
    var gapi: GApi;
    var google: any;
  }

}

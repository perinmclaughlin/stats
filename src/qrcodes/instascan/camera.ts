
export function cameraName(label) {
  var clean = label.replace(/\s*\([0-9a-f]+(:[0-9a-f]+)?\)\s*$/, '');
  return clean || label || null;
}

export class Camera {
  id: any;
  name: string;
  private _streamPromise: Promise<MediaStream>;
  private _stream: MediaStream;

  constructor(id, name) {
    this.id = id;
    this.name = name;
    this._stream = null;
  }

  start(): Promise<MediaStream> {
    var constraints = {
      audio: false,
      video: {
        mandatory: {
          sourceId: this.id,
          minWidth: 600,
          maxWidth: 800,
          minAspectRatio: 1.6
        },
        optional: []
      }
    };

    this._streamPromise = navigator.mediaDevices.getUserMedia(<MediaStreamConstraints>constraints);

    return this._streamPromise.then(stream => {
      this._stream = stream;
      return stream;
    });
  }

  stop() {
    if (!this._stream) {
      return;
    }

    for (let stream of this._stream.getVideoTracks()) {
      stream.stop();
    }

    this._stream = null;
  }

  static getCameras(): Promise<any> {
    var devicesPromise = navigator.mediaDevices.enumerateDevices();

    return devicesPromise.then(devices => {
      return devices
        .filter(d => d.kind === 'videoinput')
        .map(d => new Camera(d.deviceId, cameraName(d.label)));
    });
  }
}

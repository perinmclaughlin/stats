// stolen from https://github.com/schmich/instascan

import * as _ZXing from "zxing";
import * as Visibility from "visibilityjs";
import { Camera } from "./camera";

const ZXing = (<any>_ZXing)();

class ScanProvider {
  scanPeriod: number;
  captureImage: any;
  refractoryPeriod: any;
  private _emitter: Scanner;
  private _frameCount: number;
  private _analyzer: Analyzer;
  private _lastResult: any;
  private _active: boolean;
  refractoryTimeout: NodeJS.Timer;

  constructor(emitter, analyzer, captureImage, scanPeriod, refractoryPeriod) {
    this.scanPeriod = scanPeriod;
    this.captureImage = captureImage;
    this.refractoryPeriod = refractoryPeriod;
    this._emitter = emitter;
    this._frameCount = 0;
    this._analyzer = analyzer;
    this._lastResult = null;
    this._active = false;
  }

  start() {
    this._active = true;
    requestAnimationFrame(() => this._scan());
  }

  stop() {
    this._active = false;
  }

  scan() {
    return this._analyze(false);
  }

  _analyze(skipDups): Payload {
    let analysis = this._analyzer.analyze();
    if (!analysis) {
      return null;
    }

    let { result, canvas } = analysis;
    if (!result) {
      return null;
    }

    if (skipDups && result === this._lastResult) {
      return null;
    }

    clearTimeout(this.refractoryTimeout);
    this.refractoryTimeout = setTimeout(() => {
      this._lastResult = null;
    }, this.refractoryPeriod);

    let image = this.captureImage ? canvas.toDataURL('image/webp', 0.8) : null;

    this._lastResult = result;

    let payload : Payload = { content: result };
    if (image) {
      payload.image = image;
    }

    return payload;
  }

  _scan() {
    if (!this._active) {
      return;
    }

    requestAnimationFrame(() => this._scan());

    if (++this._frameCount !== this.scanPeriod) {
      return;
    } else {
      this._frameCount = 0;
    }

    let result = this._analyze(true);
    if (result) {
      setTimeout(() => {
        this._emitter.emitScan(result.content, result.image || null);
      }, 0);
    }
  }
}

interface Payload {
    content: any;
    image?: any;
}

class Analyzer {
  video: any;
  imageBuffer: any;
  sensorLeft: any;
  sensorTop: any;
  sensorWidth: any;
  sensorHeight: any;
  canvas: HTMLCanvasElement;
  canvasContext: any;
  decodeCallback: any;

  constructor(video) {
    this.video = video;

    this.imageBuffer = null;
    this.sensorLeft = null;
    this.sensorTop = null;
    this.sensorWidth = null;
    this.sensorHeight = null;

    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'none';
    this.canvasContext = null;

    this.decodeCallback = ZXing.Runtime.addFunction(function (ptr, len, resultIndex, resultCount) {
      var result = new Uint8Array(ZXing.HEAPU8.buffer, ptr, len);
      var str = String.fromCharCode.apply(null, result);
      if (resultIndex === 0) {
        (<any>window).zxDecodeResult = '';
      }
      (<any>window).zxDecodeResult += str;
    });
  }

  analyze() {
    if (!this.video.videoWidth) {
      return null;
    }

    if (!this.imageBuffer) {
      let videoWidth = this.video.videoWidth;
      let videoHeight = this.video.videoHeight;

      this.sensorWidth = videoWidth;
      this.sensorHeight = videoHeight;
      this.sensorLeft = Math.floor((videoWidth / 2) - (this.sensorWidth / 2));
      this.sensorTop = Math.floor((videoHeight / 2) - (this.sensorHeight / 2));

      this.canvas.width = this.sensorWidth;
      this.canvas.height = this.sensorHeight;

      this.canvasContext = this.canvas.getContext('2d');
      this.imageBuffer = ZXing._resize(this.sensorWidth, this.sensorHeight);
      return null;
    }

    this.canvasContext.drawImage(
      this.video,
      this.sensorLeft,
      this.sensorTop,
      this.sensorWidth,
      this.sensorHeight
    );

    let data = this.canvasContext.getImageData(0, 0, this.sensorWidth, this.sensorHeight).data;
    for (var i = 0, j = 0; i < data.length; i += 4, j++) {
      let [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      ZXing.HEAPU8[this.imageBuffer + j] = Math.trunc((r + g + b) / 3);
    }

    let err = ZXing._decode_qr(this.decodeCallback);
    if (err) {
      return null;
    }

    let result = (<any>window).zxDecodeResult;
    if (result != null) {
      return { result: result, canvas: this.canvas };
    }

    return null;
  }
}

export interface ScannerOptions {
  video: HTMLVideoElement;
  mirror?: boolean;
  continuous?: boolean;
  captureImage?: boolean;
  scanPeriod?: number;
  refractoryPeriod?: number;
}

export class Scanner {
  video: HTMLVideoElement;
  _mirror: boolean;
  private _continuous: boolean;
  private _analyzer: Analyzer;
  private _camera: Camera;
  private _scanner: ScanProvider;
  private _fsm: DerStateMachine;
  private onScanCallbacks: ((content, image) => any)[];

  constructor(opts: ScannerOptions) {

    this.video = opts.video;
    this.mirror = (opts.mirror !== false);
    this._continuous = (opts.continuous !== false);
    this._analyzer = new Analyzer(this.video);
    this._camera = null;

    let captureImage = opts.captureImage || false;
    let scanPeriod = opts.scanPeriod || 1;
    let refractoryPeriod = opts.refractoryPeriod || (5 * 1000);
    this.onScanCallbacks = [];

    this._scanner = new ScanProvider(this, this._analyzer, captureImage, scanPeriod, refractoryPeriod);
    this._fsm = new DerStateMachine(this);

    Visibility.change((e, state) => {
      if (state === 'visible') {
        setTimeout(() => {
          if (this._fsm.can('activate')) {
            this._fsm.activate();
          }
        }, 0);
      } else {
        if (this._fsm.can('deactivate')) {
          this._fsm.deactivate();
        }
      }
    });
  }

  onScan(callback: (content, image) => any) {
    this.onScanCallbacks.push(callback);
  }

  emitScan(content, image) {
    for(var callback of this.onScanCallbacks) {
      callback(content, image);
    }
  }

  scan() {
    return this._scanner.scan();
  }

  start(camera = null): Promise<any> {
    if (this._fsm.can('start')) {
      return this._fsm.start(camera);
    } else {
      return this._fsm.stop().then(() => {
        return this._fsm.start(camera);
      });
    }
  }

  stop(): Promise<any> {
    if (this._fsm.can('stop')) {
      return this._fsm.stop();
    }else{
      return Promise.resolve('yup');
    }
  }

  set captureImage(capture) {
    this._scanner.captureImage = capture;
  }

  get captureImage() {
    return this._scanner.captureImage;
  }

  set scanPeriod(period) {
    this._scanner.scanPeriod = period;
  }

  get scanPeriod() {
    return this._scanner.scanPeriod;
  }

  set refractoryPeriod(period) {
    this._scanner.refractoryPeriod = period;
  }

  get refractoryPeriod() {
    return this._scanner.refractoryPeriod;
  }

  set continuous(continuous) {
    this._continuous = continuous;

    if (continuous && this._fsm.current === 'active') {
      this._scanner.start();
    } else {
      this._scanner.stop();
    }
  }

  get continuous() {
    return this._continuous;
  }

  set mirror(mirror) {
    this._mirror = mirror;

    if (mirror) {
      (<any>this.video.style).MozTransform = 'scaleX(-1)';
      this.video.style.webkitTransform = 'scaleX(-1)';
      (<any>this.video.style).OTransform = 'scaleX(-1)';
      (<any>this.video.style).msFilter = 'FlipH';
      this.video.style.filter = 'FlipH';
      this.video.style.transform = 'scaleX(-1)';
    } else {
      (<any>this.video.style).MozTransform = null;
      this.video.style.webkitTransform = null;
      (<any>this.video.style).OTransform = null;
      (<any>this.video.style).msFilter = null;
      this.video.style.filter = null;
      this.video.style.transform = null;
    }
  }

  get mirror() {
    return this._mirror;
  }

  _enableScan(camera): Promise<any> {
    this._camera = camera || this._camera;
    if (!this._camera) {
      throw new Error('Camera is not defined.');
    }

    let streamUrlPromise = this._camera.start();
    return streamUrlPromise.then(stream => {
      this.video.srcObject = stream;
      if (this._continuous) {
        this._scanner.start();
      }
    });
  }

  _disableScan() {
    this.video.src = '';

    if (this._scanner) {
      this._scanner.stop();
    }

    if (this._camera) {
      this._camera.stop();
    }
  }
}

type DerState = "stopped" | "started" | "inactive" | "active";
type DerTransition = "start" | "stop" | "activate" | "deactivate";

class DerStateMachine {
  current: DerState = "stopped";
  private camera: Camera;

  constructor(private scanner: Scanner) {

  }

  can(trans: DerTransition) {
    if(trans == "start") {
      return this.current == "stopped";
    }
    if(trans == "stop") {
      return this.current != "stopped";
    }
    if(trans == "activate") {
      return this.current == "started" || this.current == "inactive";
    }

    if(trans == "deactivate") {
      return this.current == "started" || this.current == "active";
    }
    throw new Error("shouldn't get here");
  }

  start(camera: Camera) {
    this.current = "started";
    this.camera = camera;
    return this.activate();
  }

  activate() {
    if (Visibility.state() === 'visible') {
      this.current = "active";
    }else{
      this.current = "inactive";
    }
    return this.scanner._enableScan(this.camera);
  }

  stop() {
    if(this.current == "active") {
      this.scanner._disableScan();
    }
    this.current = "stopped"
    return Promise.resolve("yup");
  }

  deactivate() {
    if(this.current == "active") {
      this.scanner._disableScan();
    }
    this.current = "inactive";
  }
}

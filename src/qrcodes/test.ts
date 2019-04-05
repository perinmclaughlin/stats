import { autoinject } from "aurelia-framework";
import { DialogService } from "aurelia-dialog";
import { QrCodeDisplayDialog } from "./display-dialog";
import { Scanner } from "./instascan/scanner";
import { Camera } from "./instascan/camera";
import * as lz from "lz-string";
import { FrcStatsContext } from "../persistence";
import { IEventJson, gameManager } from "../games/index";
import { getTeamNumbers } from "../games/merge-utils";
import { ReceiveQrCodeDialog } from "./receive-qrcode-dialog";

@autoinject
export class QrCodeImportPage {
  videoElement: HTMLVideoElement;
  scanner: Scanner;
  scans = [];
  cameras = [];
  activeCameraId: number;
  activeCameraIndex: number;
  started = false;
  processing = false;
  hash: number;
  packetCount: number;
  chunks: string[];
  hasChunk: boolean[];
  remaining: string;
  receivedCount: number;
  data: string;

  constructor(
    private dialogService: DialogService,
    private dbContext: FrcStatsContext) {

  }

  attached() {
    this.scanner = new Scanner({ video: this.videoElement, scanPeriod: 50, dbContext: this.dbContext, });
    this.scanner.onScan((content, image) => {
      this.receivePacket(content);

    });

    Camera.getCameras().then(cameras => {
      this.cameras = cameras;
      if (cameras.length > 0) {
        this.activeCameraIndex = 0;
        this.setActiveCamera();
      } else {
        console.error('no cameras found');
      }
    })

  }

  public receivePacket(content) {
    let parsed = this.parsePacket(content);
    let ix = Math.random();
    console.info("receive packet: ", "started", this.started, "processing", this.processing, ix, (new Date()).getTime());
    if (!this.started) {
      console.info("begin", ix, (new Date()).getTime())
      this.started = true;
      this.packetCount = parsed.count;
      this.hash = parsed.hash;
      this.chunks = [];
      this.chunks.length = this.packetCount;
      this.hasChunk = [];
      this.hasChunk.length = this.packetCount;
      for (var i = 0; i < this.hasChunk.length; i++) {
        this.hasChunk[i] = false;
      }
    } else {
      if (parsed.hash != this.hash || parsed.count != this.packetCount) {
        console.info("content mismatch");
        return;
      }
      console.info("got another", ix, (new Date()).getTime());
    }
    this.hasChunk[parsed.index] = true;
    this.chunks[parsed.index] = parsed.data;
    this.receivedCount = this.hasChunk.filter(a => a).length;
    if(this.packetCount - this.receivedCount < 5) {
      let remainingIndex = [];
      for(var i = 0; i < this.hasChunk.length; i++) {
        if(!this.hasChunk[i]){
          remainingIndex.push(i+1);
        }
      }
      this.remaining = remainingIndex.join(", ");
    }
    console.info("chunks: ", this.hasChunk, "started: ", this.started, ix, (new Date()).getTime());

    if (this.hasChunk != null && this.hasChunk.every(a => a)) {
      
      this.data = /*lz.decompressFromBase64*/(this.chunks.join(''));

      if(!this.processing) {
        this.handleImport();
      }
      
      this.started = false;
      console.info("started off: ", this.started, ix, (new Date()).getTime());
      this.hasChunk = null;
      this.chunks = null;
      this.remaining = null;
    }
  }

  public handleImport() {
    let data = JSON.parse(this.data);
    this.scanner.stop();
    this.processing = true;
    ReceiveQrCodeDialog.open(this.dialogService, {
      data: data,
      teamNumber: data.teamNumber,
      matchNumber: data.matchNumber,
      
    })
    console.info("processing2: ", this.processing, (new Date()).getTime());
  }

  public startScan() {
    this.processing = false;
    this.setActiveCamera();
  }

  public prevCamera() {
    if (this.activeCameraIndex != 0) {
      this.activeCameraIndex--;
      this.setActiveCamera();
    }
  }

  public nextCamera() {
    if (this.activeCameraIndex < this.cameras.length - 1) {
      this.activeCameraIndex++;
      this.setActiveCamera();
    }
  }

  private setActiveCamera() {
    let camera = this.cameras[this.activeCameraIndex];
    this.activeCameraId = camera.id;
    console.info("active camera: ", camera.name);
    this.scanner.stop();
    this.scanner.start(camera);
  }

  public parseHeader(packet: string, index: number) {
    return parseInt(packet.substr(index, 2), 32);
  }

  public parsePacket(packet: string) {
    let index = this.parseHeader(packet, 0);
    let count = this.parseHeader(packet, 2);
    let hash = this.parseHeader(packet, 4);
    let data = packet.substring(6, packet.length);
    return {
      data: data,
      index: index,
      count: count,
      hash: hash,
    }
  }

  selectCamera(camera) {
    let index = this.cameras.findIndex(c => c.id == camera.id);
    this.activeCameraIndex = index;
    this.setActiveCamera();
  }

}

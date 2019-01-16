import { autoinject } from "aurelia-framework";
import { QrCodeDisplayInput, qrCodeConfigurations } from "./display-input";
import * as qrcode from "qrcode-generator";
import { DialogController, DialogService } from "aurelia-dialog";
import * as lz from "lz-string";
import { FrcStatsContext, makeUserPrefs } from "../persistence";



@autoinject
export class QrCodeDisplayDialog {
  qrCodeElement: Element;
  modelData: string;
  dataArray: string[];
  dataData: any[];
  i: number = 0;
  qrType: TypeNumber = 12;
  chunkSize: number = 287;
  errorCorrection: ErrorCorrectionLevel = 'M';
  qrConfigI = 0;

  constructor(public controller: DialogController, private dbContext: FrcStatsContext) {
    this.qrConfigI = qrCodeConfigurations.length-1;
    this.setQrSize();
  }

  activate(model: QrCodeDisplayInput) {
    this.dataArray = this.makePackets(model.data, this.chunkSize);
    this.modelData = model.data;
    return this.dbContext.getUserPrefs().then(userState => {
      let results = qrCodeConfigurations.findIndex(qrConfig => {
        return qrConfig.qrType == userState.qrType;
      });

      if(results == null || results == -1){
        return;
      }
      else{
        this.qrType = userState.qrType;
        this.qrConfigI = results;
        this.setQrSize();
        this.dataArray = this.makePackets(model.data, this.chunkSize);
      }
    });
  }

  drawQRCode() {
    // I think qrcode-generator is generating Model 2 qr codes? http://www.qrcode.com/en/codes/model12.html
    let data = this.dataArray[this.i];

    var errorCorrection : ErrorCorrectionLevel = 'M';
    var mode: Mode = "Byte";
    var cellSize = 4; // default is 2
    var margin = 10; // default is cellSize * 4

    var x = qrcode(this.qrType, errorCorrection);
    x.addData(data, mode);
    x.make();
    this.qrCodeElement.innerHTML = x.createImgTag(cellSize, margin);
  }

  encodeInt(i: number){
    let toEncode = i.toString(32);
    if(i < 32 && toEncode.length != 2){
      toEncode = "0" + toEncode;
    }

    if(toEncode.length != 2){
      throw new Error(toEncode + " is NOT two. This is probably a conversion issue.");
    }
    else{
      return toEncode;
    }
  }

  makePackets(data: string, chunkSize: number) {
    let packets = [];
    let hash = 0;

    let compressed = lz.compressToBase64(data);

    console.info("raw data length: ", data.length);
    console.info("compressed data lemgth: ", compressed.length)

    let chunks = this.obtainData(data, chunkSize - 6);

    for(var i = 0; i < chunks.length; i++){
      let index = this.encodeInt(i);
      let max = this.encodeInt(chunks.length);
      let hash2 = this.encodeInt(hash);

      let packet = index + max + hash2 + chunks[i];

      packets.push(packet);
    }

    if(this.i >= this.dataArray.length - 1){
      this.i = this.dataArray.length - 1;
    }
    return packets;
  }

  obtainData(data: string, chunkSize: number) {

    this.dataArray = [];

    // Convert data.
    var data2 = data;
    for(var i = 0; i < Math.ceil(data2.length / chunkSize); i++){
      var printThis = data2.substr(chunkSize * (i), chunkSize);
      this.dataArray.push(printThis);
      console.info("putting 'printThis' into 'this.dataArray' with length " + printThis.length);
    }
    return(this.dataArray);
  }

  increment() {
    if(this.i < this.dataArray.length - 1){
      this.i = this.i + 1;
    }
    else if(this.i >= this.dataArray.length - 1){
      this.i = this.dataArray.length - 1;
    }
    this.drawQRCode();
  }

  decrement() {
    if(this.i != 0){
      this.i = this.i - 1;
    }

    this.drawQRCode();
  }

  setQrSize() {
    let config = qrCodeConfigurations[this.qrConfigI];
    this.qrType = config.qrType;
    this.chunkSize = config.size;
    this.errorCorrection = config.errorCorrection;
  }

  increaseSize(){
    if(this.qrConfigI >= qrCodeConfigurations.length-1){
      return;
    }
    this.qrConfigI ++;
    this.setQrSize();

    this.dataArray = this.makePackets(this.modelData, this.chunkSize);
    this.saveQRcodeSize(this.qrType);
    this.drawQRCode();
  }

  decreaseSize(){
    if(this.qrConfigI == 0) {
      return;
    }

    this.qrConfigI --;
    this.setQrSize();
    
    this.dataArray = this.makePackets(this.modelData, this.chunkSize);
    this.saveQRcodeSize(this.qrType);
    this.drawQRCode();
  }

  attached() {
    this.drawQRCode();
  }

  saveQRcodeSize(qrType2: TypeNumber){
    return this.dbContext.getUserPrefs().then(userState => {
      userState.qrType = qrType2;

      this.dbContext.userPrefs.put(userState);
    });
  }

  static open(dialogService: DialogService, model: QrCodeDisplayInput) {
    return dialogService.open({model: model, viewModel: QrCodeDisplayDialog})
  }
}

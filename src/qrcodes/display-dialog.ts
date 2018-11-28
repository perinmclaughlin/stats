import { autoinject } from "aurelia-framework";
import { QrCodeDisplayInput } from "./display-input";
import * as qrcode from "qrcode-generator";
import { DialogController, DialogService } from "aurelia-dialog";

@autoinject
export class QrCodeDisplayDialog {
    qrCodeElement: Element;
    dataArray: string[];
    dataData: any[];
    i: number = 0;
    qrType: TypeNumber = 12;
    chunkSize: number = 287

    constructor(public controller: DialogController) {

    }

    activate(model: QrCodeDisplayInput) {
        this.dataArray = this.makePackets(model.data, this.chunkSize);
    }

    drawQRCode() {
        // I think qrcode-generator is generating Model 2 qr codes? http://www.qrcode.com/en/codes/model12.html
        var passIn = [];
        passIn.push(this.dataArray[this.i]);
        
        var errorCorrection : ErrorCorrectionLevel = 'M';
        var mode: Mode = "Byte";
        var cellSize = 4; // default is 2
        var margin = 10; // default is cellSize * 4
        var data = passIn.join("");

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
        let chunks = this.obtainData(data, chunkSize - 6);

        for(var i = 0; i < chunks.length; i++){
            let index = this.encodeInt(i);
            let max = this.encodeInt(chunks.length);
            let hash2 = this.encodeInt(hash);

            let packet = index + max + hash2 + chunks[i];

            packets.push(packet);
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
        }
        return(this.dataArray);
    }

    increment() {
        if(this.i != this.dataArray.length - 1){
            this.i = this.i + 1;
        }
        this.drawQRCode();
    }

    decrement() {
        if(this.i != 0){
            this.i = this.i - 1;
        }

        this.drawQRCode();
    }

    increaseSize(){
        //  This (especially adding to chunkSize) is very ghetto, so BE CAREFUL!
        //  This code block will probably need to be edited.
        if(this.qrType != 40){
            this.qrType += 1;
            this.chunkSize += 24;
        }

        this.drawQRCode();
    }

    decreaseSize(){
        //  This (especially subtracting from chunkSize) is very ghetto, so BE CAREFUL!
        //  This code block will probably need to be edited.
        if(this.qrType != 0){
            this.qrType -= 1;
            this.chunkSize -= 24;
        }

        this.drawQRCode();
    }

    attached() {
        this.drawQRCode();
    }

    static open(dialogService: DialogService, model: QrCodeDisplayInput) {
        return dialogService.open({model: model, viewModel: QrCodeDisplayDialog})
    }
}

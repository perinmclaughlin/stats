import { autoinject } from "aurelia-framework";
import { QrCodeDisplayInput } from "./display-input";
import * as qrcode from "qrcode-generator";
import { DialogController } from "aurelia-dialog";

@autoinject
export class QrCodeDisplayDialog {
    qrCodeElement: Element;
    dataArray: string[];
    dataData: any[];
    i: number = 0;

    constructor(public controller: DialogController) {

    }

    activate(model: QrCodeDisplayInput) {
        this.obtainData(model.data, 287); 
        this.attached();
    }

    click() {
        // I think qrcode-generator is generating Model 2 qr codes? http://www.qrcode.com/en/codes/model12.html
        var passIn = [];
        passIn.push(this.dataArray[this.i]);
        
        var qrType : TypeNumber = 12; 
        var errorCorrection : ErrorCorrectionLevel = 'M';
        var mode: Mode = "Byte";
        var cellSize = 4; // default is 2
        var margin = 10; // default is cellSize * 4
        var data = passIn.join("");

        var x = qrcode(qrType, errorCorrection);
        x.addData(data, mode);
        x.make();
        this.qrCodeElement.innerHTML = x.createImgTag(cellSize, margin);
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
        this.click();
    }

    decrement() {
        if(this.i != 0){
            this.i = this.i - 1;
        }

        this.click();
    }

    attached() {
        this.click();
    }
}

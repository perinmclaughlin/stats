import { autoinject } from "aurelia-framework";
import { QrCodeDisplayInput } from "./display-input";
import * as qrcode from "qrcode-generator";
import { DialogController } from "aurelia-dialog";

@autoinject
export class QrCodeDisplayDialog {
    qrCodeElement: Element;

    constructor(public controller: DialogController) {

    }

    activate(model: QrCodeDisplayInput) {

    }

    click() {
        // I think qrcode-generator is generating Model 2 qr codes? http://www.qrcode.com/en/codes/model12.html
        var passIn = [];
        for(var i = 0; i < 10; i++){
            passIn.push(i);
        }
        
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
        // Convert data.
        var data2 = data;
        var array = [];
        for(var i = 0; i < Math.ceil(data2.length / chunkSize); i++){
            var printThis = data2.substr(chunkSize * (i), chunkSize);
            array.push(printThis);
        }
        return(array);
    }
}

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
        var qrType : TypeNumber = 25; 
        var errorCorrection : ErrorCorrectionLevel = 'M';
        var mode: Mode = "Byte";
        var cellSize = 4; // default is 2
        var margin = 10; // default is cellSize * 4
        var data = "tacostacos";

        var x = qrcode(qrType, errorCorrection);
        x.addData(data, mode);
        x.make();
        this.qrCodeElement.innerHTML = x.createImgTag(cellSize, margin);
    }
}

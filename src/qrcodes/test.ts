import { autoinject } from "aurelia-framework";
import { DialogService } from "aurelia-dialog";
import { QrCodeDisplayDialog } from "./display-dialog";
import { Scanner } from "./instascan/scanner";
import { Camera } from "./instascan/camera";

@autoinject
export class Choofy {
    videoElement: HTMLVideoElement;
    scanner: Scanner;
    scans = [];
    cameras = [];
    activeCameraId: number;

    constructor(private dialogService: DialogService) {

    }

    attached() {

        this.scanner = new Scanner({ video: this.videoElement, scanPeriod: 5 });
        this.scanner.onScan((content, image) => {
            console.info(content, image);
            this.scans.push({date: +(Date.now()), content: content});
        });

        Camera.getCameras().then(cameras => {
            this.cameras = cameras;
            if(cameras.length > 0 ) {
                this.activeCameraId = cameras[0].id;
                this.scanner.start(cameras[0]);
            }else{
                console.error('no cameras found');
            }
        })
        
    }

    click() {
        this.dialogService.open({
            model: {},
            viewModel: QrCodeDisplayDialog
        });
    }
}
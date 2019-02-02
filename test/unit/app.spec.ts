import { QrCodeDisplayDialog } from '../../src/qrcodes/display-dialog';
import { QrCodeImportPage } from "../../src/qrcodes/test";

describe('qrcode display', () => {
  var makeImportPage = () => {
    return new QrCodeImportPage(null, null);
  }
  var makeDisplayDialog = () => {
    return new QrCodeDisplayDialog(null, null);
  }
  it('chunks data', () => {
    let display = makeDisplayDialog();

    let result = display.obtainData("abcdefghij", 3);

    expect(result).toEqual(["abc", "def", "ghi", "j"]);
  });

  it('makes packets', () => {
    let display = makeDisplayDialog();

    let result = display.makePackets("abcdefghijklmnop", 12);

    expect(result).toEqual(["000300abcdef", "010300ghijkl", "020300mnop"]);
  });

  it('reassembles packets', () => {

    let display = makeDisplayDialog();
    let reassembler = makeImportPage();
    reassembler.handleImport = () => {
    };
    let data = "abcdefghijklmnop";


    let results = display.makePackets(data, 12);
    
    for(var packet of results) {
      reassembler.receivePacket(packet);
    }
    expect(reassembler.data).toEqual(data);
  });
});

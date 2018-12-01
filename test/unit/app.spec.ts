import { QrCodeDisplayDialog } from '../../src/qrcodes/display-dialog';

describe('qrcode display', () => {
  it('chunks data', () => {
    let display = new QrCodeDisplayDialog(null);

    let result = display.obtainData("abcdefghij", 3);

    expect(result).toEqual(["abc", "def", "ghi", "j"]);
  });

  it('makes packets', () => {
    let display = new QrCodeDisplayDialog(null);

    let result = display.makePackets("abcdefghijklmnop", 12);

    expect(result).toEqual(["000300abcdef", "010300ghijkl", "020300mnop"]);
  });
});

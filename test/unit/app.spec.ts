import {QrCodeDisplayDialog } from '../../src/qrcodes/display-dialog';

describe('qrcode display', () => {
  it('chunks data', () => {
      let display = new QrCodeDisplayDialog(null);

      let result = display.obtainData("abcdefghij", 3);

      expect(result).toEqual(["abc", "def", "ghi", "j"]);

  });
});

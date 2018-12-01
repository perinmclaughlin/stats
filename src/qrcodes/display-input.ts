export interface QrCodeDisplayInput {
    data: string;
}

export interface QrCodeConfiguration {
  qrType: TypeNumber;
  errorCorrection: ErrorCorrectionLevel;
  size: number;
}

export var qrCodeConfigurations : QrCodeConfiguration[] = [
  {
    qrType: 12,
    size: 287,
    errorCorrection: 'M'
  },
  {
    qrType: 14,
    size: 362,
    errorCorrection: 'M'
  },
  {
    qrType: 16,
    size: 450,
    errorCorrection: 'M'
  },
  {
    qrType: 18,
    size: 560,
    errorCorrection: 'M'
  },
  {
    qrType: 20,
    size: 665,
    errorCorrection: 'M'
  },
  {
    qrType: 22,
    size: 775,
    errorCorrection: 'M'
  },
  {
    qrType: 24,
    size: 910,
    errorCorrection: 'M'
  },
  {
    qrType: 26,
    size: 1060,
    errorCorrection: 'M'
  },
  {
    qrType: 28,
    size: 1190,
    errorCorrection: 'M'
  },
  {
    qrType: 30,
    size: 1370,
    errorCorrection: 'M'
  },
  {
    qrType: 32,
    size: 1535,
    errorCorrection: 'M'
  },
  {
    qrType: 34,
    size: 1720,
    errorCorrection: 'M'
  },
  {
    qrType: 36,
    size: 1910,
    errorCorrection: 'M'
  },
  {
    qrType: 38,
    size: 2095,
    errorCorrection: 'M'
  },
  {
    qrType: 40,
    size: 2330,
    errorCorrection: 'M'
  },
];

export interface ReceiveQrCodeModel {
  data: any;
  teamNumber: string;
  matchNumber: string;
}
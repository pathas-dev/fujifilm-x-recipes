import {
  COLOR_CHROME,
  COLOR_CHROME_FX_BLUE,
  D_RANGES,
  GRAIN_ROUGHNESS,
  GRAIN_SIZE,
  WHITE_BALANCES,
} from './fujiSettings';

export type FujiSetting = {
  tone: { highlight: number; shadow: number };
  color: number;
  sharpness: number;
  isoNoiseReduction: number;
  clarity: number;
  exposure: number;
  iso: { value: number; isAuto: boolean };
  grain: {
    size: (typeof GRAIN_SIZE)[number];
    roughness: (typeof GRAIN_ROUGHNESS)[number];
  };
  colorChrome: {
    effect: (typeof COLOR_CHROME)[number];
    fxBlue: (typeof COLOR_CHROME_FX_BLUE)[number];
  };
  dRange: (typeof D_RANGES)[number];
  whiteBalance: WhiteBalance;
  bwAdj: number;
};

export type WhiteBalance = {
  type: (typeof WHITE_BALANCES)[number];
  shift: { red: number; blue: number };
  k: number;
};

export type CustomRecipe = {
  _id: string;
  name: string;
  base: string;
  camera: string;
  sensor: string;
  colorType: string;
  createdAt: string;
  updatedAt: string;
  settings: FujiSetting;
};

export const initialSettings: FujiSetting = {
  tone: {
    highlight: 0,
    shadow: 0,
  },
  color: 0,
  sharpness: 0,
  isoNoiseReduction: 0,
  clarity: 0,
  exposure: 0,
  iso: {
    value: 200,
    isAuto: false,
  },
  colorChrome: {
    effect: 'off',
    fxBlue: 'off',
  },
  dRange: 'AUTO',
  grain: {
    roughness: 'off',
    size: 'off',
  },
  whiteBalance: {
    type: 'autoWhitePriority',
    shift: { red: 0, blue: 0 },
    k: 5500,
  },
  bwAdj: 0,
};

export const initialCustomRecipe: CustomRecipe = {
  _id: '',
  name: '',
  base: '',
  camera: '',
  colorType: '',
  sensor: '',
  createdAt: '',
  updatedAt: '',
  settings: {
    tone: {
      highlight: 0,
      shadow: 0,
    },
    color: 0,
    sharpness: 0,
    isoNoiseReduction: 0,
    clarity: 0,
    exposure: 0,
    iso: {
      value: 200,
      isAuto: false,
    },
    colorChrome: {
      effect: 'off',
      fxBlue: 'off',
    },
    dRange: 'AUTO',
    grain: {
      roughness: 'off',
      size: 'off',
    },
    whiteBalance: {
      type: 'autoWhitePriority',
      shift: { red: 0, blue: 0 },
      k: 5500,
    },
    bwAdj: 0,
  },
};

export const getInitialCustomRecipe = () => ({ ...initialCustomRecipe });

export const ERROR_TYPES = ['noName', 'noCamera', 'noBase'] as const;

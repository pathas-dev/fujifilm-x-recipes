import {
  COLOR_CHROME,
  COLOR_CHROME_FX_BLUE,
  D_RANGES,
  GRAIN_ROUGHNESS,
  GRAIN_SIZE,
  WHITE_BALANCES,
} from './fujiSettings';
import Ajv, { JSONSchemaType } from 'ajv';

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
  colorType: 'color' | 'bw';
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
  colorType: 'color',
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

export const isCustomRecipeJSON = (customRecipeJSON: CustomRecipe) => {
  const ajv = new Ajv();
  const schema: JSONSchemaType<CustomRecipe> = {
    type: 'object',
    required: [
      '_id',
      'base',
      'camera',
      'colorType',
      'createdAt',
      'name',
      'sensor',
      'settings',
      'updatedAt',
    ],
    properties: {
      _id: { type: 'string' },
      name: { type: 'string' },
      base: { type: 'string' },
      camera: { type: 'string' },
      sensor: { type: 'string' },
      colorType: { type: 'string' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
      settings: {
        type: 'object',
        required: [
          'bwAdj',
          'clarity',
          'color',
          'colorChrome',
          'dRange',
          'exposure',
          'grain',
          'iso',
          'isoNoiseReduction',
          'sharpness',
          'tone',
        ],
        properties: {
          tone: {
            type: 'object',
            required: ['highlight', 'shadow'],
            properties: {
              highlight: { type: 'number' },
              shadow: { type: 'number' },
            },
          },
          color: { type: 'number' },
          sharpness: { type: 'number' },
          isoNoiseReduction: { type: 'number' },
          clarity: { type: 'number' },
          exposure: { type: 'number' },
          iso: {
            type: 'object',
            required: ['isAuto', 'value'],
            properties: {
              value: { type: 'number' },
              isAuto: { type: 'boolean' },
            },
          },
          grain: {
            type: 'object',
            required: ['roughness', 'size'],
            properties: {
              size: { type: 'string' },
              roughness: { type: 'string' },
            },
          },
          colorChrome: {
            type: 'object',
            required: ['effect', 'fxBlue'],
            properties: {
              effect: { type: 'string' },
              fxBlue: { type: 'string' },
            },
          },
          dRange: { type: 'string' },
          whiteBalance: {
            type: 'object',
            required: ['k', 'shift', 'type'],
            properties: {
              type: { type: 'string' },
              shift: {
                type: 'object',
                required: ['blue', 'red'],
                properties: {
                  red: { type: 'number' },
                  blue: { type: 'number' },
                },
              },
              k: { type: 'number' },
            },
          },
          bwAdj: { type: 'number' },
        },
      },
    },
  };
  const validate = ajv.compile(schema);
  if (validate(customRecipeJSON)) {
    return true;
  } else {
    console.log(validate.errors);
    return false;
  }
};

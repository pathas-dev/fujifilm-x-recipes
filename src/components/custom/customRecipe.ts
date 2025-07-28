import {
  COLOR_CHROME,
  COLOR_CHROME_FX_BLUE,
  D_RANGES,
  GRAIN_ROUGHNESS,
  GRAIN_SIZE,
  WHITE_BALANCES,
} from './fujiSettings';
import { UnifiedFujiSettings, FilmSimulations } from '@/types/camera-schema';
import Ajv, { JSONSchemaType } from 'ajv';

// Legacy FujiSetting type (for backward compatibility)
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

// Enhanced FujiSetting with filmSimulation (for new recipes)
export type EnhancedFujiSetting = FujiSetting & {
  filmSimulation: (typeof FilmSimulations)[number];
};

export type WhiteBalance = {
  type: (typeof WHITE_BALANCES)[number];
  shift: { red: number; blue: number };
  k: number;
};

// Legacy CustomRecipe type (for backward compatibility)
export type LegacyCustomRecipe = {
  _id: string;
  name: string;
  base: string;
  camera: string;
  sensor: string;
  colorType: 'Color' | 'BW';
  createdAt: string;
  updatedAt: string;
  settings: FujiSetting;
};

// Enhanced CustomRecipe type (with filmSimulation)
export type CustomRecipe = {
  _id: string;
  name: string;
  base: string; // This will be the filmSimulation
  camera: string;
  sensor: string;
  colorType: 'Color' | 'BW';
  createdAt: string;
  updatedAt: string;
  settings: EnhancedFujiSetting;
};

// Conversion utility from legacy to enhanced format
export const upgradeLegacyCustomRecipe = (legacy: LegacyCustomRecipe): CustomRecipe => {
  return {
    ...legacy,
    settings: {
      ...legacy.settings,
      filmSimulation: legacy.base as (typeof FilmSimulations)[number] || 'Provia',
    },
  };
};

// Conversion utility from custom to unified format
export const convertCustomToUnified = (customSettings: EnhancedFujiSetting): UnifiedFujiSettings => {
  return {
    filmSimulation: customSettings.filmSimulation,
    iso: customSettings.iso,
    exposure: customSettings.exposure,
    dynamicRange: customSettings.dRange === 'AUTO' ? 'AUTO' : 
                  customSettings.dRange === '100%' ? 'DR100%' :
                  customSettings.dRange === '200%' ? 'DR200%' : 'DR400%',
    priority: 'AUTO', // Default value, not present in custom format
    tone: customSettings.tone,
    color: customSettings.color,
    sharpness: customSettings.sharpness,
    clarity: customSettings.clarity,
    noiseReduction: customSettings.isoNoiseReduction,
    grain: {
      effect: customSettings.grain.roughness === 'off' ? 'OFF' :
             customSettings.grain.roughness === 'weak' ? 'WEAK' : 'STRONG',
      size: customSettings.grain.size === 'off' ? 'OFF' :
            customSettings.grain.size === 'small' ? 'SMALL' : 'LARGE',
    },
    colorChrome: {
      effect: customSettings.colorChrome.effect === 'off' ? 'OFF' :
             customSettings.colorChrome.effect === 'weak' ? 'WEAK' : 'STRONG',
      fxBlue: customSettings.colorChrome.fxBlue === 'off' ? 'OFF' :
             customSettings.colorChrome.fxBlue === 'weak' ? 'WEAK' : 'STRONG',
    },
    whiteBalance: customSettings.whiteBalance,
    bwAdjustment: customSettings.bwAdj,
  };
};

// Conversion utility from unified to custom format
export const convertUnifiedToCustom = (unifiedSettings: UnifiedFujiSettings): EnhancedFujiSetting => {
  const isoValue = typeof unifiedSettings.iso === 'string' ? 
    parseInt(unifiedSettings.iso) || 200 : unifiedSettings.iso;
  
  const exposureValue = typeof unifiedSettings.exposure === 'string' ? 
    0 : unifiedSettings.exposure; // Would need proper parsing
    
  return {
    filmSimulation: unifiedSettings.filmSimulation,
    tone: unifiedSettings.tone,
    color: unifiedSettings.color,
    sharpness: unifiedSettings.sharpness,
    isoNoiseReduction: unifiedSettings.noiseReduction,
    clarity: unifiedSettings.clarity,
    exposure: exposureValue,
    iso: typeof isoValue === 'object' ? isoValue : { value: isoValue, isAuto: false },
    grain: {
      size: unifiedSettings.grain.size.toLowerCase() as (typeof GRAIN_SIZE)[number],
      roughness: unifiedSettings.grain.effect.toLowerCase() as (typeof GRAIN_ROUGHNESS)[number],
    },
    colorChrome: {
      effect: unifiedSettings.colorChrome.effect.toLowerCase() as (typeof COLOR_CHROME)[number],
      fxBlue: unifiedSettings.colorChrome.fxBlue.toLowerCase() as (typeof COLOR_CHROME_FX_BLUE)[number],
    },
    dRange: unifiedSettings.dynamicRange === 'AUTO' ? 'AUTO' :
           unifiedSettings.dynamicRange === 'DR100%' ? '100%' :
           unifiedSettings.dynamicRange === 'DR200%' ? '200%' : '400%',
    whiteBalance: {
      type: unifiedSettings.whiteBalance.type as (typeof WHITE_BALANCES)[number],
      shift: unifiedSettings.whiteBalance.shift,
      k: unifiedSettings.whiteBalance.k,
    },
    bwAdj: unifiedSettings.bwAdjustment,
  };
};

export const initialSettings: EnhancedFujiSetting = {
  filmSimulation: 'Provia',
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
  base: 'Provia',
  camera: '',
  colorType: 'Color',
  sensor: '',
  createdAt: '',
  updatedAt: '',
  settings: initialSettings,
};

export const getInitialCustomRecipe = () => ({ ...initialCustomRecipe });

export const ERROR_TYPES = ['noName', 'noCamera', 'noBase'] as const;

export const isCustomRecipeJSON = (customRecipeJSON: any): customRecipeJSON is CustomRecipe => {
  const ajv = new Ajv();
  
  // Enhanced schema for new format with filmSimulation
  const enhancedSchema: JSONSchemaType<CustomRecipe> = {
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
          'whiteBalance',
          'filmSimulation',
        ],
        properties: {
          filmSimulation: { type: 'string' },
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

  // Legacy schema for old format without filmSimulation
  const legacySchema: JSONSchemaType<LegacyCustomRecipe> = {
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
          'whiteBalance',
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

  // Try enhanced format first
  const validateEnhanced = ajv.compile(enhancedSchema);
  if (validateEnhanced(customRecipeJSON)) {
    return true;
  }

  // Try legacy format and upgrade if valid
  const validateLegacy = ajv.compile(legacySchema);
  if (validateLegacy(customRecipeJSON)) {
    // Upgrade legacy format to enhanced format
    const upgraded = upgradeLegacyCustomRecipe(customRecipeJSON as LegacyCustomRecipe);
    Object.assign(customRecipeJSON, upgraded);
    return true;
  }

  console.log('Enhanced validation errors:', validateEnhanced.errors);
  console.log('Legacy validation errors:', validateLegacy.errors);
  return false;
};

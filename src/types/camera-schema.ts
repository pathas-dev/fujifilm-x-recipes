import { z } from 'zod';

// 색상 구분 값들
export const COLOR_TYPES = ['Color', 'B&W'] as const;

// Updated sensor-camera mappings based on cameras.json data
export const SENSOR_CAMERA_MAPPINGS = [
  {
    sensor: 'BAYER (type unknown)' as const,
    cameras: ['X100', 'X10', 'X-S1', 'X-A1', 'X-A2', 'X-A3', 'X-A5', 'X-A7', 'X-T100', 'XT200'] as const,
  },
  { 
    sensor: 'BAYER MF 50MP' as const, 
    cameras: ['GFX 50S', 'GFX 50R'] as const 
  },
  { 
    sensor: 'BAYER MF 100MP' as const, 
    cameras: ['GFX 100', 'GFX 100s'] as const 
  },
  {
    sensor: 'X-Trans I' as const,
    cameras: ['X-PRO1', 'X-E1', 'XF1', 'X-M1'] as const,
  },
  {
    sensor: 'X-Trans II' as const,
    cameras: ['X100S', 'X-E2', 'X-T1', 'X100T', 'X-E2s', 'X70', 'X-T10'] as const,
  },
  { 
    sensor: 'X-Trans II 2/3' as const, 
    cameras: ['X20', 'XQ1', 'X30', 'XQ2'] as const 
  },
  {
    sensor: 'X-Trans III' as const,
    cameras: [
      'X-PRO2',
      'X100F',
      'XT20',
      'XE3',
      'X-H1',
      'X-T2',
      'XF10',
    ] as const,
  },
  {
    sensor: 'X-Trans IV' as const,
    cameras: [
      'X-T3',
      'X-T30',
      'X-PRO3',
      'X-T4',
      'X100V',
      'X-S10',
      'X-E4',
      'X-T30 II',
      'X-S20',
    ] as const,
  },
  { 
    sensor: 'X-Trans V BSI Stkd' as const, 
    cameras: ['X-H2s'] as const 
  },
  {
    sensor: 'X-Trans V HR' as const,
    cameras: ['X-H2', 'X-T5', 'X100VI'] as const,
  },
] as const;

export const SENSOR_TYPES = SENSOR_CAMERA_MAPPINGS.flatMap(
  ({ sensor }) => sensor
);

// 카메라 모델 값들
export const CAMERA_MODELS = SENSOR_CAMERA_MAPPINGS.flatMap(
  ({ cameras }) => cameras
);

// 센서 타입 스키마
export const SensorTypeSchema = z.enum(SENSOR_TYPES);

// 카메라 모델 스키마
export const CameraModelSchema = z.enum(CAMERA_MODELS);

// 색상 구분 스키마
export const ColorOrBwSchema = z.enum(COLOR_TYPES);

// 센서-카메라 매핑 스키마
export const SensorCameraMappingSchema = z.object({
  sensorType: SensorTypeSchema,
  cameras: z.array(CameraModelSchema),
});

// 전체 카메라 정보 스키마
export const CameraInfoSchema = z.object({
  model: CameraModelSchema,
  sensorType: SensorTypeSchema,
  colorType: ColorOrBwSchema,
});

// 필름 시뮬레이션 타입 정의 - cameras.json에서 추출한 실제 데이터 기반
export const FilmSimulations = [
  'Provia',
  'Astia', 
  'Classic Chrome',
  'Classic Negative',
  'Reala Ace',
  'Eterna',
  'Eterna Bleach Bypass',
  'Nostalgic Negative',
  'Prog Neg Hi',
  'Prog Neg Std',
  'Velvia',
  'Acros',
  'Monochrome',
] as const;

export const FilmSimulatioSchema = z
  .enum(FilmSimulations)
  .default('Provia')
  .describe('필름 시뮬레이션 타입');

export const sizes = ['OFF', 'SMALL', 'LARGE'] as const;
export const effects = ['OFF', 'WEAK', 'STRONG'] as const;
export const dynamicRanges = ['AUTO', 'DR100%', 'DR200%', 'DR400%'] as const;
export const priorities = ['AUTO', ...effects] as const;

// White balance types from fujiSettings.ts
export const whiteBalanceTypes = [
  'autoWhitePriority',
  'auto',
  'autoAmbiencePriority',
  'measure',
  'k',
  'sunlight',
  'shade',
  'daylight',
  'warmWhite',
  'coolWhite',
  'incandescent',
  'underwater',
] as const;

// ISO values from fujiSettings.ts
export const isoValues = [
  80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000,
  2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600, 32000,
  40000, 51200,
] as const;

// Unified Fujifilm settings schema that accommodates both custom and AI formats
export const UnifiedFujiSettingsSchema = z.object({
  // Film simulation - required for all recipes
  filmSimulation: FilmSimulatioSchema,

  // ISO setting - flexible format
  iso: z.union([
    z.string().describe('ISO as string (AI format): "200", "AUTO"'),
    z.object({
      value: z.number().describe('ISO value'),
      isAuto: z.boolean().describe('Whether ISO is auto'),
    }).describe('ISO as object (custom format)')
  ]).describe('ISO sensitivity setting'),

  // Exposure - flexible format  
  exposure: z.union([
    z.string().describe('Exposure as string (AI format): "+1", "-2/3"'),
    z.number().describe('Exposure as number (custom format): 3 = +1 stop')
  ]).describe('Exposure compensation'),

  // Dynamic range
  dynamicRange: z.enum(dynamicRanges).default('AUTO').describe('Dynamic Range setting'),

  // Priority setting (for newer cameras)
  priority: z.enum(priorities).default('AUTO').describe('Priority setting'),

  // Tone settings - unified structure
  tone: z.object({
    highlight: z.number().int().min(-2).max(4).default(0).describe('Highlight adjustment'),
    shadow: z.number().int().min(-2).max(4).default(0).describe('Shadow adjustment'),
  }).describe('Tone curve adjustments'),

  // Color and processing settings
  color: z.number().int().min(-4).max(4).default(0).describe('Color saturation'),
  sharpness: z.number().int().min(-4).max(4).default(0).describe('Sharpness setting'),
  clarity: z.number().int().min(-5).max(5).default(0).describe('Clarity/mid-tone contrast'),
  noiseReduction: z.number().int().min(-4).max(4).default(0).describe('ISO noise reduction'),

  // Grain effects - unified structure
  grain: z.object({
    effect: z.enum(effects).default('OFF').describe('Grain effect strength'),
    size: z.enum(sizes).default('OFF').describe('Grain particle size'),
  }).describe('Film grain simulation'),

  // Color chrome effects - unified structure  
  colorChrome: z.object({
    effect: z.enum(effects).default('OFF').describe('Color Chrome effect'),
    fxBlue: z.enum(effects).default('OFF').describe('Color Chrome FX Blue'),
  }).describe('Color Chrome effects'),

  // White balance - unified structure
  whiteBalance: z.object({
    type: z.union([
      z.enum(whiteBalanceTypes),
      z.string()
    ]).describe('White balance type'),
    shift: z.object({
      red: z.number().int().min(-9).max(9).default(0).describe('Red shift'),
      blue: z.number().int().min(-9).max(9).default(0).describe('Blue shift'),
    }).describe('White balance shift'),
    k: z.number().int().min(2500).max(10000).default(5500).describe('Color temperature in Kelvin'),
  }).describe('White balance settings'),

  // Black and white adjustment
  bwAdjustment: z.number().int().min(-9).max(9).default(0).describe('Black & white filter adjustment'),
});

// Legacy AI format schema (for backward compatibility)
export const FujifilmSettingsSchema = z.object({
  filmSimulation: FilmSimulatioSchema,
  iso: z.string().describe('ISO - 이미지 감도 설정'),
  exposure: z.string().default('0').describe('Exposure - 노출 설정'),
  dynamicRange: z.enum(dynamicRanges).default('AUTO').describe('Dynamic Range - 넓은 계조와 디테일 보존'),
  priority: z.enum(priorities).default('AUTO').describe('Priority - 센서 원본 데이터 활용 설정'),
  grainEffect: z.enum(effects).default('OFF').describe('Grain 효과 강도 - 필름 아날로그 질감'),
  grainSize: z.enum(sizes).default('OFF').describe('Grain 입자 크기 - 거친 필름 질감'),
  colourChrome: z.enum(effects).default('OFF').describe('Colour Chrome - 채도, 색상 깊이와 풍부함'),
  colourChromeFXBlue: z.enum(effects).default('OFF').describe('Colour Chrome Blue - 파란색 계열 강조'),
  whiteBalance: z.string().describe('White Balance - 색온도 자동 조정'),
  shiftRed: z.number().int().min(-9).max(9).default(0).describe('Red 시프트 값 - 따뜻한 톤 조절'),
  shiftBlue: z.number().int().min(-9).max(9).default(0).describe('Blue 시프트 값 - 차가운 톤 조절'),
  highlight: z.number().int().min(-2).max(4).default(0).describe('Highlight - 밝은 영역 디테일 보존'),
  shadow: z.number().int().min(-2).max(4).default(0).describe('Shadow - 어두운 영역 디테일 보존'),
  color: z.number().int().min(-4).max(4).default(0).describe('Color 채도 - 색상 생생함과 선명도'),
  clarity: z.number().int().min(-4).max(4).default(0).describe('Clarity 명료도 - 중간톤 대비 조절, 이미지의 질감(Texture)과 입체감(Depth)을 향상'),
  sharpness: z.number().int().min(-2).max(4).default(0).describe('Sharpness 선명도 - 이미지의 윤곽선(Edges)과 경계의 대비를 조절하여 이미지를 더 또렷하게 보이게 하는 기능'),
  noiseReduction: z.number().int().min(-4).max(4).default(0).describe('Noise Reduction - 디지털 노이즈 제거'),
});

// Enhanced camera information schema based on cameras.json
export const CameraInfoDetailedSchema = z.object({
  id: z.string().describe('Unique camera identifier'),
  model: z.string().describe('Camera model name'),
  sensor: SensorTypeSchema.describe('Sensor type'),
  announced: z.string().describe('Announcement period'),
  supportedSimulations: z.array(z.string()).describe('Supported film simulations'),
  additionalFeatures: z.array(z.string()).optional().describe('Additional camera features'),
});

// Recipe metadata schema for unified recipes
export const RecipeMetadataSchema = z.object({
  camera: CameraModelSchema.describe('Camera model'),
  sensor: SensorTypeSchema.describe('Sensor type'),
  colorType: ColorOrBwSchema.describe('Color or B&W recipe'),
  filmSimulation: z.string().describe('Base film simulation'),
  name: z.string().describe('Recipe name'),
  creator: z.string().optional().describe('Recipe creator'),
  published: z.string().optional().describe('Publication date'),
  url: z.string().optional().describe('Recipe URL'),
});

// Unified recipe schema
export const UnifiedRecipeSchema = z.object({
  metadata: RecipeMetadataSchema,
  settings: UnifiedFujiSettingsSchema,
  id: z.string().optional().describe('Recipe identifier'),
  createdAt: z.string().optional().describe('Creation timestamp'),
  updatedAt: z.string().optional().describe('Update timestamp'),
});

// Conversion utilities
export const convertAIToUnified = (aiSettings: z.infer<typeof FujifilmSettingsSchema>): z.infer<typeof UnifiedFujiSettingsSchema> => {
  return {
    filmSimulation: aiSettings.filmSimulation,
    iso: aiSettings.iso,
    exposure: aiSettings.exposure,
    dynamicRange: aiSettings.dynamicRange,
    priority: aiSettings.priority,
    tone: {
      highlight: aiSettings.highlight,
      shadow: aiSettings.shadow,
    },
    color: aiSettings.color,
    sharpness: aiSettings.sharpness,
    clarity: aiSettings.clarity,
    noiseReduction: aiSettings.noiseReduction,
    grain: {
      effect: aiSettings.grainEffect,
      size: aiSettings.grainSize,
    },
    colorChrome: {
      effect: aiSettings.colourChrome,
      fxBlue: aiSettings.colourChromeFXBlue,
    },
    whiteBalance: {
      type: aiSettings.whiteBalance,
      shift: {
        red: aiSettings.shiftRed,
        blue: aiSettings.shiftBlue,
      },
      k: 5500, // Default value, would need to be parsed from whiteBalance string
    },
    bwAdjustment: 0, // Default value, not present in AI format
  };
};

export const convertUnifiedToAI = (unifiedSettings: z.infer<typeof UnifiedFujiSettingsSchema>): z.infer<typeof FujifilmSettingsSchema> => {
  return {
    filmSimulation: unifiedSettings.filmSimulation,
    iso: typeof unifiedSettings.iso === 'string' ? unifiedSettings.iso : `${unifiedSettings.iso.value}`,
    exposure: typeof unifiedSettings.exposure === 'string' ? unifiedSettings.exposure : `${unifiedSettings.exposure}`,
    dynamicRange: unifiedSettings.dynamicRange,
    priority: unifiedSettings.priority,
    grainEffect: unifiedSettings.grain.effect,
    grainSize: unifiedSettings.grain.size,
    colourChrome: unifiedSettings.colorChrome.effect,
    colourChromeFXBlue: unifiedSettings.colorChrome.fxBlue,
    whiteBalance: unifiedSettings.whiteBalance.type,
    shiftRed: unifiedSettings.whiteBalance.shift.red,
    shiftBlue: unifiedSettings.whiteBalance.shift.blue,
    highlight: unifiedSettings.tone.highlight,
    shadow: unifiedSettings.tone.shadow,
    color: unifiedSettings.color,
    clarity: unifiedSettings.clarity,
    sharpness: unifiedSettings.sharpness,
    noiseReduction: unifiedSettings.noiseReduction,
  };
};

export type SensorType = z.infer<typeof SensorTypeSchema>;
export type CameraModel = z.infer<typeof CameraModelSchema>;
export type ColorOrBw = z.infer<typeof ColorOrBwSchema>;
export type SensorCameraMapping = z.infer<typeof SensorCameraMappingSchema>;
export type CameraInfo = z.infer<typeof CameraInfoSchema>;
export type CameraInfoDetailed = z.infer<typeof CameraInfoDetailedSchema>;
export type RecipeMetadata = z.infer<typeof RecipeMetadataSchema>;
export type UnifiedRecipe = z.infer<typeof UnifiedRecipeSchema>;
export type UnifiedFujiSettings = z.infer<typeof UnifiedFujiSettingsSchema>;
export type FilmSimulationType = z.infer<typeof FilmSimulatioSchema>;

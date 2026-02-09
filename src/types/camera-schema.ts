import { z } from 'zod';

// 색상 구분 값들
export const COLOR_TYPES = ['Color', 'B&W'] as const;

// 센서-카메라 매핑 데이터
export const SENSOR_CAMERA_MAPPINGS = [
  {
    sensor: 'BAYER (type unknown)' as const,
    cameras: ['X100', 'XT200'] as const,
    series: 'X',
    level: 0,
  },
  {
    sensor: 'BAYER MF 50MP' as const,
    cameras: ['GFX 50S'] as const,
    series: 'GFX',
    level: 0,
  },
  {
    sensor: 'BAYER MF 100MP' as const,
    cameras: ['GFX 100s'] as const,
    series: 'GFX',
    level: 1,
  },
  {
    sensor: 'X-Trans I' as const,
    cameras: ['X-E1', 'X-M1', 'X-PRO1'] as const,
    series: 'X',
    level: 1,
  },
  {
    sensor: 'X-Trans II' as const,
    cameras: ['X100s', 'X100T', 'X70', 'X-E2', 'X-E2s', 'X-T1'] as const,
    series: 'X',
    level: 2,
  },
  {
    sensor: 'X-Trans II 2/3' as const,
    cameras: ['XQ1'] as const,
    series: 'X',
    level: 2,
  },
  {
    sensor: 'X-Trans III' as const,
    cameras: [
      'X100F',
      'X-E3',
      'XF10',
      'X-H1',
      'X-PRO2',
      'X-T2',
      'XT20',
    ] as const,
    series: 'X',
    level: 3,
  },
  {
    sensor: 'X-Trans IV' as const,
    cameras: [
      'X100v',
      'X100V',
      'X-E4',
      'X-PRO3',
      'X-S10',
      'X-T3',
      'X-T30',
      'X-T4',
    ] as const,
    series: 'X',
    level: 4,
  },
  {
    sensor: 'X-Trans V BSI Stkd' as const,
    cameras: ['X-H2s'] as const,
    series: 'X',
    level: 5,
  },
  {
    sensor: 'X-Trans V HR' as const,
    cameras: ['X-H2', 'X-T5', 'X100VI', 'X-M5'] as const,
    series: 'X',
    level: 5,
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

// 필름 시뮬레이션 타입 정의 - film-recipes.csv에서 추출한 실제 데이터 기반
export const FilmSimulations = [
  'Provia',
  'Astia',
  'Classic Chrome',
  'Classic Negative',
  'Reala Ace',
  'Eterna',
  'Eterna Bleach Bypass',
  'Nostalgic Neg.',
  'Pro Neg. High',
  'Pro Neg. Std',
  'Velvia',
  'Acros',
  'Monochrome',
  'Sepia',
] as const;

export const FilmSimulatioSchema = z
  .enum(FilmSimulations)
  .default('Provia')
  .describe('필름 시뮬레이션 타입');

export const sizes = ['OFF', 'SMALL', 'LARGE', 'Off', 'Small', 'Large'] as const;
export const effects = ['OFF', 'WEAK', 'STRONG', 'Off', 'Weak', 'Strong'] as const;
export const dynamicRanges = [
  'AUTO',
  'DR100%',
  'DR200%',
  'DR400%',
  'DR100',
  'DR200',
  'DR400',
  'Auto',
] as const;
export const priorities = ['AUTO', 'Auto', ...effects] as const;

// 후지필름 레시피 세팅 스키마 - Groq 호환성을 위해 모든 필드 optional + string 완화
export const FujifilmSettingsSchema = z.object({
  // 필름 시뮬레이션
  filmSimulation: z.string().optional().default('Provia'),

  // 기본 이미지 설정
  iso: z.string().optional().default('Auto'),
  exposure: z.string().optional().default('0'),
  dynamicRange: z.string().optional().default('AUTO'),
  priority: z.string().optional().default('AUTO'),

  // 그레인 및 텍스처
  grainEffect: z.string().optional().default('OFF'),
  grainSize: z.string().optional().default('OFF'),

  // 컬러 크롬 효과
  colourChrome: z.string().optional().default('OFF'),
  colourChromeFXBlue: z.string().optional().default('OFF'),

  // 화이트 밸런스
  whiteBalance: z.string().optional().default('Auto'),
  shiftRed: z.coerce.number().optional().default(0),
  shiftBlue: z.coerce.number().optional().default(0),

  // 하이라이트/섀도우
  highlight: z.coerce.number().optional().default(0),
  shadow: z.coerce.number().optional().default(0),

  // 색상 및 선명도
  color: z.coerce.number().optional().default(0),
  clarity: z.coerce.number().optional().default(0),
  sharpness: z.coerce.number().optional().default(0),

  // 노이즈 감소
  noiseReduction: z.coerce.number().optional().default(0),
});

export type SensorType = z.infer<typeof SensorTypeSchema>;
export type CameraModel = z.infer<typeof CameraModelSchema>;
export type ColorOrBw = z.infer<typeof ColorOrBwSchema>;
export type SensorCameraMapping = z.infer<typeof SensorCameraMappingSchema>;
export type CameraInfo = z.infer<typeof CameraInfoSchema>;
export type FilmSimulationType = z.infer<typeof FilmSimulatioSchema>;

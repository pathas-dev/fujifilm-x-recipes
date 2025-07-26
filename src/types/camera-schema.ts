import { z } from "zod";

// 색상 구분 값들
export const COLOR_TYPES = ["Color", "B&W"] as const;

// 센서-카메라 매핑 데이터
export const SENSOR_CAMERA_MAPPINGS = [
  {
    sensor: "BAYER (type unknown)" as const,
    cameras: ["X100", "XT200", "XT200"] as const,
  },
  { sensor: "BAYER MF 100MP" as const, cameras: ["GFX 100s"] as const },
  { sensor: "BAYER MF 50MP" as const, cameras: ["GFX 50S"] as const },
  {
    sensor: "X-Trans I" as const,
    cameras: ["X-E1", "X-M1", "X-PRO1"] as const,
  },
  {
    sensor: "X-Trans II" as const,
    cameras: ["X100s", "X100T", "X70", "X-E2", "X-E2s", "X-T1"] as const,
  },
  { sensor: "X-Trans II 2/3" as const, cameras: ["XQ1"] as const },
  {
    sensor: "X-Trans III" as const,
    cameras: [
      "X100F",
      "XE3",
      "XF10",
      "X-H1",
      "X-PRO2",
      "X-T2",
      "XT20",
    ] as const,
  },
  {
    sensor: "X-Trans IV" as const,
    cameras: [
      "X100v",
      "X100V",
      "X-E4",
      "X-PRO3",
      "X-Pro3",
      "X-S10",
      "X-T3",
      "X-T30",
      "X-T4",
    ] as const,
  },
  { sensor: "X-Trans V BSI Stkd" as const, cameras: ["X-H2s"] as const },
  {
    sensor: "X-Trans V HR" as const,
    cameras: ["X-H2", "X-T5", "X100VI", "X-M5"] as const,
  },
] as const;

export const SENSOR_TYPES = SENSOR_CAMERA_MAPPINGS.flatMap(
  ({ sensor, cameras }) => sensor
);

// 카메라 모델 값들
export const CAMERA_MODELS = SENSOR_CAMERA_MAPPINGS.flatMap(
  ({ sensor, cameras }) => cameras
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
  "Provia",
  "Astia",
  "Classic Chrome",
  "Classic Negative",
  "Reala Ace",
  "Eterna",
  "Eterna Bleach Bypass",
  "Nostalgic Neg.",
  "Pro Neg. High",
  "Pro Neg. Std",
  "Velvia",
  "Acros",
  "Monochrome",
] as const;

export const FilmSimulatioSchema = z
  .enum(FilmSimulations)
  .default("Provia")
  .describe("필름 시뮬레이션 타입");

export const sizes = ["OFF", "SMALL", "LARGE"] as const;
export const effects = ["OFF", "WEAK", "STRONG"] as const;
export const dynamicRanges = ["AUTO", "DR100%", "DR200%", "DR400%"] as const;
export const priorities = ["AUTO", ...effects] as const;

// 후지필름 레시피 세팅 스키마 - parse.ts의 모든 설정 항목 포함
export const FujifilmSettingsSchema = z.object({
  // 필름 시뮬레이션 - enum으로 제한
  filmSimulation: FilmSimulatioSchema,

  // 기본 이미지 설정
  iso: z.string().describe("ISO - 이미지 감도 설정"),
  exposure: z.string().default("0").describe("Exposure - 노출 설정"),
  dynamicRange: z
    .enum(dynamicRanges)
    .default("AUTO")
    .describe("Dynamic Range - 넓은 계조와 디테일 보존"),
  priority: z
    .enum(priorities)
    .default("AUTO")
    .describe("Priority - 센서 원본 데이터 활용 설정"),

  // 그레인 및 텍스처
  grainEffect: z
    .enum(effects)
    .default("OFF")
    .describe("Grain 효과 강도 - 필름 아날로그 질감"),
  grainSize: z
    .enum(sizes)
    .default("OFF")
    .describe("Grain 입자 크기 - 거친 필름 질감"),

  // 컬러 크롬 효과
  colourChrome: z
    .enum(effects)
    .default("OFF")
    .describe("Colour Chrome - 채도, 색상 깊이와 풍부함"),
  colourChromeFXBlue: z
    .enum(effects)
    .default("OFF")
    .describe("Colour Chrome Blue - 파란색 계열 강조"),

  // 화이트 밸런스
  whiteBalance: z.string().describe("White Balance - 색온도 자동 조정"),
  shiftRed: z
    .number()
    .int()
    .min(-9)
    .max(9)
    .default(0)
    .describe("Red 시프트 값 - 따뜻한 톤 조절"),
  shiftBlue: z
    .number()
    .int()
    .min(-9)
    .max(9)
    .default(0)
    .describe("Blue 시프트 값 - 차가운 톤 조절"),

  // 하이라이트/섀도우
  highlight: z
    .number()
    .int()
    .min(-2)
    .max(4)
    .default(0)
    .describe("Highlight - 밝은 영역 디테일 보존"),
  shadow: z
    .number()
    .int()
    .min(-2)
    .max(4)
    .default(0)
    .describe("Shadow - 어두운 영역 디테일 보존"),

  // 색상 및 선명도
  color: z
    .number()
    .int()
    .min(-4)
    .max(4)
    .default(0)
    .describe("Color 채도 - 색상 생생함과 선명도"),
  clarity: z
    .number()
    .int()
    .min(-4)
    .max(4)
    .default(0)
    .describe(
      "Clarity 명료도 - 중간톤 대비 조절, 이미지의 질감(Texture)과 입체감(Depth)을 향상"
    ),
  sharpness: z
    .number()
    .int()
    .min(-2)
    .max(4)
    .default(0)
    .describe(
      "Sharpness 선명도 - 이미지의 윤곽선(Edges)과 경계의 대비를 조절하여 이미지를 더 또렷하게 보이게 하는 기능"
    ),

  // 노이즈 감소
  noiseReduction: z
    .number()
    .int()
    .min(-4)
    .max(4)
    .default(0)
    .describe("Noise Reduction - 디지털 노이즈 제거"),
});

export type SensorType = z.infer<typeof SensorTypeSchema>;
export type CameraModel = z.infer<typeof CameraModelSchema>;
export type ColorOrBw = z.infer<typeof ColorOrBwSchema>;
export type SensorCameraMapping = z.infer<typeof SensorCameraMappingSchema>;
export type CameraInfo = z.infer<typeof CameraInfoSchema>;
export type FilmSimulationType = z.infer<typeof FilmSimulatioSchema>;

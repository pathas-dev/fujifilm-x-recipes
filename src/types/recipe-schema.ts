import { z } from "zod";

// 필름 시뮬레이션 타입 정의 - film-recipes.csv에서 추출한 실제 데이터 기반
export const FilmSimulationTypes = [
  "Provia",
  "Astia",
  "Classic Chrome",
  "Classic Negative",
  "Reala Ace",
  "Eterna",
  "Eterna Bleach Bypass",
  "Nostalgic Negative",
  "Pro Neg. High",
  "Pro Neg. Std",
  "Velvia",
  "Acros",
  "Monochrome",
  "Unknown",
] as const;

// 후지필름 레시피 세팅 스키마 - parse.ts의 모든 설정 항목 포함
export const FujifilmSettingsSchema = z.object({
  // 필름 시뮬레이션 - enum으로 제한
  filmSimulation: z
    .enum(FilmSimulationTypes)
    .describe("필름 시뮬레이션 - CSV 데이터에서 추출한 실제 사용되는 타입들"),

  // 기본 이미지 설정
  dynamicRange: z.string().describe("Dynamic Range - 넓은 계조와 디테일 보존"),
  priority: z.string().describe("Priority - 센서 원본 데이터 활용 설정"),

  // 그레인 및 텍스처
  grainEffect: z.string().describe("Grain 효과 강도 - 필름 아날로그 질감"),
  grainSize: z.string().describe("Grain 입자 크기 - 거친 필름 질감"),

  // 컬러 크롬 효과
  colourChrome: z.string().describe("Colour Chrome - 색상 깊이와 풍부함"),
  colourChromeBlue: z
    .string()
    .describe("Colour Chrome Blue - 파란색 계열 강조"),
  colourChromeRed: z.string().describe("Colour Chrome Red - 붉은색 계열 강조"),

  // 화이트 밸런스
  whiteBalance: z.string().describe("White Balance - 색온도 자동 조정"),
  shiftRed: z.number().describe("Red 시프트 값 - 따뜻한 톤 조절"),
  shiftBlue: z.number().describe("Blue 시프트 값 - 차가운 톤 조절"),

  // 하이라이트/섀도우
  highlight: z.number().describe("Highlight - 밝은 영역 디테일 보존"),
  shadow: z.number().describe("Shadow - 어두운 영역 디테일 보존"),

  // 색상 및 선명도
  color: z.number().describe("Color 채도 - 색상 생생함과 선명도"),
  clarity: z.number().describe("Clarity 선명도 - 중간톤 대비 조절"),

  // 노이즈 감소
  noiseReduction: z.number().describe("Noise Reduction - 디지털 노이즈 제거"),
});

// 단일 레시피 스키마
export const RecipeSchema = z.object({
  title: z.string().describe("레시피 제목"),
  baseFilmSimulation: z.string().describe("베이스 필름 시뮬레이션"),
  recommendationReason: z.string().describe("추천 이유"),
  settings: FujifilmSettingsSchema.describe("후지필름 카메라 세팅 정보"),
});

// 단일 레시피 스키마
export const RetrievedRecipeSchema = z
  .object({
    url: z.string().optional().describe("레시피 URL (실제 레시피인 경우)"),
  })
  .extend(RecipeSchema.shape);
// 단일 레시피 스키마
export const GeneratedByAIRecipeSchema = z
  .object({
    sourceImage: z
      .string()
      .optional()
      .describe("원본 이미지 Base64 데이터 URL"),
    retouchedImage: z
      .string()
      .optional()
      .describe("보정된 이미지 Base64 데이터 URL"),
  })
  .extend(RecipeSchema.shape);

// 큐레이터 응답 전체 스키마
export const CuratorResponseSchema = z.object({
  recipes: z.object({
    retrieved: RetrievedRecipeSchema,
    generated: GeneratedByAIRecipeSchema,
  }),
});

// 타입 추출
export type FilmSimulationType = (typeof FilmSimulationTypes)[number];
export type FujifilmSettings = z.infer<typeof FujifilmSettingsSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type CuratorResponse = z.infer<typeof CuratorResponseSchema>;

import { FujifilmSettingsSchema } from "@/types/camera-schema";
import { z } from "zod";

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

export type FujifilmSettings = z.infer<typeof FujifilmSettingsSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type RetrievedRecipe = z.infer<typeof RetrievedRecipeSchema>;
export type GeneratedByAIRecipe = z.infer<typeof GeneratedByAIRecipeSchema>;
export type CuratorResponse = z.infer<typeof CuratorResponseSchema>;

import { z } from "zod";
import { FilmSimulationTypes } from "@/types/recipe-schema";

// 센서 타입 정의
export const SensorTypeSchema = z.enum([
  "BAYER (type unknown)",
  "BAYER MF 100MP",
  "BAYER MF 50MP",
  "X-Trans I",
  "X-Trans II",
  "X-Trans II 2/3",
  "X-Trans III",
  "X-Trans IV",
  "X-Trans V BSI Stkd",
  "X-Trans V HR",
]);

// 카메라 모델 정의
export const CameraModelSchema = z.enum([
  // BAYER (type unknown)
  "X100",
  "Xt200",
  "XT200",
  // BAYER MF 100MP
  "GFX 100s",
  // BAYER MF 50MP
  "GFX 50S",
  // X-Trans I
  "X-E1",
  "X-M1",
  "X-PRO1",
  "X-Pro1",
  // X-Trans II
  "X100s",
  "X100T",
  "X70",
  "X-E2",
  "X-E2s",
  "X-T1",
  // X-Trans II 2/3
  "XQ1",
  // X-Trans III
  "X100F",
  "XE3",
  "XF10",
  "X-H1",
  "X-PRO2",
  "X-T2",
  "XT20",
  // X-Trans IV
  "X100v",
  "X100V",
  "X-E4",
  "X-PRO3",
  "X-Pro3",
  "X-S10",
  "X-T3",
  "X-T30",
  "X-T4",
  // X-Trans V BSI Stkd
  "X-H2s",
  // X-Trans V HR
  "X-H2",
  "X-T5",
]);

// 색상 구분 정의
export const ColorOrBwSchema = z.enum(["Color", "B&W"]);

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

// 질문 분석 결과 스키마
export const QuestionAnalysisSchema = z.object({
  detectedCameras: CameraModelSchema.optional(),
  detectedSensorTypes: SensorTypeSchema.optional(),
  colorOrBw: ColorOrBwSchema.optional(),
  filmSimulation: z.enum(FilmSimulationTypes).optional(),
  isFilmRecipeQuestion: z.boolean(),
  rejectionReason: z.string().optional(),
});

export type SensorType = z.infer<typeof SensorTypeSchema>;
export type CameraModel = z.infer<typeof CameraModelSchema>;
export type ColorOrBw = z.infer<typeof ColorOrBwSchema>;
export type SensorCameraMapping = z.infer<typeof SensorCameraMappingSchema>;
export type CameraInfo = z.infer<typeof CameraInfoSchema>;
export type QuestionAnalysis = z.infer<typeof QuestionAnalysisSchema>;

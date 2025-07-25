import { z } from "zod";
import { FilmSimulationTypes } from "@/types/recipe-schema";
import { 
  SensorTypeSchema, 
  CameraModelSchema, 
  ColorOrBwSchema,
  type SensorType,
  type CameraModel,
  type ColorOrBw,
  type SensorCameraMapping,
  type CameraInfo,
} from "@/types/camera-schema";

// 질문 분석 결과 스키마
export const QuestionAnalysisSchema = z.object({
  detectedCameras: CameraModelSchema.optional(),
  detectedSensorTypes: SensorTypeSchema.optional(),
  colorOrBw: ColorOrBwSchema.optional(),
  filmSimulation: z.enum(FilmSimulationTypes).optional(),
  enhancedQuestion: z.string().optional(),
  isFilmRecipeQuestion: z.boolean(),
  rejectionReason: z.string().optional(),
});

// Re-export types for backward compatibility
export type { SensorType, CameraModel, ColorOrBw, SensorCameraMapping, CameraInfo };
export type QuestionAnalysis = z.infer<typeof QuestionAnalysisSchema>;

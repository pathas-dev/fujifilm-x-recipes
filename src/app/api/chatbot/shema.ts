import {
  type CameraInfo,
  type CameraModel,
  type ColorOrBw,
  ColorOrBwSchema,
  FilmSimulatioSchema,
  type SensorCameraMapping,
  type SensorType,
} from '@/types/camera-schema';
import { z } from 'zod';

// 질문 분석 결과 스키마
export const QuestionAnalysisSchema = z.object({
  colorOrBw: ColorOrBwSchema.default('Color'),
  filmSimulations: z.array(FilmSimulatioSchema).optional(),
  enhancedQuestion: z.string().optional(),
  isFilmRecipeQuestion: z.boolean(),
  rejectionReason: z.string().optional(),
});

export type {
  CameraInfo,
  CameraModel,
  ColorOrBw,
  SensorCameraMapping,
  SensorType,
};
export type QuestionAnalysis = z.infer<typeof QuestionAnalysisSchema>;

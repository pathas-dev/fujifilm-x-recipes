import { z } from "zod";

// 센서 타입 값들
export const SENSOR_TYPES = [
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
] as const;

// 카메라 모델 값들
export const CAMERA_MODELS = [
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
] as const;

// 색상 구분 값들
export const COLOR_TYPES = ["Color", "B&W"] as const;

// 센서-카메라 매핑 데이터
export const SENSOR_CAMERA_MAPPINGS = [
  { sensor: "BAYER (type unknown)" as const, cameras: ["X100", "Xt200", "XT200"] as const },
  { sensor: "BAYER MF 100MP" as const, cameras: ["GFX 100s"] as const },
  { sensor: "BAYER MF 50MP" as const, cameras: ["GFX 50S"] as const },
  { sensor: "X-Trans I" as const, cameras: ["X-E1", "X-M1", "X-PRO1", "X-Pro1"] as const },
  { sensor: "X-Trans II" as const, cameras: ["X100s", "X100T", "X70", "X-E2", "X-E2s", "X-T1"] as const },
  { sensor: "X-Trans II 2/3" as const, cameras: ["XQ1"] as const },
  { sensor: "X-Trans III" as const, cameras: ["X100F", "XE3", "XF10", "X-H1", "X-PRO2", "X-T2", "XT20"] as const },
  { sensor: "X-Trans IV" as const, cameras: ["X100v", "X100V", "X-E4", "X-PRO3", "X-Pro3", "X-S10", "X-T3", "X-T30", "X-T4"] as const },
  { sensor: "X-Trans V BSI Stkd" as const, cameras: ["X-H2s"] as const },
  { sensor: "X-Trans V HR" as const, cameras: ["X-H2", "X-T5"] as const },
] as const;

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

// 타입 추출
export type SensorType = z.infer<typeof SensorTypeSchema>;
export type CameraModel = z.infer<typeof CameraModelSchema>;
export type ColorOrBw = z.infer<typeof ColorOrBwSchema>;
export type SensorCameraMapping = z.infer<typeof SensorCameraMappingSchema>;
export type CameraInfo = z.infer<typeof CameraInfoSchema>;
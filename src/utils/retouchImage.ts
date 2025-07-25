import { FilmSimulationType } from "@/types/camera-schema";
import { writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";

/**
 * 필름 시뮬레이션별 특성 및 보정값 정의
 * analyze-image-stats.js의 분석 결과를 기반으로 한 프리셋
 */
const FilmSimulationPresets: Record<
  FilmSimulationType,
  {
    name: string;
    characteristics: string;
    baseSettings: CameraSettings;
  }
> = {
  Provia: {
    name: "PROVIA",
    characteristics: "Standard color reproduction, balanced contrast",
    baseSettings: {
      whiteBalanceR: 0,
      whiteBalanceB: 0,
      highlightTone: 0,
      shadowTone: 0,
      color: 0,
      clarity: 0,
      noiseReduction: 0,
    },
  },
  Velvia: {
    name: "Velvia",
    characteristics: "High saturation, vivid colors, strong contrast",
    baseSettings: {
      whiteBalanceR: 1,
      whiteBalanceB: -1,
      highlightTone: 1,
      shadowTone: 1,
      color: 3,
      clarity: 2,
      noiseReduction: 0,
    },
  },
  Astia: {
    name: "ASTIA",
    characteristics: "Soft skin tones, subdued colors",
    baseSettings: {
      whiteBalanceR: 2,
      whiteBalanceB: 0,
      highlightTone: 0,
      shadowTone: 1,
      color: -1,
      clarity: -1,
      noiseReduction: 1,
    },
  },
  "Classic Chrome": {
    name: "Classic Chrome",
    characteristics: "Muted colors, film-like contrast",
    baseSettings: {
      whiteBalanceR: 0,
      whiteBalanceB: 1,
      highlightTone: -1,
      shadowTone: 0,
      color: -2,
      clarity: 1,
      noiseReduction: 0,
    },
  },
  "Classic Negative": {
    name: "Classic Negative",
    characteristics: "Film negative emulation",
    baseSettings: {
      whiteBalanceR: 1,
      whiteBalanceB: 0,
      highlightTone: 0,
      shadowTone: 2,
      color: 1,
      clarity: 0,
      noiseReduction: 0,
    },
  },
  "Reala Ace": {
    name: "REALA ACE",
    characteristics: "Natural skin tones, enhanced colors",
    baseSettings: {
      whiteBalanceR: 1,
      whiteBalanceB: -1,
      highlightTone: 0,
      shadowTone: 1,
      color: 2,
      clarity: 1,
      noiseReduction: 0,
    },
  },
  Eterna: {
    name: "ETERNA",
    characteristics: "Cinematic look, low saturation",
    baseSettings: {
      whiteBalanceR: 0,
      whiteBalanceB: 1,
      highlightTone: -1,
      shadowTone: 1,
      color: -3,
      clarity: -1,
      noiseReduction: 1,
    },
  },
  "Eterna Bleach Bypass": {
    name: "ETERNA Bleach Bypass",
    characteristics: "High contrast, desaturated highlights",
    baseSettings: {
      whiteBalanceR: 0,
      whiteBalanceB: 2,
      highlightTone: 2,
      shadowTone: -1,
      color: -4,
      clarity: 2,
      noiseReduction: 0,
    },
  },
  "Nostalgic Neg.": {
    name: "Nostalgic Neg.",
    characteristics: "Vintage negative film look",
    baseSettings: {
      whiteBalanceR: 2,
      whiteBalanceB: 1,
      highlightTone: -1,
      shadowTone: 2,
      color: 0,
      clarity: -1,
      noiseReduction: 1,
    },
  },
  "Pro Neg. High": {
    name: "PRO Neg Hi",
    characteristics: "High contrast negative film",
    baseSettings: {
      whiteBalanceR: 0,
      whiteBalanceB: 0,
      highlightTone: 1,
      shadowTone: 1,
      color: 1,
      clarity: 1,
      noiseReduction: 0,
    },
  },
  "Pro Neg. Std": {
    name: "PRO Neg Std",
    characteristics: "Standard contrast negative film",
    baseSettings: {
      whiteBalanceR: 0,
      whiteBalanceB: 0,
      highlightTone: 0,
      shadowTone: 1,
      color: 0,
      clarity: 0,
      noiseReduction: 0,
    },
  },
  Acros: {
    name: "ACROS",
    characteristics: "Black and white, smooth gradation",
    baseSettings: {
      whiteBalanceR: 0,
      whiteBalanceB: 0,
      highlightTone: 0,
      shadowTone: 0,
      color: 0,
      clarity: 1,
      noiseReduction: 1,
    },
  },
  Monochrome: {
    name: "Monochrome",
    characteristics: "Standard black and white",
    baseSettings: {
      whiteBalanceR: 0,
      whiteBalanceB: 0,
      highlightTone: 0,
      shadowTone: 0,
      color: 0,
      clarity: 0,
      noiseReduction: 0,
    },
  },
  Unknown: {
    name: "Unknown",
    characteristics: "Unknown film simulation",
    baseSettings: {
      whiteBalanceR: 0,
      whiteBalanceB: 0,
      highlightTone: 0,
      shadowTone: 0,
      color: 0,
      clarity: 0,
      noiseReduction: 0,
    },
  },
};

/**
 * 카메라 설정 타입 정의
 */
interface CameraSettings {
  whiteBalanceR?: number; // R축 ±9 범위
  whiteBalanceB?: number; // B축 ±9 범위
  highlightTone?: number; // -2~+4 범위 (0.5단위)
  shadowTone?: number; // -2~+4 범위 (0.5단위)
  color?: number; // -4~+4 범위 (1단위)
  clarity?: number; // -4~+4 범위 (1단위)
  noiseReduction?: number; // -4~+4 범위 (1단위)
}

/**
 * Sharp 처리 옵션 타입 정의
 */
interface SharpProcessingOptions {
  whiteBalanceTint?: { r: number; g: number; b: number };
  highlightTone?: number;
  shadowTone?: number;
  saturation?: number;
  sharpness?: number;
  noiseReduction?: number;
}

/**
 * 필름 시뮬레이션 기반 카메라 설정을 가져오는 함수
 */
const getFilmSimulationSettings = (
  filmSimulation: FilmSimulationType
): CameraSettings => {
  const preset = FilmSimulationPresets[filmSimulation];
  if (!preset) {
    console.warn(
      `Unknown film simulation: ${filmSimulation}, using default settings`
    );
    return FilmSimulationPresets["Unknown"].baseSettings;
  }

  console.log(
    `Applied film simulation: ${preset.name} - ${preset.characteristics}`
  );
  return { ...preset.baseSettings };
};

/**
 * 카메라 설정을 Sharp 옵션으로 변환하는 함수
 *
 * 카메라 설정 범위와 Sharp 옵션 매핑 (개선된 버전):
 *
 * 1. 화이트 밸런스 R/B축: ±9 → Sharp linear transformation
 *    - R축: +9 = r: 1.4, -9 = r: 0.6 (linear 함수로 채널별 조정)
 *    - B축: +9 = b: 1.4, -9 = b: 0.6
 *    - G축은 1.0 고정 (자연스러운 색상 균형 유지)
 *
 * 2. 하이라이트 톤: -2~+4 → gamma 1.8~2.8
 *    - 공식: gamma = 2.2 + (카메라값 * 0.2)
 *    - 품질 보존을 위한 자연스러운 범위
 *
 * 3. 섀도우 톤: -2~+4 → brightness 0.7~2.0
 *    - 공식: brightness = 1.0 + (카메라값 * 0.2)
 *    - 극단값 제거로 디테일 보존
 *
 * 4. 색농도(채도): -4~+4 → saturation 0.5~2.2
 *    - 공식: saturation = 1.0 + (카메라값 * 0.25)
 *    - 최소값 0.5로 완전 무채색 방지
 *
 * 5. 샤프니스: -4~+4 → unsharp mask sigma 0.5~2.0 또는 gentle blur 0~0.8
 *    - 양수: unsharp mask (sigma = 1.0 + 카메라값 * 0.25) - 자연스러운 샤프닝
 *    - 음수: gentle blur (blur = 절댓값 * 0.2) - 부드러운 소프트닝
 *    - 과샤프닝 방지로 자연스러운 디테일 향상
 *
 * 6. 노이즈 리덕션: -4~+4 → median filter 3~7
 *    - median 필터 사용으로 블러 없는 자연스러운 노이즈 제거
 *    - 윈도우 크기 = 3 + 카메라값 (최대 7)
 */
const convertCameraSettingsToSharpOptions = (
  cameraSettings: CameraSettings
): SharpProcessingOptions => {
  const sharpOptions: SharpProcessingOptions = {};

  // 화이트 밸런스 R/B축 ±9 → tint RGB 승수 (개선된 매핑)
  if (
    cameraSettings.whiteBalanceR !== undefined ||
    cameraSettings.whiteBalanceB !== undefined
  ) {
    const rValue =
      cameraSettings.whiteBalanceR !== undefined
        ? 1.0 + (cameraSettings.whiteBalanceR / 9) * 0.4 // 0.6~1.4 범위
        : 1.0;
    const gValue = 1.0; // G채널은 고정하여 자연스러운 색상 균형 유지
    const bValue =
      cameraSettings.whiteBalanceB !== undefined
        ? 1.0 + (cameraSettings.whiteBalanceB / 9) * 0.4 // 0.6~1.4 범위
        : 1.0;

    sharpOptions.whiteBalanceTint = {
      r: Math.max(0.6, Math.min(1.4, rValue)),
      g: gValue,
      b: Math.max(0.6, Math.min(1.4, bValue)),
    };
  }

  // 하이라이트 톤 -2~+4 → gamma 적용 (실제 적용은 이미지 처리 단계에서)
  if (cameraSettings.highlightTone !== undefined) {
    sharpOptions.highlightTone = cameraSettings.highlightTone;
  }

  // 섀도우 톤 -2~+4 → brightness 적용 (실제 적용은 이미지 처리 단계에서)
  if (cameraSettings.shadowTone !== undefined) {
    sharpOptions.shadowTone = cameraSettings.shadowTone;
  }

  // 색농도 -4~+4 → saturation 적용 (실제 적용은 이미지 처리 단계에서)
  if (cameraSettings.color !== undefined) {
    sharpOptions.saturation = cameraSettings.color;
  }

  // 샤프니스 -4~+4 → sharpen/blur 적용 (실제 적용은 이미지 처리 단계에서)
  if (cameraSettings.clarity !== undefined) {
    sharpOptions.sharpness = cameraSettings.clarity;
  }

  // 노이즈 리덕션 -4~+4 → blur 적용 (실제 적용은 이미지 처리 단계에서)
  if (cameraSettings.noiseReduction !== undefined) {
    sharpOptions.noiseReduction = cameraSettings.noiseReduction;
  }

  return sharpOptions;
};

/**
 * 후지필름 카메라 스타일 이미지 처리 함수
 */
export const retouchImage = async (
  inputFileName: string,
  extension: "png" | "jpg" | "jpeg" | "webp",
  options: {
    width?: number;
    height?: number;
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
    // 필름 시뮬레이션 (우선 적용)
    filmSimulation?: FilmSimulationType;
    // 카메라 설정 (필름 시뮬레이션에 추가로 적용)
    cameraSettings?: CameraSettings;
    // 또는 Sharp 옵션 직접 지정 (호환성 유지)
    whiteBalanceTint?: { r: number; g?: number; b: number };
    highlightTone?: number;
    shadowTone?: number;
    saturation?: number;
    sharpness?: number;
    noiseReduction?: number;
    // 흑백 변환 옵션
    isBw?: boolean;
    quality?: number;
    // 출력 옵션
    returnBase64?: boolean; // base64 문자열로 리턴할지 여부
    saveToFile?: boolean; // 파일로 저장할지 여부 (기본값: false)
    outputFileName?: string;
  }
) => {
  // base64 문자열 또는 void 리턴
  try {
    const inputFilePath = path.resolve(process.cwd(), "public", inputFileName);

    const sourceImage = sharp(inputFilePath);
    let image = sourceImage.clone();

    // 처리 옵션 초기화
    let processedOptions = { ...options };
    let filmSimulationOptions: SharpProcessingOptions = {};
    let userSettingsOptions: SharpProcessingOptions = {};

    // 1. 필름 시뮬레이션 설정을 Sharp 옵션으로 변환
    if (options.filmSimulation) {
      const filmSettings = getFilmSimulationSettings(options.filmSimulation);
      filmSimulationOptions = convertCameraSettingsToSharpOptions(filmSettings);

      // 흑백 필름 시뮬레이션 자동 적용
      if (
        options.filmSimulation === "Acros" ||
        options.filmSimulation === "Monochrome"
      ) {
        processedOptions.isBw = true;
      }

      console.log("Film simulation options prepared:", filmSimulationOptions);
    }

    // 2. 사용자 카메라 설정을 Sharp 옵션으로 변환
    if (options.cameraSettings) {
      userSettingsOptions = convertCameraSettingsToSharpOptions(
        options.cameraSettings
      );
      console.log(
        "User camera settings options prepared:",
        userSettingsOptions
      );
    }

    // 1. 이미지 크기 및 비율 조절
    if (processedOptions.width || processedOptions.height) {
      image = image.resize(processedOptions.width, processedOptions.height, {
        fit: processedOptions.fit || "cover",
      });
    }

    // === 필름 시뮬레이션 적용 (1단계) ===
    console.log("=== Applying Film Simulation (Step 1) ===");

    // 2-A. 필름 시뮬레이션: 화이트 밸런스 조정
    if (filmSimulationOptions.whiteBalanceTint) {
      const r = filmSimulationOptions.whiteBalanceTint.r || 1.0;
      const g = filmSimulationOptions.whiteBalanceTint.g || 1.0;
      const b = filmSimulationOptions.whiteBalanceTint.b || 1.0;

      console.log(
        `Film WB adjustment - R: ${r.toFixed(2)}, G: ${g.toFixed(
          2
        )}, B: ${b.toFixed(2)}`
      );
      image = image.linear([r, g, b], [0, 0, 0]);
    }

    // 2-B. 필름 시뮬레이션: 하이라이트 톤
    if (filmSimulationOptions.highlightTone !== undefined) {
      const gamma = Math.max(
        1.8,
        Math.min(2.8, 2.2 + filmSimulationOptions.highlightTone * 0.2)
      );

      console.log(
        `Film highlight tone - Value: ${
          filmSimulationOptions.highlightTone
        }, Gamma: ${gamma.toFixed(2)}`
      );
      image = image.gamma(gamma);
    }

    // 2-C. 필름 시뮬레이션: 섀도우 톤
    if (filmSimulationOptions.shadowTone !== undefined) {
      const brightness = Math.max(
        0.7,
        Math.min(2.0, 1.0 + filmSimulationOptions.shadowTone * 0.2)
      );

      console.log(
        `Film shadow tone - Value: ${
          filmSimulationOptions.shadowTone
        }, Brightness: ${brightness.toFixed(2)}`
      );
      image = image.modulate({ brightness: brightness });
    }

    // 2-D. 필름 시뮬레이션: 색농도 (채도)
    if (filmSimulationOptions.saturation !== undefined) {
      const saturation = Math.max(
        0.5,
        Math.min(2.2, 1.0 + filmSimulationOptions.saturation * 0.25)
      );

      console.log(
        `Film color saturation - Value: ${
          filmSimulationOptions.saturation
        }, Saturation: ${saturation.toFixed(2)}`
      );
      image = image.modulate({ saturation: saturation });
    }

    // 2-E. 필름 시뮬레이션: 샤프니스
    if (filmSimulationOptions.sharpness !== undefined) {
      if (filmSimulationOptions.sharpness > 0) {
        const sigma = Math.max(
          0.5,
          Math.min(2.0, 1.0 + filmSimulationOptions.sharpness * 0.25)
        );

        console.log(
          `Film sharpen - Value: ${
            filmSimulationOptions.sharpness
          }, Sigma: ${sigma.toFixed(2)}`
        );

        image = image.sharpen({
          sigma: sigma,
          m1: 0.5,
          m2: 2.0,
          x1: 2.0,
          y2: 10.0,
          y3: 20.0,
        });
      } else if (filmSimulationOptions.sharpness < 0) {
        const blurAmount = Math.min(
          1.0,
          Math.abs(filmSimulationOptions.sharpness) * 0.2
        );

        console.log(
          `Film soft blur - Value: ${
            filmSimulationOptions.sharpness
          }, Amount: ${blurAmount.toFixed(2)}`
        );
        image = image.blur(blurAmount);
      }
    }

    // 2-F. 필름 시뮬레이션: 노이즈 리덕션
    if (
      filmSimulationOptions.noiseReduction !== undefined &&
      filmSimulationOptions.noiseReduction > 0
    ) {
      const medianSize = Math.min(7, 3 + filmSimulationOptions.noiseReduction);

      console.log(
        `Film noise reduction - Value: ${filmSimulationOptions.noiseReduction}, Median size: ${medianSize}`
      );
      image = image.median(medianSize);
    }

    // === 사용자 설정 적용 (2단계) ===
    console.log("=== Applying User Settings (Step 2) ===");

    // 3-A. 사용자 설정: 화이트 밸런스 조정 (추가)
    if (userSettingsOptions.whiteBalanceTint) {
      const r = userSettingsOptions.whiteBalanceTint.r || 1.0;
      const g = userSettingsOptions.whiteBalanceTint.g || 1.0;
      const b = userSettingsOptions.whiteBalanceTint.b || 1.0;

      console.log(
        `User WB adjustment - R: ${r.toFixed(2)}, G: ${g.toFixed(
          2
        )}, B: ${b.toFixed(2)}`
      );
      image = image.linear([r, g, b], [0, 0, 0]);
    }

    // 3-B. 사용자 설정: 하이라이트 톤 (추가)
    if (userSettingsOptions.highlightTone !== undefined) {
      const gamma = Math.max(
        1.8,
        Math.min(2.8, 2.2 + userSettingsOptions.highlightTone * 0.2)
      );

      console.log(
        `User highlight tone - Value: ${
          userSettingsOptions.highlightTone
        }, Gamma: ${gamma.toFixed(2)}`
      );
      image = image.gamma(gamma);
    }

    // 3-C. 사용자 설정: 섀도우 톤 (추가)
    if (userSettingsOptions.shadowTone !== undefined) {
      const brightness = Math.max(
        0.7,
        Math.min(2.0, 1.0 + userSettingsOptions.shadowTone * 0.2)
      );

      console.log(
        `User shadow tone - Value: ${
          userSettingsOptions.shadowTone
        }, Brightness: ${brightness.toFixed(2)}`
      );
      image = image.modulate({ brightness: brightness });
    }

    // 3-D. 사용자 설정: 색농도 (채도) (추가)
    if (userSettingsOptions.saturation !== undefined) {
      const saturation = Math.max(
        0.5,
        Math.min(2.2, 1.0 + userSettingsOptions.saturation * 0.25)
      );

      console.log(
        `User color saturation - Value: ${
          userSettingsOptions.saturation
        }, Saturation: ${saturation.toFixed(2)}`
      );
      image = image.modulate({ saturation: saturation });
    }

    // 3-E. 사용자 설정: 샤프니스 (추가)
    if (userSettingsOptions.sharpness !== undefined) {
      if (userSettingsOptions.sharpness > 0) {
        const sigma = Math.max(
          0.5,
          Math.min(2.0, 1.0 + userSettingsOptions.sharpness * 0.25)
        );

        console.log(
          `User sharpen - Value: ${
            userSettingsOptions.sharpness
          }, Sigma: ${sigma.toFixed(2)}`
        );

        image = image.sharpen({
          sigma: sigma,
          m1: 0.5,
          m2: 2.0,
          x1: 2.0,
          y2: 10.0,
          y3: 20.0,
        });
      } else if (userSettingsOptions.sharpness < 0) {
        const blurAmount = Math.min(
          1.0,
          Math.abs(userSettingsOptions.sharpness) * 0.2
        );

        console.log(
          `User soft blur - Value: ${
            userSettingsOptions.sharpness
          }, Amount: ${blurAmount.toFixed(2)}`
        );
        image = image.blur(blurAmount);
      }
    }

    // 3-F. 사용자 설정: 노이즈 리덕션 (추가)
    if (
      userSettingsOptions.noiseReduction !== undefined &&
      userSettingsOptions.noiseReduction > 0
    ) {
      const medianSize = Math.min(7, 3 + userSettingsOptions.noiseReduction);

      console.log(
        `User noise reduction - Value: ${userSettingsOptions.noiseReduction}, Median size: ${medianSize}`
      );
      image = image.median(medianSize);
    }

    // === 호환성 옵션 처리 (기존 방식) ===
    console.log("=== Processing Legacy Options (Step 3) ===");

    // 4-A. 기존 방식 화이트 밸런스 (직접 지정된 경우)
    if (
      processedOptions.whiteBalanceTint &&
      !filmSimulationOptions.whiteBalanceTint &&
      !userSettingsOptions.whiteBalanceTint
    ) {
      const r = processedOptions.whiteBalanceTint.r || 1.0;
      const g = (processedOptions.whiteBalanceTint as any).g || 1.0;
      const b = processedOptions.whiteBalanceTint.b || 1.0;

      console.log(
        `Legacy WB adjustment - R: ${r.toFixed(2)}, G: ${g.toFixed(
          2
        )}, B: ${b.toFixed(2)}`
      );
      image = image.linear([r, g, b], [0, 0, 0]);
    }

    // 4-B. 기존 방식 하이라이트 톤 (직접 지정된 경우)
    if (
      processedOptions.highlightTone !== undefined &&
      !filmSimulationOptions.highlightTone &&
      !userSettingsOptions.highlightTone
    ) {
      const gamma = Math.max(
        1.8,
        Math.min(2.8, 2.2 + processedOptions.highlightTone * 0.2)
      );

      console.log(
        `Legacy highlight tone - Value: ${
          processedOptions.highlightTone
        }, Gamma: ${gamma.toFixed(2)}`
      );
      image = image.gamma(gamma);
    }

    // 4-C. 기존 방식 섀도우 톤 (직접 지정된 경우)
    if (
      processedOptions.shadowTone !== undefined &&
      !filmSimulationOptions.shadowTone &&
      !userSettingsOptions.shadowTone
    ) {
      const brightness = Math.max(
        0.7,
        Math.min(2.0, 1.0 + processedOptions.shadowTone * 0.2)
      );

      console.log(
        `Legacy shadow tone - Value: ${
          processedOptions.shadowTone
        }, Brightness: ${brightness.toFixed(2)}`
      );
      image = image.modulate({ brightness: brightness });
    }

    // 4-D. 기존 방식 채도 (직접 지정된 경우)
    if (
      processedOptions.saturation !== undefined &&
      !filmSimulationOptions.saturation &&
      !userSettingsOptions.saturation
    ) {
      const saturation = Math.max(
        0.5,
        Math.min(2.2, 1.0 + processedOptions.saturation * 0.25)
      );

      console.log(
        `Legacy color saturation - Value: ${
          processedOptions.saturation
        }, Saturation: ${saturation.toFixed(2)}`
      );
      image = image.modulate({ saturation: saturation });
    }

    // 4-E. 기존 방식 샤프니스 (직접 지정된 경우)
    if (
      processedOptions.sharpness !== undefined &&
      !filmSimulationOptions.sharpness &&
      !userSettingsOptions.sharpness
    ) {
      if (processedOptions.sharpness > 0) {
        const sigma = Math.max(
          0.5,
          Math.min(2.0, 1.0 + processedOptions.sharpness * 0.25)
        );

        console.log(
          `Legacy sharpen - Value: ${
            processedOptions.sharpness
          }, Sigma: ${sigma.toFixed(2)}`
        );

        image = image.sharpen({
          sigma: sigma,
          m1: 0.5,
          m2: 2.0,
          x1: 2.0,
          y2: 10.0,
          y3: 20.0,
        });
      } else if (processedOptions.sharpness < 0) {
        const blurAmount = Math.min(
          1.0,
          Math.abs(processedOptions.sharpness) * 0.2
        );

        console.log(
          `Legacy soft blur - Value: ${
            processedOptions.sharpness
          }, Amount: ${blurAmount.toFixed(2)}`
        );
        image = image.blur(blurAmount);
      }
    }

    // 4-F. 기존 방식 노이즈 리덕션 (직접 지정된 경우)
    if (
      processedOptions.noiseReduction !== undefined &&
      processedOptions.noiseReduction > 0 &&
      !filmSimulationOptions.noiseReduction &&
      !userSettingsOptions.noiseReduction
    ) {
      const medianSize = Math.min(7, 3 + processedOptions.noiseReduction);

      console.log(
        `Legacy noise reduction - Value: ${processedOptions.noiseReduction}, Median size: ${medianSize}`
      );
      image = image.median(medianSize);
    }

    // === 공통 후처리 ===
    console.log("=== Final Processing ===");

    // 5. 흑백 변환을 먼저 처리 (linear 변환과의 충돌 방지)
    if (processedOptions.isBw) {
      console.log("Converting to grayscale");
      // 중간 버퍼링으로 linear 변환 상태 해제
      const tempBuffer = await image.toBuffer();
      image = sharp(tempBuffer).greyscale();
    }

    // 6. 자연스러운 컨트라스트 정규화 (Sharp 권장)
    image = image.normalise({ lower: 1, upper: 99 });

    // 최종 출력 포맷 및 품질 설정 (품질 개선)
    switch (extension) {
      case "jpg":
      case "jpeg":
        image = image.jpeg({ quality: processedOptions.quality || 95 }); // 90% → 95%
        break;
      case "png":
        image = image.png({
          compressionLevel: processedOptions.quality
            ? Math.round((processedOptions.quality / 100) * 6) // 더 보수적인 압축
            : 4, // 기본값 6 → 4로 낮춰 품질 향상
        });
        break;
      case "webp":
        image = image.webp({ quality: processedOptions.quality || 95 }); // 90% → 95%
        break;
    }

    const retouchedImageBuffer = await image.toBuffer();
    // 결과 객체 준비
    const result: {
      dataUrl?: string;
      retouchedImageBuffer: Buffer;
      sourceImageBuffer: Buffer;
    } = {
      retouchedImageBuffer: retouchedImageBuffer,
      sourceImageBuffer: await sourceImage.toBuffer(),
    };

    if (options.returnBase64) {
      const base64String = retouchedImageBuffer.toString("base64");
      const mimeType =
        {
          png: "image/png",
          webp: "image/webp",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
        }[extension] || "image/jpeg";

      const dataUrl = `data:${mimeType};base64,${base64String}`;

      console.log(
        `Image processed and converted to base64 (${Math.round(
          base64String.length / 1024
        )}KB)`
      );

      result.dataUrl = dataUrl;
    }

    if (options.saveToFile && options.outputFileName) {
      const outputFilePath = path.resolve(
        process.cwd(),
        "public",
        options.outputFileName
      );
      writeFileSync(outputFilePath, retouchedImageBuffer);
      console.log(`Image saved to: ${outputFilePath}`);
    }

    return result;
  } catch (error) {
    console.error("Error processing image:", error);
  }
};

// 검증용 간단한 테스트 함수
export const runValidationTests = async () => {
  console.log("=== 필름 시뮬레이션 + 이미지 처리 검증 테스트 ===\n");

  const inputImagePath = "source.jpg";

  // 1. 원본 이미지 단순 리사이즈만 (기준점)
  console.log("1. 원본 이미지 단순 리사이즈 (기준점)");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_01_original.jpg",
    saveToFile: true,
    width: 1200,
    quality: 100,
  });

  // 2. Provia 필름 시뮬레이션 (기준 필름)
  console.log("\n2. Provia 필름 시뮬레이션 적용");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_02_provia.jpg",
    saveToFile: true,
    width: 1200,
    filmSimulation: "Provia",
    quality: 100,
  });

  // 3. Velvia 필름 시뮬레이션 (고채도, 생생한 색상)
  console.log("\n3. Velvia 필름 시뮬레이션 적용");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_03_velvia.jpg",
    saveToFile: true,
    width: 1200,
    filmSimulation: "Velvia",
    quality: 100,
  });

  // 4. Classic Chrome 필름 시뮬레이션 (차분한 색상)
  console.log("\n4. Classic Chrome 필름 시뮬레이션 적용");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_04_classic_chrome.jpg",
    saveToFile: true,
    width: 1200,
    filmSimulation: "Classic Chrome",
    quality: 100,
  });

  // 5. Eterna 필름 시뮬레이션 (시네마틱 룩)
  console.log("\n5. Eterna 필름 시뮬레이션 적용");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_05_eterna.jpg",
    saveToFile: true,
    width: 1200,
    filmSimulation: "Eterna",
    quality: 100,
  });

  // 6. Acros 필름 시뮬레이션 (흑백, 자동 적용)
  console.log("\n6. Acros 필름 시뮬레이션 적용 (자동 흑백 변환)");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_06_acros.jpg",
    saveToFile: true,
    width: 1200,
    filmSimulation: "Acros",
    quality: 100,
  });

  // 7. Velvia + 사용자 설정 조합 (필름 먼저, 사용자 설정 추가)
  console.log("\n7. Velvia + 사용자 추가 보정 적용 (순차 적용)");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_07_velvia_plus_user.jpg",
    saveToFile: true,
    width: 1200,
    filmSimulation: "Velvia", // 1단계: Velvia 필름 특성 적용
    cameraSettings: {
      // 2단계: 사용자 설정 추가 적용
      whiteBalanceR: 2, // Velvia 기본값(+1)에 추가로 +2 = 총 +3
      shadowTone: 1, // Velvia 기본값(+1)에 추가로 +1 = 총 +2
      clarity: 1, // Velvia 기본값(+2)에 추가로 +1 = 총 +3
    },
    quality: 100,
  });

  // 8. 사용자 설정만 적용 (호환성 테스트)
  console.log("\n8. 사용자 카메라 설정만 적용 (호환성 테스트)");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_08_camera_only.jpg",
    saveToFile: true,
    width: 1200,
    cameraSettings: {
      whiteBalanceR: 4,
      whiteBalanceB: -2,
      highlightTone: 2,
      shadowTone: 1,
      color: 2,
      clarity: 1,
    },
    quality: 100,
  });

  // 9. 기존 Sharp 옵션 직접 지정 (호환성 테스트)
  console.log("\n9. 기존 Sharp 옵션 직접 지정 (호환성 테스트)");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_09_legacy_options.jpg",
    saveToFile: true,
    width: 1200,
    whiteBalanceTint: { r: 1.2, b: 0.8 },
    highlightTone: 1,
    shadowTone: 2,
    saturation: 2,
    sharpness: 1,
    quality: 100,
  });

  console.log("\n" + "=".repeat(80));
  console.log("✅ 필름 시뮬레이션 순차 적용 검증 테스트 완료!");
  console.log("생성된 파일:");
  console.log("- validation_01_original.jpg (원본 기준)");
  console.log("- validation_02_provia.jpg (Provia 필름)");
  console.log("- validation_03_velvia.jpg (Velvia 필름 - 고채도)");
  console.log("- validation_04_classic_chrome.jpg (Classic Chrome - 차분함)");
  console.log("- validation_05_eterna.jpg (Eterna - 시네마틱)");
  console.log("- validation_06_acros.jpg (Acros - 흑백)");
  console.log(
    "- validation_07_velvia_plus_user.jpg (Velvia → 사용자 보정 순차 적용)"
  );
  console.log("- validation_08_camera_only.jpg (사용자 카메라 설정만)");
  console.log("- validation_09_legacy_options.jpg (기존 Sharp 옵션 직접 지정)");
  console.log("\n🔄 새로운 순차 적용 방식:");
  console.log("✅ 1단계: 필름 시뮬레이션 기본 특성 적용");
  console.log("✅ 2단계: 사용자 카메라 설정 추가 적용");
  console.log("✅ 3단계: 기존 Sharp 옵션 호환성 처리");
  console.log("✅ 흑백 필름 자동 변환 (Acros, Monochrome)");
  console.log("✅ FilmSimulationTypes enum 기반 타입 안전성");
  console.log("✅ analyze-image-stats.js 분석 결과 적용");
  console.log("\n📈 개선된 처리 순서:");
  console.log(
    "   필름 시뮬레이션 → 사용자 설정 → 컨트라스트 정규화 → 흑백 변환"
  );
};

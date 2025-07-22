import { writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";

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
  whiteBalanceTint?: { r: number; b: number };
  highlightTone?: number;
  shadowTone?: number;
  saturation?: number;
  sharpness?: number;
  noiseReduction?: number;
}

/**
 * 카메라 설정을 Sharp 옵션으로 변환하는 함수
 *
 * 카메라 설정 범위와 Sharp 옵션 매핑:
 *
 * 1. 화이트 밸런스 R/B축: ±9 → Sharp tint 승수 0.7~1.3
 *    - R축 +9 = r: 1.3, R축 -9 = r: 0.7
 *    - B축 +9 = b: 1.3, B축 -9 = b: 0.7
 *
 * 2. 하이라이트 톤: -2~+4 → gamma 1.8~3.0
 *    - 카메라 값 * 0.2 + 기본값 2.2
 *    - 양수: 하이라이트 밝게, 음수: 하이라이트 어둡게
 *
 * 3. 섀도우 톤: -2~+4 → brightness 0.5~2.5
 *    - 카메라 값 * 0.25 + 기본값 1.0
 *    - 양수: 섀도우 밝게, 음수: 섀도우 어둡게
 *
 * 4. 색농도(채도): -4~+4 → saturation 0.1~1.9
 *    - 카메라 값 * 0.225 + 기본값 1.0, 최소값 0.1 보장
 *    - 양수: 채도 증가, 음수: 채도 감소
 *
 * 5. 샤프니스: -4~+4 → sharpen sigma 0.5~2.0 또는 blur 0.5~2.0
 *    - 양수: sharpen 적용 (sigma = 0.5 + 카메라값 * 0.375)
 *    - 음수: blur 적용 (blur = 절댓값 * 0.5)
 *
 * 6. 노이즈 리덕션: -4~+4 → blur 0~2.0
 *    - 양수만 적용: blur = 카메라 값 * 0.5
 *    - 음수는 적용하지 않음 (NR 감소는 의미 없음)
 */
const convertCameraSettingsToSharpOptions = (
  cameraSettings: CameraSettings
): SharpProcessingOptions => {
  const sharpOptions: SharpProcessingOptions = {};

  // 화이트 밸런스 R/B축 ±9 → tint 승수 0.7~1.3
  if (
    cameraSettings.whiteBalanceR !== undefined ||
    cameraSettings.whiteBalanceB !== undefined
  ) {
    const rValue =
      cameraSettings.whiteBalanceR !== undefined
        ? 1.0 + (cameraSettings.whiteBalanceR / 9) * 0.3
        : 1.0;
    const bValue =
      cameraSettings.whiteBalanceB !== undefined
        ? 1.0 + (cameraSettings.whiteBalanceB / 9) * 0.3
        : 1.0;
    sharpOptions.whiteBalanceTint = {
      r: Math.max(0.7, Math.min(1.3, rValue)),
      b: Math.max(0.7, Math.min(1.3, bValue)),
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
    // 카메라 설정 (원본 카메라 값 입력)
    cameraSettings?: CameraSettings;
    // 또는 Sharp 옵션 직접 지정 (호환성 유지)
    whiteBalanceTint?: { r: number; b: number };
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

    // 카메라 설정을 Sharp 옵션으로 변환
    let processedOptions = { ...options };

    if (options.cameraSettings) {
      const convertedOptions = convertCameraSettingsToSharpOptions(
        options.cameraSettings
      );
      // 카메라 설정에서 변환된 옵션을 processedOptions에 병합
      processedOptions = { ...processedOptions, ...convertedOptions };
    }

    // 1. 이미지 크기 및 비율 조절
    if (processedOptions.width || processedOptions.height) {
      image = image.resize(processedOptions.width, processedOptions.height, {
        fit: processedOptions.fit || "cover",
      });
    }

    // 이미지 통계 정보를 한 번만 가져와서 모든 조정에 활용
    const stats = await image.stats();
    const averageR = Math.round(stats.channels[0].mean); // R 채널 평균값
    const averageG = Math.round(stats.channels[1].mean); // G 채널 평균값
    const averageB = Math.round(stats.channels[2].mean); // B 채널 평균값
    const overallBrightness = (averageR + averageG + averageB) / 3; // 전체 평균 밝기
    const imageSharpness = stats.sharpness || 1.0; // 이미지 선명도

    console.log(
      `Image stats - R:${averageR}, G:${averageG}, B:${averageB}, Brightness:${Math.round(
        overallBrightness
      )}, Sharpness:${imageSharpness.toFixed(2)}`
    );

    // 2. 화이트 밸런스 (색온도 조정으로 구현)
    // 카메라 R/B축 ±9 범위를 색온도 보정으로 변환
    if (processedOptions.whiteBalanceTint) {
      // R/B 축 조정 값을 hue 회전으로 변환
      const rAdjust = processedOptions.whiteBalanceTint.r - 1.0; // -0.3 ~ +0.3 범위
      const bAdjust = processedOptions.whiteBalanceTint.b - 1.0; // -0.3 ~ +0.3 범위

      // 색온도 효과를 위한 hue 조정 계산
      // 따뜻한 톤(R+, B-): 음의 hue 회전 (주황색 방향)
      // 차가운 톤(R-, B+): 양의 hue 회전 (파란색 방향)
      const hueAdjustment = Math.round((bAdjust - rAdjust) * 15); // 정수로 반올림

      console.log(
        `White balance - R adjust: ${rAdjust.toFixed(
          2
        )}, B adjust: ${bAdjust.toFixed(2)}, Hue: ${hueAdjustment}°`
      );

      if (Math.abs(hueAdjustment) >= 1) {
        image = image.modulate({
          hue: Math.max(-30, Math.min(30, hueAdjustment)),
        });
      }
    }

    // 3. 하이라이트 톤 (Gamma로 구현) - 적응형 처리 간소화
    if (processedOptions.highlightTone !== undefined) {
      // 적응형 조정을 더 부드럽게 적용
      const brightnessRatio = Math.max(
        0.7,
        Math.min(1.3, 128 / Math.max(overallBrightness, 80))
      );
      const adaptiveGammaAdjust =
        processedOptions.highlightTone * 0.15 * brightnessRatio; // 0.2 → 0.15로 감소
      const gamma = Math.max(1.0, Math.min(3.0, 2.2 + adaptiveGammaAdjust));

      console.log(
        `Gamma adjustment - Brightness: ${Math.round(
          overallBrightness
        )}, Ratio: ${brightnessRatio.toFixed(2)}, Gamma: ${gamma.toFixed(2)}`
      );
      image = image.gamma(gamma);
    }

    // 4. 섀도우 톤 (Brightness로 구현) - 적응형 처리 간소화
    if (processedOptions.shadowTone !== undefined) {
      // 적응형 조정을 더 부드럽게 적용
      const brightnessRatio = Math.max(
        0.7,
        Math.min(1.3, 128 / Math.max(overallBrightness, 80))
      );
      const adaptiveBrightnessAdjust =
        processedOptions.shadowTone * 0.2 * brightnessRatio; // 0.25 → 0.2로 감소
      const brightness = Math.max(
        0.5,
        Math.min(2.0, 1.0 + adaptiveBrightnessAdjust)
      ); // 범위도 조정

      console.log(
        `Brightness adjustment - Ratio: ${brightnessRatio.toFixed(
          2
        )}, Brightness: ${brightness.toFixed(2)}`
      );
      image = image.modulate({ brightness: brightness });
    }

    // 5. 색농도 (채도) 조절 - 적응형 처리 간소화
    if (processedOptions.saturation !== undefined) {
      // 색상 분산 기반 적응형 조정을 더 보수적으로 적용
      const colorVariance =
        Math.abs(averageR - averageG) +
        Math.abs(averageG - averageB) +
        Math.abs(averageB - averageR);
      const saturationRatio = Math.max(
        0.8,
        Math.min(1.5, 50 / Math.max(colorVariance, 15))
      ); // 더 보수적인 범위
      const adaptiveSaturationAdjust =
        processedOptions.saturation * 0.2 * saturationRatio; // 0.225 → 0.2로 감소
      const saturation = Math.max(
        0.3,
        Math.min(2.0, 1.0 + adaptiveSaturationAdjust)
      ); // 범위 조정

      console.log(
        `Saturation adjustment - Color variance: ${colorVariance}, Ratio: ${saturationRatio.toFixed(
          2
        )}, Saturation: ${saturation.toFixed(2)}`
      );
      image = image.modulate({ saturation: saturation });
    }

    // 6. 샤프니스 조절 - 적응형 처리 간소화
    if (processedOptions.sharpness !== undefined) {
      if (processedOptions.sharpness > 0) {
        // 적응형 샤프닝을 더 보수적으로 적용
        const sharpnessRatio = Math.max(
          0.7,
          Math.min(1.5, 1.2 / Math.max(imageSharpness, 0.6))
        ); // 더 보수적인 범위
        const adaptiveSigma =
          (0.5 + processedOptions.sharpness * 0.3) * sharpnessRatio; // 0.375 → 0.3으로 감소
        const sigma = Math.min(2.5, adaptiveSigma); // 최대값도 3.0 → 2.5로 감소

        console.log(
          `Sharpen adjustment - Image sharpness: ${imageSharpness.toFixed(
            2
          )}, Ratio: ${sharpnessRatio.toFixed(2)}, Sigma: ${sigma.toFixed(2)}`
        );
        image = image.sharpen({ sigma: sigma });
      } else if (processedOptions.sharpness < 0) {
        // 블러는 고정값 사용 (적응형 제거)
        const blurAmount = Math.min(
          1.5,
          Math.abs(processedOptions.sharpness) * 0.4
        ); // 0.5 → 0.4로 감소
        console.log(`Blur adjustment - Amount: ${blurAmount.toFixed(2)}`);
        image = image.blur(blurAmount);
      }
    }

    // 7. 노이즈 리덕션 - 적응형 처리 간소화
    if (
      processedOptions.noiseReduction !== undefined &&
      processedOptions.noiseReduction > 0
    ) {
      // 노이즈 리덕션을 더 보수적으로 적용
      const noiseRatio = Math.max(
        0.5,
        Math.min(1.2, 0.8 / Math.max(imageSharpness, 0.6))
      ); // 더 보수적인 범위
      const adaptiveNrBlur = processedOptions.noiseReduction * 0.3 * noiseRatio; // 0.5 → 0.3으로 감소
      const nrBlur = Math.min(1.5, adaptiveNrBlur); // 최대값도 2.5 → 1.5로 감소

      console.log(
        `Noise reduction adjustment - Ratio: ${noiseRatio.toFixed(
          2
        )}, Blur: ${nrBlur.toFixed(2)}`
      );
      image = image.blur(nrBlur);
    }

    // 8. 흑백 변환 (greyscale)
    if (processedOptions.isBw) {
      image = image.greyscale();
    }

    // 최종 출력 포맷 및 품질 설정
    switch (extension) {
      case "jpg":
      case "jpeg":
        image = image.jpeg({ quality: processedOptions.quality || 90 });
        break;
      case "png":
        image = image.png({
          compressionLevel: processedOptions.quality
            ? Math.round((processedOptions.quality / 100) * 9)
            : 6,
        }); // 품질을 압축 레벨로 변환
        break;
      case "webp":
        image = image.webp({ quality: processedOptions.quality || 90 });
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
  console.log("=== 이미지 처리 검증 테스트 ===\n");

  const inputImagePath = "source.jpg";

  // 1. 원본 이미지 단순 리사이즈만 (기준점)
  console.log("1. 원본 이미지 단순 리사이즈 (기준점)");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_01_original",
    saveToFile: true,
    width: 1200,
    quality: 100,
  });

  // 2. 화이트밸런스만 적용 (문제 확인)
  console.log("\n2. 화이트밸런스만 적용 테스트");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_02_wb_only",
    saveToFile: true,
    width: 1200,
    cameraSettings: {
      whiteBalanceR: 3,
      whiteBalanceB: -2,
    },
    quality: 100,
  });

  // 3. 감마만 적용
  console.log("\n3. 감마만 적용 테스트");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_03_gamma_only",
    saveToFile: true,
    width: 1200,
    cameraSettings: {
      highlightTone: 1.0,
    },
    quality: 100,
  });

  // 4. 채도만 적용
  console.log("\n4. 채도만 적용 테스트");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_04_saturation_only",
    saveToFile: true,
    width: 1200,
    cameraSettings: {
      color: 2,
    },
    quality: 100,
  });

  // 5. 웜톤 화이트밸런스 테스트
  console.log("\n5. 웜톤 화이트밸런스 테스트");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_05_warm_tone",
    saveToFile: true,
    width: 1200,
    cameraSettings: {
      whiteBalanceR: 6, // 따뜻한 R 증가
      whiteBalanceB: -4, // 차가운 B 감소
    },
    quality: 100,
  });

  // 6. 쿨톤 화이트밸런스 테스트
  console.log("\n6. 쿨톤 화이트밸런스 테스트");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_06_cool_tone",
    saveToFile: true,
    width: 1200,
    cameraSettings: {
      whiteBalanceR: -5, // 차가운 R 감소
      whiteBalanceB: 7, // 따뜻한 B 증가
    },
    quality: 100,
  });

  console.log("\n=== 검증 테스트 완료 ===");
  console.log("생성된 파일:");
  console.log("- validation_01_original.jpg (원본 기준)");
  console.log("- validation_02_wb_only.jpg (화이트밸런스만)");
  console.log("- validation_03_gamma_only.jpg (감마만)");
  console.log("- validation_04_saturation_only.jpg (채도만)");
  console.log("- validation_05_warm_tone.jpg (웜톤 화이트밸런스)");
  console.log("- validation_06_cool_tone.jpg (쿨톤 화이트밸런스)");
};

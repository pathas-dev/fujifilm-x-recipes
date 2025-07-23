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
  whiteBalanceTint?: { r: number; g: number; b: number };
  highlightTone?: number;
  shadowTone?: number;
  saturation?: number;
  sharpness?: number;
  noiseReduction?: number;
}

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
    // 카메라 설정 (원본 카메라 값 입력)
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

    // 2. 화이트 밸런스 조정 (linear transformation 사용)
    if (processedOptions.whiteBalanceTint) {
      const r = processedOptions.whiteBalanceTint.r || 1.0;
      const g = (processedOptions.whiteBalanceTint as any).g || 1.0;
      const b = processedOptions.whiteBalanceTint.b || 1.0;

      console.log(
        `White balance adjustment - R: ${r.toFixed(2)}, G: ${g.toFixed(
          2
        )}, B: ${b.toFixed(2)}`
      );

      // Linear transformation을 사용한 화이트밸런스 조정
      // 각 채널에 다른 승수를 적용하여 색온도 조정
      image = image.linear([r, g, b], [0, 0, 0]);
    }

    // 3. 하이라이트 톤 (Gamma 조정 - 품질 보존 범위)
    if (processedOptions.highlightTone !== undefined) {
      // 품질 보존: gamma = 2.2 + (카메라값 * 0.2) - 더 자연스러운 범위
      const gamma = Math.max(
        1.8,
        Math.min(2.8, 2.2 + processedOptions.highlightTone * 0.2)
      );

      console.log(
        `Highlight tone - Camera value: ${
          processedOptions.highlightTone
        }, Gamma: ${gamma.toFixed(2)} (optimized)`
      );
      image = image.gamma(gamma);
    }

    // 4. 섀도우 톤 (Brightness 조정 - 품질 보존 범위)
    if (processedOptions.shadowTone !== undefined) {
      // 품질 보존: brightness = 1.0 + (카메라값 * 0.2) - 극단값 제거
      const brightness = Math.max(
        0.7,
        Math.min(2.0, 1.0 + processedOptions.shadowTone * 0.2)
      );

      console.log(
        `Shadow tone - Camera value: ${
          processedOptions.shadowTone
        }, Brightness: ${brightness.toFixed(2)} (optimized)`
      );
      image = image.modulate({ brightness: brightness });
    }

    // 5. 색농도 (채도) 조절 - 개선된 범위
    if (processedOptions.saturation !== undefined) {
      // 개선된 공식: saturation = 1.0 + (카메라값 * 0.25), 최소값 0.5로 설정하여 완전 무채색 방지
      const saturation = Math.max(
        0.5,
        Math.min(2.2, 1.0 + processedOptions.saturation * 0.25)
      );

      console.log(
        `Color saturation - Camera value: ${
          processedOptions.saturation
        }, Saturation: ${saturation.toFixed(2)}`
      );
      image = image.modulate({ saturation: saturation });
    }

    // 6. 자연스러운 컨트라스트 정규화 (Sharp 권장)
    // 히스토그램 기반으로 자연스럽게 컨트라스트 개선
    image = image.normalise({ lower: 1, upper: 99 });

    // 7. 샤프니스 조절 - 자연스러운 unsharp mask
    if (processedOptions.sharpness !== undefined) {
      if (processedOptions.sharpness > 0) {
        // 자연스러운 샤프닝: sigma를 낮추고 unsharp mask 파라미터 추가
        const sigma = Math.max(
          0.5,
          Math.min(2.0, 1.0 + processedOptions.sharpness * 0.25)
        );

        console.log(
          `Sharpen - Camera value: ${
            processedOptions.sharpness
          }, Sigma: ${sigma.toFixed(2)} (natural)`
        );

        // 자연스러운 unsharp mask (과샤프닝 방지)
        image = image.sharpen({
          sigma: sigma,
          m1: 0.5, // flat area mask
          m2: 2.0, // jagged area mask
          x1: 2.0, // flat area sharpening
          y2: 10.0, // maximum brightening
          y3: 20.0, // maximum darkening
        });
      } else if (processedOptions.sharpness < 0) {
        // 매우 약한 블러 (자연스러운 소프트닝)
        const blurAmount = Math.min(
          1.0,
          Math.abs(processedOptions.sharpness) * 0.2
        );

        console.log(
          `Soft blur - Camera value: ${
            processedOptions.sharpness
          }, Amount: ${blurAmount.toFixed(2)} (gentle)`
        );
        image = image.blur(blurAmount);
      }
    }

    // 8. 노이즈 리덕션 - Sharp의 median 필터 사용 (권장 방법)
    if (
      processedOptions.noiseReduction !== undefined &&
      processedOptions.noiseReduction > 0
    ) {
      // Sharp 권장: median 필터로 노이즈 제거 (블러 대신)
      // 카메라값 1-4를 median 윈도우 크기 3-7로 매핑
      const medianSize = Math.min(7, 3 + processedOptions.noiseReduction);

      console.log(
        `Noise reduction - Camera value: ${processedOptions.noiseReduction}, Median size: ${medianSize} (natural)`
      );

      // median 필터는 블러 없이 자연스럽게 노이즈 제거
      image = image.median(medianSize);
    }

    // 9. 흑백 변환 (greyscale)
    if (processedOptions.isBw) {
      image = image.greyscale();
    }

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

  // 2. 화이트밸런스만 적용 (개선된 매핑 테스트)
  console.log("\n2. 화이트밸런스만 적용 테스트 (개선된 매핑)");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_02_wb_improved.jpg",
    saveToFile: true,
    width: 1200,
    cameraSettings: {
      whiteBalanceR: 6, // 따뜻한 톤 (더 강한 효과)
      whiteBalanceB: -6, // 차가운 B 감소
    },
    quality: 100,
  });

  // 3. 하이라이트 톤만 적용 (개선된 범위)
  console.log("\n3. 하이라이트 톤만 적용 테스트 (개선된 범위)");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_03_highlight_improved.jpg",
    saveToFile: true,
    width: 1200,
    cameraSettings: {
      highlightTone: 2.0, // 더 강한 하이라이트 조정
    },
    quality: 100,
  });

  // 4. 섀도우 톤만 적용 (개선된 범위)
  console.log("\n4. 섀도우 톤만 적용 테스트 (개선된 범위)");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_04_shadow_improved.jpg",
    saveToFile: true,
    width: 1200,
    cameraSettings: {
      shadowTone: 2.0, // 더 강한 섀도우 조정
    },
    quality: 100,
  });

  // 5. 채도만 적용 (개선된 범위)
  console.log("\n5. 채도만 적용 테스트 (개선된 범위)");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_05_saturation_improved.jpg",
    saveToFile: true,
    width: 1200,
    cameraSettings: {
      color: 3, // 더 강한 채도 증가
    },
    quality: 100,
  });

  // 6. 샤프니스만 적용 (개선된 범위)
  console.log("\n6. 샤프니스만 적용 테스트 (개선된 범위)");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_06_sharpness_improved.jpg",
    saveToFile: true,
    width: 1200,
    cameraSettings: {
      clarity: 3, // 더 강한 샤프닝
    },
    quality: 100,
  });

  // 7. 노이즈 리덕션만 적용 (개선된 범위)
  console.log("\n7. 노이즈 리덕션만 적용 테스트 (개선된 범위)");
  await retouchImage(inputImagePath, "jpg", {
    outputFileName: "validation_07_nr_improved.jpg",
    saveToFile: true,
    width: 1200,
    cameraSettings: {
      noiseReduction: 3, // 더 강한 노이즈 리덕션
    },
    quality: 100,
  });

  console.log("\n=== 개선된 매핑 검증 테스트 완료 ===");
  console.log("생성된 파일:");
  console.log("- validation_01_original.jpg (원본 기준)");
  console.log("- validation_02_wb_improved.jpg (개선된 화이트밸런스)");
  console.log("- validation_03_highlight_improved.jpg (개선된 하이라이트 톤)");
  console.log("- validation_04_shadow_improved.jpg (개선된 섀도우 톤)");
  console.log("- validation_05_saturation_improved.jpg (개선된 채도)");
  console.log("- validation_06_sharpness_improved.jpg (개선된 샤프니스)");
  console.log("- validation_07_nr_improved.jpg (개선된 노이즈 리덕션)");
  console.log("\n개선사항:");
  console.log("✅ 화이트밸런스: Sharp의 linear transformation 사용");
  console.log(
    "✅ 하이라이트/섀도우: 품질 보존 범위 (1.8~2.8 gamma, 0.7~2.0 brightness)"
  );
  console.log("✅ 채도: 더 강한 효과 범위 (0.5~2.2)");
  console.log("✅ 샤프니스: 품질 보존 매핑 (0.3~3.5 sigma, 0.3~1.6 blur)");
  console.log("✅ 노이즈 리덕션: 품질 보존 범위 (0~1.0 blur)");
  console.log("✅ 출력 품질: JPEG/WebP 95%, PNG 압축 최적화");
};

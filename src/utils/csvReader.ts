import fs from "fs";
import Papa from "papaparse";

export interface FilmRecipe {
  creator: string;
  name: string;
  type: string;
  color: string;
  colorOrBw: string;
  camera: string;
  sensor: string;
  base: string;
  settings: ParsedSettings;
  publishedAt: string;
  url: string;
}

export interface ParsedSettings {
  [key: string]: string;
}

/**
 * Settings 문자열을 파싱해서 객체로 변환하는 함수
 */
export function parseSettings(settingsString: string) {
  // 줄바꿈으로 분리하고 reduce로 설정 객체 생성
  const DELIMETER = ":";

  const settings = settingsString.split("\n").reduce((settings, line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && trimmedLine.includes(DELIMETER)) {
      const [key, value] = trimmedLine.split(DELIMETER);
      settings[key] = value;
    }
    return settings;
  }, {} as ParsedSettings);

  return JSON.stringify(settings);
}

/**
 * CSV 파일을 읽어서 파싱하는 함수 (Papa Parse 사용)
 */
export function readCSV(filePath: string): FilmRecipe[] {
  try {
    const csvContent = fs.readFileSync(filePath, "utf-8");

    const result = Papa.parse<FilmRecipe>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value, field) => {
        const trimmedValue = value.trim();
        // Settings 필드인 경우 파싱해서 객체로 변환
        if (field === "Settings") {
          return parseSettings(trimmedValue);
        }
        return trimmedValue;
      },
      dynamicTyping: false, // 모든 값을 문자열로 유지
    });

    if (result.errors.length > 0) {
      console.warn("CSV 파싱 경고:", result.errors);
    }

    // 필수 필드가 있는 레시피만 필터링
    return result.data.filter((recipe) => recipe.creator && recipe.name);
  } catch (error) {
    console.error("CSV 파일 읽기 오류:", error);
    throw error;
  }
}

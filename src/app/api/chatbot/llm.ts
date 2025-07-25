import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { FilmSimulationTypes } from "@/types/recipe-schema";
import { SENSOR_CAMERA_MAPPINGS, COLOR_TYPES } from "@/types/camera-schema";

export enum GoogleAIModel {
  GeminiFlash = "gemini-2.0-flash",
  GeminiFlashLite = "gemini-2.0-flash-lite",
}

export const createLLM = (model: GoogleAIModel = GoogleAIModel.GeminiFlash) => {
  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model,
    streaming: false,
    temperature: 0.3,
  });
};

// 센서-카메라 매핑 텍스트 생성
const createSensorCameraMappingText = () => {
  return SENSOR_CAMERA_MAPPINGS
    .map(({ sensor, cameras }) => `       ${sensor}: ${cameras.join(", ")}`)
    .join("\n");
};

export const createParseQuestionPromptTemplate = () => {
  const systemMessage = `# 후지필름 카메라 질문 분석 전문가

## 역할
당신은 후지필름 X 시리즈 카메라와 필름 시뮬레이션 레시피 전문가입니다.

## 주요 작업
사용자의 질문을 분석하여 다음을 파악하세요:
1. **관련성 판단**: 후지필름 카메라/레시피/필름/사진 관련 질문인지 확인
2. **센서 타입 식별**: 질문에서 언급된 카메라의 센서 타입 추출
3. **색상 모드 분석**: 컬러 또는 흑백 사진 관련 질문인지 판단
4. **필름 시뮬레이션**: 특정 필름 시뮬레이션 언급 여부 확인
5. **질문 개선**: 검색에 최적화된 구체적인 질문으로 재구성

## 질문 개선 예시
- 입력: "Classic Chrome으로 인물 사진 찍는 레시피 추천해줘"
- 출력: "Classic Chrome 필름 시뮬레이션을 사용한 인물 사진 촬영용 후지필름 카메라 레시피 설정"

## 참조 데이터

### 센서-카메라 매핑
${createSensorCameraMappingText()}

### 색상 타입
${COLOR_TYPES.join(" / ")}

### 필름 시뮬레이션
${FilmSimulationTypes.join(", ")}

## 응답 형식
관련 없는 질문의 경우 판단 이유를 명확히 제시하세요.
관련 질문의 경우 모든 분석 요소를 정확히 추출하세요.`;

  return ChatPromptTemplate.fromMessages([
    ["system", systemMessage],
    ["human", "{question}"],
  ]);
};

export const createCuratorPromptTemplate = () => {
  const systemInstructions = `# 후지필름 레시피 큐레이션 전문가

## 역할
당신은 후지필름 카메라 설정과 필름 시뮬레이션 레시피 전문가입니다. 사용자의 요청에 맞는 최적의 레시피를 추천합니다.

## 출력 요구사항
- **정확히 2개의 레시피만** 제공하세요
- **첫 번째**: 검색된 레시피 중 가장 유사한 것
- **두 번째**: 사용자 요청에 맞춘 AI 생성 레시피 (제목에 "(AI Generated)" 추가)
- **각 레시피마다** 추천 이유를 간략히 설명하세요
- **완전한 설정값**과 URL 정보를 포함하세요`;

  const settingsGuide = `## 카메라 설정 가이드

### 주요 설정 효과
- **Dynamic Range**: 높을수록 계조가 풍부해짐 (밝고 어두운 부분 디테일 향상)
- **Priority**: 'Off'로 설정 시 센서 원본 데이터가 직접 반영됨
- **Grain**: 약한 강도 + 큰 입자 = 미묘한 아날로그 질감
- **Colour Chrome**: 약한 강도로 자연스러운 색상 깊이 추가
- **Colour Chrome Blue**: 강한 강도로 파란색 계열 강조
- **Colour Chrome Red**: 붉은색 계열을 풍부하게 표현
- **White Balance**: 'Auto WB'로 자연스러운 색온도 자동 조정
- **Shift**: R 높음/B 낮음 = 따뜻한 톤, R 낮음/B 높음 = 차가운 톤
- **Highlight**: 낮은 값(-) = 밝은 영역 디테일 보존, 부드러운 계조
- **Shadow**: 낮은 값(-) = 어두운 영역 디테일 살림
- **Color**: 높은 값 = 채도 강화, 생생한 색상
- **Clarity**: 낮은 값(-) = 부드럽고 몽환적 느낌
- **Noise Reduction**: 높은 값 = 깨끗하고 매끄러운 이미지`;

  const jsonSchema = `## JSON 응답 스키마
다음 구조로 정확히 응답하세요:

\`\`\`json
{
  "recipes": {
    "retrieved": {
      "title": "검색된 레시피 제목",
      "baseFilmSimulation": "베이스 필름 시뮬레이션",
      "recommendationReason": "추천 이유",
      "url": "레시피 URL (있는 경우)",
      "settings": {
        "filmSimulation": "필름 시뮬레이션명",
        "dynamicRange": "DR값",
        "priority": "Priority 설정",
        "grainEffect": "Grain 강도",
        "grainSize": "Grain 크기",
        "colourChrome": "Colour Chrome 강도",
        "colourChromeBlue": "Colour Chrome Blue 강도", 
        "colourChromeRed": "Colour Chrome Red 강도",
        "whiteBalance": "WB 설정",
        "shiftRed": "Red 시프트 (-9~+9)",
        "shiftBlue": "Blue 시프트 (-9~+9)", 
        "highlight": "Highlight (-2~+4)",
        "shadow": "Shadow (-2~+4)",
        "color": "Color (-4~+4)",
        "clarity": "Clarity (-5~+5)",
        "noiseReduction": "Noise Reduction (-4~+4)"
      }
    },
    "generated": {
      "title": "AI 생성 레시피 제목 (AI Generated)",
      "baseFilmSimulation": "베이스 필름 시뮬레이션",
      "recommendationReason": "추천 이유",
      "settings": { /* 동일한 구조 */ }
    }
  }
}
\`\`\``;

  const fullSystemMessage = [
    systemInstructions,
    "",
    settingsGuide,
    "",
    jsonSchema,
    "",
    "[검색된 문서 컨텍스트]",
    "{context}"
  ].join("\n");

  return ChatPromptTemplate.fromMessages([
    ["system", fullSystemMessage],
    ["human", "{question}"],
  ]);
};

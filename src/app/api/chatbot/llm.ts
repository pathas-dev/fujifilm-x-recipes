import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  SENSOR_CAMERA_MAPPINGS,
  COLOR_TYPES,
  FilmSimulations,
} from "@/types/camera-schema";

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
  return SENSOR_CAMERA_MAPPINGS.map(
    ({ sensor, cameras }) => `       ${sensor}: ${cameras.join(", ")}`
  ).join("\n");
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
${FilmSimulations.join(", ")}

## 주의 사항
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

## 공통 출력 요구사항
- **정확히 2개의 레시피만** 제공하세요
- **완전한 설정값**과 URL 정보를 포함하세요
- **설정값** 이 정확하게 매핑되지 않는 경우 기본값을 사용하세요
- **반드시 JSON 형식으로만** 응답하세요

## 첫 번째 레시피 요구사항
- **검색된 레시피 중** 가장 유사한 것을 제시하세요.
- **추천 이유**를 간략히 설명하세요

## 두 번째 레시피 요구사항
- **제목**은 일관된 언어로 감성적인 느낌을 살려서 작성하세요. ex) "한 여름밤의 꿈", "좋은 하루 끝", "Echoes of yesterday", "Dreaming in shades of twilight" 
- 제목에 **(AI Generated)** 를 추가하세요. 
- 참고한 자료들을 최대한 활용해서 추천 이유를 상세하게 작성하세요.
- **추천 이유**에는 검색된 레시피의 이름이나 카메라 이름을 언급하지 말고, 필름이나 세팅 등의 특징들을 참고해서 작성하세요.
- base Film Simulation은 검색된 레시피 중에서 하나를 고르고 하나도 없는 경우 컬러는 **Provia**, 흑백은 **ACROS** 를 사용하세요.
`;

  const settingsGuide = `## 카메라 설정 가이드

### Film Simulations
- **PROVIA**: 표준, 만능, 자연스러운 색감
- **Velvia**: 고채도, 고대비, 생생한 색감, 풍경용  
- **ASTIA**: 소프트, 화사한 피부톤, 부드러운 색감, 인물용
- **Classic Chrome**: 다큐멘터리, 차분한 색감, 낮은 채도, 매거진룩
- **PRO Neg. Hi**: 인물용, 스튜디오, 강한 대비, 입체감
- **PRO Neg. Std**: 인물용, 부드러운 계조, 자연스러운 피부톤
- **Classic Negative**: 클래식필름, 스냅사진, 독특한 색감, 아날로그 감성
- **ETERNA**: 영화적, 시네마틱, 낮은 채도, 영상용
- **ETERNA Bleach Bypass**: 고대비 저채도, 하드한 느낌, 강렬함
- **REALA ACE**: 충실한 색재현, 네거티브필름, 부드러운 계조
- **NOSTALGIC Neg.**: 1970년대, 뉴컬러, 앰버톤, 따뜻한 감성
- **ACROS**: 고품질 흑백, 풍부한 계조, 뛰어난 디테일
- **Monochrome**: 표준 흑백, 깔끔함

### 주요 설정 효과
- **Dynamic Range**: [AUTO, DR100%, DR200%, DR400%] 기본값: AUTO - 높을수록 계조가 풍부해짐 (밝고 어두운 부분 디테일 향상)
- **ISO**: 이미지 감도 설정, 낮을수록 노이즈 감소
- **Exposure**: 노출 보정, 기본값: 0 - 높을 수록 밝아짐
- **Priority**: [auto, off, weak, strong] 기본값: auto - 'off'로 설정 시 센서 원본 데이터가 직접 반영됨
- **Grain Size**: [off, small, large] 기본값: off - 입자가 클수록 아날로그 필름 질감
- **Grain Effect**: [off, weak, strong] 기본값: off - 강할수록 입자감이 뚜렷해짐
- **Colour Chrome**: [off, weak, strong] 기본값: off - 고채도 영역에서 색 표현력을 향상시켜, 깊이감과 입체감을 더하고 자연스러운 선명함을 표현
- **Colour Chrome FX Blue**: [off, weak, strong] 기본값: off - 파란색 계열의 색감을 더욱 풍부하게 표현해 주는 기능
- **White Balance**: 'Auto WB(AWB)'로 자연스러운 색온도 자동 조정, 촬영 환경에 따라 적절한 설정을 선택하여 사진의 색감을 조정
- **Shift(Blue)**: [-9~+9] 기본값: 0 - 낮음 = 따뜻한 톤, 높음 = 차가운 톤
- **Shift(Red)**: [-9~+9] 기본값: 0 - 낮음 = 차가운 톤, 높음 = 따뜻한 톤
- **Highlight**: [-2~+4] 기본값: 0 - 높은 값(+) = 밝은 영역 디테일 보존, 부드러운 계조
- **Shadow**: [-2~+4] 기본값: 0 - 높은 값(+) = 어두운 영역 디테일 살림
- **Color**: [-4~+4] 기본값: 0 - 높은 값 = 채도 강화, 생생한 색상, Color 대신 Tone 에 대한 설명만 있다면 Color 에 할당
- **Sharpness**: [-2~+4] 기본값: 0 - 높은 값(+) = 이미지의 디테일 표현을 조절하는 기능으로 높을수록 사진이 또렷해짐
- **Clarity**: [-4~+4] 기본값: 0 - 높은 값(+) = 명료도 - 중간톤 대비 조절, 이미지의 질감과 입체감을 향상
- **Noise Reduction**: [-4~+4] 기본값: 0 - 높은 값 = 깨끗하고 매끄러운 이미지`;

  const fullSystemMessage = [
    systemInstructions,
    "",
    settingsGuide,

    "",
    "[검색된 문서 컨텍스트]",
    "{context}",
  ].join("\n");

  return ChatPromptTemplate.fromMessages([
    ["system", fullSystemMessage],
    ["human", "{question}"],
  ]);
};

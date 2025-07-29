import { COLOR_TYPES } from '@/types/camera-schema';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createLangfuseCallback } from './langfuse-callback';

export enum GoogleAIModel {
  GeminiFlash = 'gemini-2.0-flash',
  GeminiFlashLite = 'gemini-2.0-flash-lite',
}

export const createLLM = (
  model: GoogleAIModel = GoogleAIModel.GeminiFlash,
  options?: {
    sessionId?: string;
  }
) => {
  const callback = createLangfuseCallback(options?.sessionId);
  
  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model,
    streaming: false,
    temperature: 0.3,
    callbacks: callback ? [callback] : undefined,
  });
};

const filmSimulationInstruction = `
### Film Simulations
- **Provia**: 표준, 만능, 자연스러운 색감
- **Velvia**: 고채도, 고대비, 생생한 색감, 풍경용  
- **Astia**: 소프트, 화사한 피부톤, 부드러운 색감, 인물용
- **Classic Chrome**: 다큐멘터리, 차분한 색감, 낮은 채도, 매거진룩
- **PRO Neg. Hi**: 인물용, 스튜디오, 강한 대비, 입체감
- **PRO Neg. Std**: 인물용, 부드러운 계조, 자연스러운 피부톤
- **Classic Negative**: 클래식필름, 스냅사진, 독특한 색감, 아날로그 감성
- **Eterna**: 영화적, 시네마틱, 낮은 채도, 영상용
- **Eterna Bleach Bypass**: 고대비 저채도, 하드한 느낌, 강렬함
- **Reala Ace**: 충실한 색재현, 네거티브필름, 부드러운 계조
- **Nostalgic Neg.**: 1970년대, 뉴컬러, 앰버톤, 따뜻한 감성
- **Acros**: 고품질 흑백, 풍부한 계조, 뛰어난 디테일
- **Monochrome**: 표준 흑백, 깔끔함
`;

export const createParseQuestionPromptTemplate = () => {
  const systemMessage = `# 후지필름 카메라 질문 분석 전문가

## 역할
당신은 후지필름 X 시리즈 카메라와 필름 시뮬레이션 레시피 전문가입니다.

## 주요 작업
사용자의 질문을 분석하여 다음을 파악하세요:
1. **관련성 판단**: 후지필름 카메라/레시피/필름/사진 관련 질문인지 확인
2. **색상 모드 분석**: 컬러 또는 흑백 사진 관련 질문인지 판단
3. **필름 시뮬레이션**: 특정 필름 시뮬레이션을 직접 언급한 경우 해당 필름 시뮬레이션, 그렇지 않은 경우 비슷한 느낌의 시뮬레이션을 복수 포함
4. **질문 개선**: 사용자의 질문을 좀 더 감성적이고 풍부하게 확장해서 벡터 검색에 용이하게 수정, 필름 시뮬레이션이 언급된 경우 해당 시뮬레이션의 특징을 활용, 필름 시뮬레이션과 설정 이름은 영어로만 작성

## 질문 개선 예시
- 입력1: "Classic Chrome 으로 인물 사진 찍는 레시피 추천해줘"
- 출력1: "차분한 색감과 낮은 채도를 기반으로 한 인물 사진 촬영에 적합한 레시피"
- 입력2: "X-T30 겨울 느낌 사진 추천해줘"
- 출력2: "차가운 겨울의 느낌을 청명하게 잘 살리면서 은은한 대비를 통해 겨울의 감성을 표현한 레시피"

## 참조 데이터

### 색상 타입
${COLOR_TYPES.join(' / ')}


${filmSimulationInstruction}

## 주의 사항
관련 없는 질문의 경우 판단 이유를 명확히 제시하세요.
관련 질문의 경우 모든 분석 요소를 정확히 추출하세요.`;

  return ChatPromptTemplate.fromMessages([
    ['system', systemMessage],
    ['human', '{question}'],
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
- **Context** 의 묘사, 설정, 필름 등을 최대한 활용해서 추천 이유를 상세하게 작성하세요.
- **카메라, 센서, Context 레시피 이름** 등 고유 명사에 대한 직접적인 언급은 하지 마세요.
- **필름 시뮬레이션**이나 **설정**을 언급하는 경우 영어로 작성하세요,
- **반드시 JSON 형식으로만** 응답하세요

## 첫 번째 레시피 요구사항
- Context 에 **검색된 레시피 중** 첫 번째 레시피만 활용하세요.

## 두 번째 레시피 요구사항
- **제목**은 일관된 언어로 감성적인 느낌을 살려서 작성하세요. ex) "한 여름밤의 꿈", "좋은 하루 끝", "Echoes of yesterday", "Dreaming in shades of twilight"
- Context 에 **검색된 레시피 중** 첫 번째 레시피를 제외한 다른 레시피들만 활용하세요.
- Context 에 **검색된 레시피가 하나 이하인 경우** 사용자 질문에 대한 답변을 알고 있는 필름 시뮬레이션, 설정 정보를 최대한 활용해서 답변하세요.
- base Film Simulation은 검색된 레시피 중에서 하나를 고르고 하나도 없는 경우 컬러는 **Provia**, 흑백은 **ACROS** 를 사용하세요.
`;

  const settingsGuide = `## 카메라 설정 가이드

${filmSimulationInstruction}

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
    '',
    settingsGuide,

    '',
    '[Context]',
    '{context}',
  ].join('\n');

  return ChatPromptTemplate.fromMessages([
    ['system', fullSystemMessage],
    ['human', '{question}'],
  ]);
};

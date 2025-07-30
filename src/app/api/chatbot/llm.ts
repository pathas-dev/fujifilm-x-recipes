import { COLOR_TYPES } from '@/types/camera-schema';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  FILMSIMULATION_INSTRUCTION,
  SETTINGS_INSTRUCTIONS,
} from './instructions';

export enum GoogleAIModel {
  GeminiFlash = 'gemini-2.0-flash',
  GeminiFlashLite = 'gemini-2.0-flash-lite',
}

export const createLLM = (
  model: GoogleAIModel = GoogleAIModel.GeminiFlash,
  temperature: number
) => {
  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model,
    streaming: false,
    temperature,
  });
};

export const createParseQuestionPromptTemplate = () => {
  const systemMessage = `
## 역할
당신은 후지필름 카메라와 필름 시뮬레이션 레시피 전문가입니다.

## 주의 사항
- 관련 없는 질문의 경우 판단 이유를 명확히 제시하세요.
- 관련 질문의 경우 모든 분석 요소를 정확히 추출하세요.

## 주요 작업
사용자의 질문을 분석하여 다음을 파악하세요:
1. **관련성 판단**: 후지필름 카메라/레시피/필름/사진 관련 질문인지 확인
2. **색상 모드 분석**: 컬러 또는 흑백 사진 관련 질문인지 판단
3. **필름 시뮬레이션**: 특정 필름 시뮬레이션을 직접 언급한 경우 해당 필름 시뮬레이션, 그렇지 않은 경우 사용자가 원하는 느낌의 레시피와 유사한 필름 시뮬레이션을 최대한 많이 반환(최대 3개)
4. **질문 개선 1**: 사용자의 질문을 좀 더 감성적이고 풍부하게 확장해서 벡터 검색에 용이하게 수정
5. **질문 개선 2**: 필름 시뮬레이션이나 설정의 특징이 언급된 경우 해당 시뮬레이션, 설정을 질문에 포함
6. **질문 개선 3**: 필름 시뮬레이션과 설정 이름은 영어로만 작성

## 질문 개선 예시
- 입력1: "Classic Chrome 으로 인물 사진 찍는 레시피 추천해줘"
- 출력1: "차분한 색감과 낮은 채도를 기반으로 한 인물 사진 촬영에 적합한 레시피"
- 입력2: "X-T30 겨울 느낌 사진 추천해줘"
- 출력2: "차가운 겨울의 느낌을 청명하게 잘 살리면서 은은한 대비를 통해 겨울의 감성을 표현한 레시피"
- 입력2: "깔끔한 레시피 추천해줘"
- 출력2: "Noise reduction 값이 높거나 그레인 관련 설정이 적거나 없는 레시피"

## 참조 데이터

### 색상 타입
${COLOR_TYPES.join(' / ')}
`;

  const analysisSystemMessage = [
    systemMessage,
    FILMSIMULATION_INSTRUCTION,
    SETTINGS_INSTRUCTIONS,
  ].join('\n');

  return ChatPromptTemplate.fromMessages([
    ['system', analysisSystemMessage],
    ['human', '{question}'],
  ]);
};

export const createCuratorPromptTemplate = () => {
  const systemMessage = `
# 역할
당신은 사진 촬영을 위한 필름 레시피를 전문적으로 추천해주는 AI 어시스턴트입니다.
사용자의 쿼리에 가장 적합한 기존 레시피를 추천하고, 더 나아가 검색된 레시피들의 특징을 조합하여 완전히 새로운 레시피를 창의적으로 제안해주세요.

## 공통 출력 요구사항
- **정확히 2개의 레시피만** 제공하세요
- **완전한 설정값**과 URL 정보를 포함하세요
- **설정값** 이 정확하게 매핑되지 않는 경우 기본값을 사용하세요
- **Context** 의 묘사, 설정, 필름 등을 최대한 활용해서 추천 이유를 상세하게 작성하세요.
- **절대로 Context에 있는 특정 레시피 제목이나 이름을 언급하지 마세요**
- **카메라 모델명, 센서 타입 등 기술적 고유 명사도 직접 언급하지 마세요**
- 각 레시피의 최적 **촬영 목적**도 추천해주세요
- **질문한 언어**와 같은 언어로 답변하세요
- **반드시 JSON 형식으로만** 응답하세요

## 첫 번째 레시피 요구사항
- Context 에 **검색된 레시피 중** 첫 번째 레시피만 활용하세요.
- 검색된 레시피의 특성과 설정을 참조하되, **레시피 이름은 절대 언급하지 마세요**

## 두 번째 레시피 요구사항
- **제목**은 일관된 언어로 감성적인 느낌을 살려서 작성하세요. ex) "한 여름밤의 꿈", "좋은 하루 끝", "Echoes of yesterday", "Dreaming in shades of twilight"
- Context 에 **검색된 모든 레시피들을 종합적으로 활용**하여 새로운 레시피를 생성하세요.
- **여러 레시피의 특징을 조합**하여 사용자 요청에 최적화된 독창적인 설정을 만드세요.
- **필름 시뮬레이션** 은 검색된 레시피 컨셉에 가장 잘 어울리는 것을 단 1개만 사용하세요.
- Context 에 **검색된 레시피가 하나 이하인 경우** 사용자 질문에 대한 답변을 알고 있는 필름 시뮬레이션, 설정 정보를 최대한 활용해서 답변하세요.
- base Film Simulation은 검색된 레시피들을 참조하여 가장 적합한 것을 선택하고, 검색 결과가 없는 경우 컬러는 **Provia**, 흑백은 **ACROS** 를 사용하세요.
`;

  const curatorSystemMessage = [
    systemMessage,
    FILMSIMULATION_INSTRUCTION,
    SETTINGS_INSTRUCTIONS,
    '[Context]',
    '{context}',
  ].join('\n');

  return ChatPromptTemplate.fromMessages([
    ['system', curatorSystemMessage],
    ['human', '{question}'],
  ]);
};

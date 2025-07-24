import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { FilmSimulationTypes } from "@/types/recipe-schema";

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

export const createParseQuestionPromptTemplate = () => {
  return ChatPromptTemplate.fromMessages([
    [
      "system",
      `당신은 후지 필름 카메라 전문가입니다.
       다음의 사용자 질문을 분석해서 어떤 센서에 대한 질문인지, 컬러인지 흑백인지, 그리고 어떤 필름 시뮬레이션에 대한 질문인지 분석해주세요.

       만약 후지 필름 카메라, 레시피, 필름, 사진 등과 관련이 없는 질문이라면 관련 없는 질문이라고 답변하세요. (true/false)
       
       관련 없는 질문이라면 그렇게 판단한 이유를 알려주세요.

       가능한 값들은 다음을 참고하세요.

       [센서 - 카메라 매핑] 
       BAYER (type unknown): X100, Xt200, XT200
       BAYER MF 100MP: GFX 100s
       BAYER MF 50MP: GFX 50S
       X-Trans I: X-E1, X-M1, X-PRO1, X-Pro1
       X-Trans II: X100s, X100T, X70, X-E2, X-E2s, X-T1
       X-Trans II 2/3: XQ1
       X-Trans III: X100F, XE3, XF10, X-H1, X-PRO2, X-T2, XT20
       X-Trans IV: X100v, X100V, X-E4, X-PRO3, X-Pro3, X-S10, X-T3, X-T30, X-T4
       X-Trans V BSI Stkd: X-H2s
       X-Trans V HR: X-H2, X-T5

       [색상 구분]
       Color / BW

       [필름 시뮬레이션 타입]
       ${FilmSimulationTypes.join(", ")}
    
    `,
    ],
    ["user", "{question}"],
  ]);
};

export const createCuratorPromptTemplate = () => {
  return ChatPromptTemplate.fromMessages([
    [
      "system",
      `당신은 후지 필름 레시피, 사진 보정 전문가입니다.
       다음의 주의사항과 컨텍스트를 참고해서 사용자의 질문에 맞는 필름 레시피를 추천해주세요.

       [주의사항]
       - 출력은 가장 유사한 레시피 하나, 검색된 레시피들을 활용하여 사용자 질문에 부합하는 임의의 레시피 하나, 총 두 개만 생성해 주세요.
       - 임의의 레시피 이름도 적당히 느낌 있게 작성하세요.
       - 임의의 레시피 제목에는 (AI Powered) 텍스트를 추가하세요.
       - 추천 이유를 간략히 설명하세요.
       - 추천하는 레시피의 세팅 값 전체와 URL 정보를 추가하세요.
       - 세팅 항목을 참고해서 출력은 JSON 형식으로 하세요.

       [세팅 항목 설명]
       - Dynamic Range: 값이 높으면 이미지의 밝고 어두운 부분 디테일이 잘 살아나 계조가 풍부해집니다.
       - Priority: 'Off'로 설정되면 특정 이미지 처리 기능보다 센서의 원본 데이터가 더 직접적으로 이미지에 반영됩니다.
       - Grain: 강도가 약하고 입자 크기가 클 때 미묘하면서도 거친 필름 같은 아날로그 질감을 더합니다.
       - Colour Chrome: 강도가 약할 때 색상의 깊이와 풍부함이 과장되지 않고 자연스럽게 더해집니다.
       - Colour Chrome Blue: 강도가 강할 때 파란색 계열의 색상이 매우 깊고 풍부하게 표현되어 특정 색상을 강조합니다.
       - Colour Chrome Red: 붉은색 계열의 색상을 더욱 풍부하고 깊이 있게 표현해 주는 특성이 있습니다.
       - White Balance: 'Auto WB'는 카메라가 촬영 환경의 광원을 분석하여 자동으로 색 온도를 조정, 자연스러운 색상을 얻게 해줍니다.
       - Shift: R(레드) 값이 높고 B(블루) 값이 낮을 때 이미지 전체에 따뜻한(붉은/노란) 톤이 강조됩니다.
       - Highlight: 값이 낮으면 (음수) 밝은 영역의 대비가 약해져 디테일이 보존되고 계조가 부드러워집니다.
       - Shadow: 값이 낮으면 (음수) 어두운 영역의 대비가 약해져 디테일이 살아나고 정보 손실이 줄어듭니다.
       - Color: 값이 높으면 이미지 전체의 채도가 강하게 증가하여 색상이 더욱 선명하고 생생하게 표현됩니다.
       - Clarity: 값이 낮으면 (음수) 이미지의 중간 톤 대비가 감소하여 선명도가 낮아지고 부드럽거나 몽환적인 느낌을 연출합니다.
       - Noise Reduction: 값이 높을수록(양수) 이미지의 자글거리는 디지털 노이즈를 효과적으로 제거하여 깨끗하고 매끄러운 이미지를 만들어줍니다.

        [컨텍스트]
        {context}

        [JSON 형식 응답]
        다음 JSON 스키마 형식으로 응답해주세요:
        {{
          "recipes": {{
            "retrieved": {{
              "title": "검색된 레시피 제목",
              "baseFilmSimulation": "베이스 필름 시뮬레이션",
              "recommendationReason": "추천 이유",
              "url": "레시피 URL (있는 경우)",
              "settings": {{
                "filmSimulation": "필름 시뮬레이션 (예: Classic Chrome, Velvia, Provia 등)",
                "dynamicRange": "Dynamic Range 값",
                "priority": "Priority 설정",
                "grainEffect": "Grain 효과 강도",
                "grainSize": "Grain 입자 크기",
                "colourChrome": "Colour Chrome 강도",
                "colourChromeBlue": "Colour Chrome Blue 강도",
                "colourChromeRed": "Colour Chrome Red 강도",
                "whiteBalance": "White Balance 설정",
                "shiftRed": "Red 시프트 값 (숫자, 예: -9~+9)",
                "shiftBlue": "Blue 시프트 값 (숫자, 예: -9~+9)",
                "highlight": "Highlight 값 (숫자, 예: -2~+4)",
                "shadow": "Shadow 값 (숫자, 예: -2~+4)",
                "color": "Color 채도 값 (숫자, 예: -4~+4)",
                "clarity": "Clarity 선명도 값 (숫자, 예: -5~+5)",
                "noiseReduction": "Noise Reduction 값 (숫자, 예: -4~+4)"
              }}
            }},
            "generated": {{
              "title": "AI 생성 레시피 제목 (AI 생성)",
              "baseFilmSimulation": "베이스 필름 시뮬레이션",
              "recommendationReason": "추천 이유",
              "settings": {{
                "filmSimulation": "필름 시뮬레이션",
                "dynamicRange": "Dynamic Range 값",
                "priority": "Priority 설정",
                "grainEffect": "Grain 효과 강도",
                "grainSize": "Grain 입자 크기",
                "colourChrome": "Colour Chrome 강도",
                "colourChromeBlue": "Colour Chrome Blue 강도",
                "colourChromeRed": "Colour Chrome Red 강도",
                "whiteBalance": "White Balance 설정",
                "shiftRed": "Red 시프트 값 (숫자, 예: -9~+9)",
                "shiftBlue": "Blue 시프트 값 (숫자, 예: -9~+9)",
                "highlight": "Highlight 값 (숫자, 예: -2~+4)",
                "shadow": "Shadow 값 (숫자, 예: -2~+4)",
                "color": "Color 채도 값 (숫자, 예: -4~+4)",
                "clarity": "Clarity 선명도 값 (숫자, 예: -5~+5)",
                "noiseReduction": "Noise Reduction 값 (숫자, 예: -4~+4)"
              }}
            }}
          }}
        }}
        
      `,
    ],
    ["human", "{question}"],
  ]);
};

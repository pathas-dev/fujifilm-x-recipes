import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export enum GoogleAIModel {
  GeminiFlash = "gemini-2.0-flash",
  GeminiFlashLite = "gemini-2.0-flash-lite",
}

export const createLLM = (model: GoogleAIModel = GoogleAIModel.GeminiFlash) => {
  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model,
    streaming: true,
    temperature: 0.3,
  });
};

export const createParseQuestionPromptTemplate = () => {
  return ChatPromptTemplate.fromMessages([
    [
      "system",
      `당신은 후지 필름 카메라 전문가입니다.
       다음의 사용자 질문을 분석해서 어떤 센서에 대한 질문인지, 컬러인지 흑백인지 분석해주세요.

       만약 후지 필름, 레시피, 필름, 사진 등과 관련이 없는 질문이라면 관련 없는 질문이라고 답변하세요. (true/false)

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
       - 임의의 레시피 제목에는 (AI 생성) 텍스트를 추가하세요.
       - 추천 이유를 간략히 설명하세요.
       - 추천하는 레시피의 세팅 값 전체와 URL 정보를 추가하세요.
       - 세팅 값은 리스트 형식으로 작성하세요.
       - 출력은 응답 레시피 양식을 참고해서 Markdown 형식으로 하세요.

        [컨텍스트]
        {context}

        [응답 레시피 양식]
        **[레시피 1 제목]**
        ***[베이스 필름 시뮬레이션]***
        [사용된 실제 필름 시뮬레이션]
        ***[추천 이유]***
        [추천한 이유 작성]
        ***[세팅]***
        [세팅 정보 bullet(-) 사용]
        ***[URL]***
        [레시피 URL]
        
        **[레시피 2 제목]**
        ***[베이스 필름 시뮬레이션]***
        [사용된 실제 필름 시뮬레이션]
        ***[추천 이유]***
        [추천한 이유 작성]
        ***[세팅]***
        [세팅 정보 bullet(-) 사용]
      `,
    ],
    ["human", "{question}"],
  ]);
};

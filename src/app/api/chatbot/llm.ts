import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export const createLLM = () => {
  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.0-flash",
    streaming: true,
  });
};

export const createPromptTemplate = () => {
  return ChatPromptTemplate.fromMessages([
    [
      "system",
      `당신은 후지 필름 레시피, 사진 보정 전문가입니다.
       다음의 컨텍스트를 참고해서 사용자의 질문에 맞는 필름 레시피를 추천해주세요.

       - 출력은 가장 유사한 레시피 하나, 검색된 레시피들을 활용하여 사용자 질문에 부합하는 임의의 레시피 하나, 총 두 개만 생성해 주세요.
       - 임의의 레시피 이름도 적당히 느낌 있게 작성하세요.
       - 추천 이유를 간략히 설명하세요.
       - 추천하는 레시피의 세팅 값 전체와 URL 정보를 추가하세요.
       - 세팅 값은 줄바꿈을 통해 가독성을 높이세요.
       - 출력은 Markdown 형식으로 하세요.

        [context]
        {context}
      `,
    ],
    ["human", "{question}"],
  ]);
};

import { formatContext } from "@/app/api/chatbot/context";
import {
  createCuratorPromptTemplate,
  createLLM,
  createParseQuestionPromptTemplate,
  GoogleAIModel,
} from "@/app/api/chatbot/llm";
import { retrieve } from "@/app/api/chatbot/retrieval";
import { QuestionAnalysisSchema } from "@/app/api/chatbot/shema";
import { CuratorResponseSchema } from "@/types/recipe-schema";
import { retouchImage } from "@/utils/retouchImage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    console.log("Processing question:", question);

    // 1. 질문 파싱
    try {
      const parsingLLM = createLLM(GoogleAIModel.GeminiFlashLite);
      const parsingPrompt = createParseQuestionPromptTemplate();
      const parsingChain = parsingPrompt.pipe(
        parsingLLM.withStructuredOutput(QuestionAnalysisSchema)
      );
      const parsedQuestion = await parsingChain.invoke({ question });
      console.log("Parsed question:", parsedQuestion);

      if (!parsedQuestion.isFilmRecipeQuestion) {
        return NextResponse.json("필름 레시피에 대한 질문을 해주세요.", {
          status: 200,
        });
      }

      // 2. 문서 검색
      const documents = await retrieve(question, {
        colorOrBw: parsedQuestion.colorOrBw,
        sensor: parsedQuestion.detectedSensorTypes,
      });
      const context = formatContext(documents);

      // 3. 큐레이터 응답 생성
      const curatorLLM = createLLM();
      const curatorPrompt = createCuratorPromptTemplate();
      const curatorChain = curatorPrompt.pipe(
        curatorLLM.withStructuredOutput(CuratorResponseSchema)
      );

      const curated = await curatorChain.invoke({ context, question });

      // 4. 이미지 처리
      const settings = curated.recipes?.generated?.settings;
      if (settings) {
        try {
          const source = await retouchImage("source.jpg", "webp", {
            width: 800,
            returnBase64: true,
          });
          const retouched = await retouchImage("source.jpg", "webp", {
            width: 800,
            returnBase64: true,
            cameraSettings: {
              highlightTone: settings.highlight,
              noiseReduction: settings.noiseReduction,
              shadowTone: settings.shadow,
              color: settings.color,
              clarity: settings.clarity,
              whiteBalanceR: settings.shiftRed,
              whiteBalanceB: settings.shiftBlue,
            },
          });

          if (curated.recipes.generated) {
            curated.recipes.generated.sourceImage = source?.dataUrl;
            curated.recipes.generated.retouchedImage = retouched?.dataUrl;
            console.log("Images processed and attached");
          }
        } catch (imageError) {
          console.error("Image processing error:", imageError);
        }
      }

      return NextResponse.json({ recipes: curated.recipes });
    } catch (llmError) {
      console.error("LLM processing error:", llmError);
      throw llmError;
    }
  } catch (error) {
    console.error("Chatbot POST Error:", error);
    return NextResponse.json(
      { error: "Failed to process chatbot request" },
      { status: 500 }
    );
  }
}

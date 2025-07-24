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

      if (
        !parsedQuestion.isFilmRecipeQuestion &&
        parsedQuestion.rejectionReason
      ) {
        return NextResponse.json(parsedQuestion.rejectionReason, {
          status: 200,
        });
      }

      // 2. 문서 검색
      const documents = await retrieve(question, {
        colorOrBw: parsedQuestion.colorOrBw,
        sensor: parsedQuestion.detectedSensorTypes,
        filmSimulation: parsedQuestion.filmSimulation,
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
            isBw: parsedQuestion.colorOrBw === "B&W",
          });
          const retouched = await retouchImage("source.jpg", "webp", {
            width: 800,
            quality: 100,
            returnBase64: true,
            isBw: parsedQuestion.colorOrBw === "B&W",
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

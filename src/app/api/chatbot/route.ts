import { NextResponse } from "next/server";
import { retrieve } from "@/app/api/chatbot/retrieval";
import { formatContext } from "@/app/api/chatbot/context";
import {
  createLLM,
  createCuratorPromptTemplate,
  GoogleAIModel,
  createParseQuestionPromptTemplate,
} from "@/app/api/chatbot/llm";
import { createStreamingResponse } from "@/app/api/chatbot/streaming";
import { QuestionAnalysisSchema } from "@/app/api/chatbot/shema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    const parsingLLM = createLLM(GoogleAIModel.GeminiFlashLite);
    const parsingPrompt = createParseQuestionPromptTemplate();
    const parsingChain = parsingPrompt.pipe(
      parsingLLM.withStructuredOutput(QuestionAnalysisSchema)
    );
    const parsedQuestion = await parsingChain.invoke({ question });

    if (!parsedQuestion.isFilmRecipeQuestion) {
      return NextResponse.json("필름 레시피에 대한 질문을 해주세요.", {
        status: 200,
      });
    }

    const results = await retrieve(question, {
      colorOrBw: parsedQuestion.colorOrBw,
      sensor: parsedQuestion.detectedSensorTypes,
    });
    const context = formatContext(results);

    const curatorLLM = createLLM();
    const curatorPrompt = createCuratorPromptTemplate();
    const curatorChain = curatorPrompt.pipe(curatorLLM);

    const stream = await createStreamingResponse(
      curatorChain,
      context,
      question
    );

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chatbot POST Error:", error);
    return NextResponse.json(
      { error: "Failed to process chatbot request" },
      { status: 500 }
    );
  }
}

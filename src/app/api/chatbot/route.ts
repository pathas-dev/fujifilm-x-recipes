import { formatContext } from "@/app/api/chatbot/context";
import {
  createCuratorPromptTemplate,
  createLLM,
  createParseQuestionPromptTemplate,
  GoogleAIModel,
} from "@/app/api/chatbot/llm";
import { retrieve } from "@/app/api/chatbot/retrieval";
import { QuestionAnalysisSchema } from "@/app/api/chatbot/shema";
import {
  getClientIpAddress,
  getTrimmedMessages,
  addMessageToHistory,
  extractCommonFields,
  getFilteredChatHistory,
} from "@/app/api/chatbot/history";
import { CuratorResponseSchema } from "@/types/recipe-schema";
import { retouchImage } from "@/utils/retouchImage";
import { NextResponse } from "next/server";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    console.log("Processing question:", question);

    // Extract IP address for session ID
    const sessionId = getClientIpAddress(request);
    console.log("Session ID:", sessionId);

    // Get trimmed chat history
    const chatHistory = await getTrimmedMessages(sessionId);

    // 1. 질문 파싱
    try {
      const parsingLLM = createLLM(GoogleAIModel.GeminiFlashLite);
      const parsingPrompt = createParseQuestionPromptTemplate();
      const parsingChain = parsingPrompt.pipe(
        parsingLLM.withStructuredOutput(QuestionAnalysisSchema)
      );

      const parsedQuestion = await parsingChain.invoke({
        question,
      });

      if (
        !parsedQuestion.isFilmRecipeQuestion &&
        parsedQuestion.rejectionReason
      ) {
        return NextResponse.json(parsedQuestion.rejectionReason, {
          status: 200,
        });
      }

      // 2. 문서 검색
      const searchQuery = parsedQuestion.enhancedQuestion || question;
      const documents = await retrieve(searchQuery, {
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

      // Create RunnableWithMessageHistory for curator chain
      const curatorChainWithHistory = new RunnableWithMessageHistory({
        runnable: curatorChain,
        getMessageHistory: (sessionId: string) => getFilteredChatHistory(sessionId),
        inputMessagesKey: "question",
        historyMessagesKey: "chat_history",
      });

      const curated = await curatorChainWithHistory.invoke(
        { context, question },
        { configurable: { sessionId } }
      );

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

      // 5. Add conversation to history (with common fields only)
      await addMessageToHistory(sessionId, new HumanMessage(question));
      const simplifiedRecipes = extractCommonFields(curated.recipes);
      await addMessageToHistory(
        sessionId, 
        new AIMessage(JSON.stringify(simplifiedRecipes))
      );

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

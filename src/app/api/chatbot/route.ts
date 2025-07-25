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
import { z } from "zod";

export const dynamic = "force-dynamic";

interface AgentState {
  question: string;
  step:
    | "analyzing"
    | "searching"
    | "generating"
    | "processing"
    | "completed"
    | "error";
  analysis?: z.infer<typeof QuestionAnalysisSchema>;
  documents?: any[];
  context?: string;
  recipes?: z.infer<typeof CuratorResponseSchema>;
  images?: {
    source?: string;
    retouched?: string;
  };
  error?: string;
  response?: any;
  timing?: Record<string, number>;
}

// LLM 인스턴스 관리 개선 (메모리 누수 방지)
const llmCache = new Map<string, ReturnType<typeof createLLM>>();

const getOrCreateLLM = (model: GoogleAIModel): ReturnType<typeof createLLM> => {
  const cacheKey = `llm_${model}`;

  if (!llmCache.has(cacheKey)) {
    const llm = createLLM(model);
    llm.temperature = 0.3;
    llmCache.set(cacheKey, llm);

    // 10분 후 자동 정리
    setTimeout(() => {
      llmCache.delete(cacheKey);
    }, 10 * 60 * 1000);
  }

  return llmCache.get(cacheKey)!;
};

// 성능 측정 헬퍼
const measureTime = (label: string) => {
  const start = Date.now();
  return () => {
    const duration = Date.now() - start;
    console.log(`⏱️ ${label}: ${duration}ms`);
    return duration;
  };
};
// 프롬프트 입력 검증 헬퍼
const validatePromptInputs = (
  inputs: Record<string, any>,
  templateName: string
) => {
  console.log(`🔍 Validating prompt inputs for ${templateName}:`, inputs);

  for (const [key, value] of Object.entries(inputs)) {
    if (value === undefined) {
      console.warn(`⚠️ ${templateName}: '${key}' is undefined`);
    } else if (value === null) {
      console.warn(`⚠️ ${templateName}: '${key}' is null`);
    } else if (typeof value === "string" && value.trim() === "") {
      console.warn(`⚠️ ${templateName}: '${key}' is empty string`);
    }
  }

  return inputs;
};

// Agent 단계별 처리 함수들
class FujifilmRecipeAgent {
  private state: AgentState;

  constructor(question: string) {
    this.state = {
      question,
      step: "analyzing",
    };
  }

  async analyzeQuestion(): Promise<boolean> {
    try {
      console.log("🔍 Analyzing question:", this.state.question);
      const endTime = measureTime("Question Analysis");

      const parsingLLM = getOrCreateLLM(GoogleAIModel.GeminiFlashLite);
      const parsingPrompt = createParseQuestionPromptTemplate();

      const parsingChain = parsingPrompt.pipe(
        parsingLLM.withStructuredOutput(QuestionAnalysisSchema)
      );

      const inputs = validatePromptInputs(
        { question: this.state.question },
        "QuestionAnalysis"
      );

      const analysis = (await parsingChain.invoke(inputs)) as z.infer<
        typeof QuestionAnalysisSchema
      >;

      this.state.analysis = analysis;
      const duration = endTime();
      this.state.timing = { ...this.state.timing, analysis: duration };

      // 관련 없는 질문 처리
      if (!analysis.isFilmRecipeQuestion) {
        this.state.response = analysis.rejectionReason;
        this.state.step = "completed";
        return false; // 다음 단계로 진행하지 않음
      }

      this.state.step = "searching";
      return true;
    } catch (error) {
      console.error("Question analysis error:", error);
      this.state.error = "질문 분석 중 오류가 발생했습니다.";
      this.state.step = "error";
      return false;
    }
  }

  async searchDocuments(): Promise<boolean> {
    try {
      console.log("📚 Searching documents");
      const endTime = measureTime("Document Search");

      const searchQuery =
        this.state.analysis?.enhancedQuestion || this.state.question;
      this.state.documents = await retrieve(searchQuery, {
        colorOrBw: this.state.analysis?.colorOrBw || undefined,
        sensor: this.state.analysis?.detectedSensorTypes || undefined,
      });

      this.state.context = formatContext(this.state.documents);
      const duration = endTime();
      this.state.timing = { ...this.state.timing, search: duration };
      this.state.step = "generating";
      return true;
    } catch (error) {
      console.error("Document search error:", error);
      this.state.error = "문서 검색 중 오류가 발생했습니다.";
      this.state.step = "error";
      return false;
    }
  }

  async generateRecipes(): Promise<boolean> {
    try {
      console.log("👨‍🍳 Generating recipes");
      const endTime = measureTime("Recipe Generation");

      const curatorLLM = getOrCreateLLM(GoogleAIModel.GeminiFlash);
      const curatorPrompt = createCuratorPromptTemplate();

      const curatorChain = curatorPrompt.pipe(
        curatorLLM.withStructuredOutput(CuratorResponseSchema)
      );

      const inputs = validatePromptInputs(
        {
          context: this.state.context || "",
          question: this.state.question,
        },
        "RecipeGeneration"
      );

      const recipes = (await curatorChain.invoke(inputs)) as z.infer<
        typeof CuratorResponseSchema
      >;

      this.state.recipes = recipes;
      const duration = endTime();
      this.state.timing = { ...this.state.timing, generation: duration };
      this.state.step = "processing";
      return true;
    } catch (error) {
      console.error("Recipe generation error:", error);
      this.state.error = "레시피 생성 중 오류가 발생했습니다.";
      this.state.step = "error";
      return false;
    }
  }

  async processImages(): Promise<boolean> {
    try {
      console.log("🖼️ Processing images");
      const endTime = measureTime("Image Processing");

      const settings = this.state.recipes?.recipes?.generated?.settings;

      // 병렬로 이미지 처리 시작
      const sourcePromise = retouchImage("source.jpg", "webp", {
        width: 800,
        returnBase64: true,
        isBw: this.state.analysis?.colorOrBw === "B&W",
      });

      let retouchedPromise: Promise<any> | null = null;
      if (settings) {
        retouchedPromise = retouchImage("source.jpg", "webp", {
          width: 800,
          quality: 100,
          returnBase64: true,
          isBw: this.state.analysis?.colorOrBw === "B&W",
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
      }

      // 병렬 처리 완료 대기
      const [source, retouched] = await Promise.all([
        sourcePromise,
        retouchedPromise,
      ]);

      this.state.images = {
        source: source?.dataUrl,
        retouched: retouched?.dataUrl,
      };

      const duration = endTime();
      this.state.timing = { ...this.state.timing, imageProcessing: duration };
      this.state.step = "completed";
      return true;
    } catch (error) {
      console.error("Image processing error:", error);
      // 이미지 처리 실패해도 레시피는 반환
      this.state.images = {};
      this.state.step = "completed";
      return true;
    }
  }

  async finalizeResponse() {
    console.log("✅ Finalizing response");
    const endTime = measureTime("Response Finalization");

    // 전체 실행 시간 계산
    const totalTime = Object.values(this.state.timing || {}).reduce(
      (sum, time) => sum + time,
      0
    );

    // 이미지를 레시피에 추가
    if (this.state.recipes?.recipes?.generated && this.state.images) {
      if (this.state.images.source) {
        this.state.recipes.recipes.generated.sourceImage =
          this.state.images.source;
      }
      if (this.state.images.retouched) {
        this.state.recipes.recipes.generated.retouchedImage =
          this.state.images.retouched;
      }
    }

    const duration = endTime();
    const finalTiming = {
      ...this.state.timing,
      finalization: duration,
      total: totalTime + duration,
    };

    this.state.response = {
      recipes: this.state.recipes?.recipes,
      meta: {
        timing: finalTiming,
        hasError: !!this.state.error,
        error: this.state.error,
      },
    };
    this.state.timing = finalTiming;
  }

  getState(): AgentState {
    return this.state;
  }
}

// 통합된 POST 엔드포인트
export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    // 논스트리밍 모드 (기본)
    const agent = new FujifilmRecipeAgent(question);

    // 단계별 실행
    const shouldContinue = await agent.analyzeQuestion();
    if (!shouldContinue) {
      return NextResponse.json(agent.getState().response);
    }

    if (!(await agent.searchDocuments())) {
      return NextResponse.json(
        { error: agent.getState().error },
        { status: 500 }
      );
    }

    if (!(await agent.generateRecipes())) {
      return NextResponse.json(
        { error: agent.getState().error },
        { status: 500 }
      );
    }

    await agent.processImages();
    await agent.finalizeResponse();

    return NextResponse.json(agent.getState().response);
  } catch (error) {
    console.error("Agent POST Error:", error);
    return NextResponse.json(
      { error: "Failed to process agent request" },
      { status: 500 }
    );
  }
}

import { formatContext } from '@/app/api/chatbot/context';
import {
  createCuratorPromptTemplate,
  createLLM,
  createParseQuestionPromptTemplate,
  GoogleAIModel,
} from '@/app/api/chatbot/llm';
import { retrieve } from '@/app/api/chatbot/retrieval';
import {
  CameraModel,
  QuestionAnalysisSchema,
  SensorType,
} from '@/app/api/chatbot/shema';
import {
  CuratedRecipesSchema,
  CuratorResponse,
  MetaTiming,
} from '@/types/recipe-schema';
import { retouchImage } from '@/utils/retouchImage';
import z from 'zod';
import { SENSOR_CAMERA_MAPPINGS } from '../../../types/camera-schema';
import langfuseHandler from '../../../utils/langfuse';

// LLM 인스턴스 관리 개선 (메모리 누수 방지)
const llmCache = new Map<string, ReturnType<typeof createLLM>>();

const getOrCreateLLM = (
  model: GoogleAIModel,
  temperature: number = 1
): ReturnType<typeof createLLM> => {
  const cacheKey = `llm_${model}`;

  if (!llmCache.has(cacheKey)) {
    const llm = createLLM(model, temperature);
    llmCache.set(cacheKey, llm);

    // 10분 후 자동 정리
    setTimeout(
      () => {
        llmCache.delete(cacheKey);
      },
      10 * 60 * 1000
    );
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
    } else if (typeof value === 'string' && value.trim() === '') {
      console.warn(`⚠️ ${templateName}: '${key}' is empty string`);
    }
  }

  return inputs;
};

/**
 * 카메라 모델에 호환되는 센서 타입을 찾는 함수
 * @param cameraModel - 카메라 모델명
 * @returns 해당하는 센서 타입 배열
 */
export function findSensorsByCameraModel(
  cameraModel: CameraModel
): SensorType[] {
  const foundMapping = SENSOR_CAMERA_MAPPINGS.find((mapping) =>
    mapping.cameras.find(
      (camera) => camera.toUpperCase() === cameraModel.toUpperCase()
    )
  );

  const sensors = SENSOR_CAMERA_MAPPINGS.filter(
    (mapping) =>
      mapping.series === foundMapping?.series &&
      mapping.level <= foundMapping?.level
  ).map((mapping) => mapping.sensor);

  return sensors;
}

export const agentSteps = [
  'analyzing',
  'searching',
  'generating',
  'processing',
  'completed',
  'error',
] as const;

export type AgentStep = (typeof agentSteps)[number];

export interface FujifilmRecipeAgentState {
  question: string;
  cameraModel?: string;
  detectedSensors?: SensorType[];
  step: AgentStep;
  analysis?: z.infer<typeof QuestionAnalysisSchema>;
  documents?: any[];
  context?: string;
  recipes?: z.infer<typeof CuratedRecipesSchema>;
  images?: {
    source?: string;
    retouched?: string;
  };
  error?: string;
  response?: CuratorResponse;
  timing?: MetaTiming;
}

export class FujifilmRecipeAgent {
  private state: FujifilmRecipeAgentState;

  constructor(question: string, cameraModel: CameraModel) {
    const detectedSensors = findSensorsByCameraModel(cameraModel);

    this.state = {
      question,
      cameraModel,
      detectedSensors,
      step: 'analyzing',
    };

    if (cameraModel && detectedSensors.length > 0) {
      console.log(
        `📷 Camera model detected: ${cameraModel} -> Sensor: ${detectedSensors}`
      );
      console.log('FujifilmRecipeAgent 초기화 완료');
    } else {
      console.log('FujifilmRecipeAgent 센서 감지 실패');
    }
  }

  async analyzeQuestion(): Promise<boolean> {
    if (!this.state.cameraModel || !this.state.detectedSensors) {
      console.error('Detection Sensor error');
      this.state.error = '센서 감지 중 오류가 발생했습니다.';
      this.state.step = 'error';
      return false;
    }

    try {
      console.log('🔍 Analyzing question:', this.state.question);
      const endTime = measureTime('Question Analysis');

      const parsingLLM = getOrCreateLLM(GoogleAIModel.GeminiFlashLite);
      const parsingPrompt = createParseQuestionPromptTemplate();

      const parsingChain = parsingPrompt.pipe(
        parsingLLM.withStructuredOutput(QuestionAnalysisSchema)
      );

      const inputs = validatePromptInputs(
        { question: this.state.question },
        'QuestionAnalysis'
      );

      const analysis = (await parsingChain.invoke(inputs, {
        callbacks: [langfuseHandler],
      })) as z.infer<typeof QuestionAnalysisSchema>;

      this.state.analysis = analysis;
      const duration = endTime();
      this.state.timing = { ...this.state.timing, analysis: duration };

      // 관련 없는 질문 처리
      if (!analysis.isFilmRecipeQuestion) {
        this.state.response = analysis.rejectionReason;
        this.state.step = 'completed';
        return false; // 다음 단계로 진행하지 않음
      }

      this.state.step = 'searching';
      return true;
    } catch (error) {
      console.error('Question analysis error:', error);
      this.state.error = '질문 분석 중 오류가 발생했습니다.';
      this.state.step = 'error';
      return false;
    }
  }

  async searchDocuments(): Promise<boolean> {
    try {
      console.log('📚 Searching documents');
      const endTime = measureTime('Document Search');

      const searchQuery =
        this.state.analysis?.enhancedQuestion || this.state.question;

      this.state.documents = await retrieve(searchQuery, {
        colorOrBw: this.state.analysis?.colorOrBw ?? 'Color',
        sensors: this.state.detectedSensors ?? [],
        filmSimultations: this.state.analysis?.filmSimulations,
      });

      this.state.context = formatContext(this.state.documents);
      const duration = endTime();
      this.state.timing = { ...this.state.timing, search: duration };
      this.state.step = 'generating';
      return true;
    } catch (error) {
      console.error('Document search error:', error);
      this.state.error = '문서 검색 중 오류가 발생했습니다.';
      this.state.step = 'error';
      return false;
    }
  }

  async generateRecipes(): Promise<boolean> {
    try {
      console.log('👨‍🍳 Generating recipes');
      const endTime = measureTime('Recipe Generation');

      const curatorLLM = getOrCreateLLM(GoogleAIModel.GeminiFlash);
      const curatorPrompt = createCuratorPromptTemplate();

      const curatorChain = curatorPrompt.pipe(
        curatorLLM.withStructuredOutput(CuratedRecipesSchema)
      );

      const inputs = validatePromptInputs(
        {
          context: this.state.context || '',
          question: this.state.question,
        },
        'RecipeGeneration'
      );

      const recipes = (await curatorChain.invoke(inputs, {
        callbacks: [langfuseHandler],
      })) as z.infer<typeof CuratedRecipesSchema>;

      this.state.recipes = recipes;
      const duration = endTime();
      this.state.timing = { ...this.state.timing, generation: duration };
      this.state.step = 'processing';
      return true;
    } catch (error) {
      console.error('Recipe generation error:', error);
      this.state.error = '레시피 생성 중 오류가 발생했습니다.';
      this.state.step = 'error';
      return false;
    }
  }

  async processImages(): Promise<boolean> {
    try {
      console.log('🖼️ Processing images');
      const endTime = measureTime('Image Processing');

      const settings = this.state.recipes?.generated?.settings;

      // 병렬로 이미지 처리 시작
      const sourcePromise = retouchImage('source.jpg', 'webp', {
        width: 800,
        returnBase64: true,
        isBw: this.state.analysis?.colorOrBw === 'B&W',
      });

      let retouchedPromise: Promise<any> | null = null;
      if (settings) {
        retouchedPromise = retouchImage('source.jpg', 'webp', {
          width: 800,
          quality: 100,
          returnBase64: true,
          isBw: this.state.analysis?.colorOrBw === 'B&W',
          cameraSettings: {
            highlightTone: settings.highlight,
            noiseReduction: settings.noiseReduction,
            shadowTone: settings.shadow,
            color: settings.color,
            sharpness: settings.sharpness,
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
      this.state.step = 'completed';
      return true;
    } catch (error) {
      console.error('Image processing error:', error);
      // 이미지 처리 실패해도 레시피는 반환
      this.state.images = {};
      this.state.step = 'completed';
      return true;
    }
  }

  async finalizeResponse() {
    console.log('✅ Finalizing response');
    const endTime = measureTime('Response Finalization');

    // 전체 실행 시간 계산
    const totalTime = Object.values(this.state.timing || {}).reduce(
      (sum, time) => sum + time,
      0
    );

    // 이미지를 레시피에 추가
    if (this.state.recipes?.generated && this.state.images) {
      if (this.state.images.source) {
        this.state.recipes.generated.sourceImage = this.state.images.source;
      }
      if (this.state.images.retouched) {
        this.state.recipes.generated.retouchedImage =
          this.state.images.retouched;
      }
    }

    const duration = endTime();
    const finalTiming = {
      ...this.state.timing,
      finalization: duration,
      total: totalTime + duration,
    };

    if (!this.state.recipes) {
      this.state.error = '레시피 생성에 실패했습니다.';
      this.state.step = 'error';
      return true;
    }

    this.state.response = {
      recipes: this.state.recipes,
      meta: {
        timing: finalTiming,
        hasError: !!this.state.error,
        error: this.state.error,
      },
    };
    this.state.timing = finalTiming;
  }

  getStep(): AgentStep {
    return this.state.step;
  }

  getState(): FujifilmRecipeAgentState {
    return this.state;
  }
}

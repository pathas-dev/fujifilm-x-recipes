import { FujifilmSettingsSchema } from '@/types/camera-schema';
import { readCSV } from '@/utils/csvReader';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGroq } from '@langchain/groq';
import { PineconeEmbeddings, PineconeStore } from '@langchain/pinecone';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { z } from 'zod';

import path from 'path';
import {
    FILMSIMULATION_INSTRUCTION,
    SETTINGS_INSTRUCTIONS,
} from '../app/api/chatbot/instructions';
import { GroqModel } from '../app/api/chatbot/llm';
import { PINECONE_EMBEDDING_MODEL } from '../app/api/chatbot/retrieval';
import langfuseHandler from './langfuse';

export const dynamic = 'force-dynamic'; // defaults to auto

// 레시피 분석 결과 스키마
const RecipeAnalysisSchema = z.object({
  summary: z
    .string()
    .describe(
      '필름 시뮬레이션과 설정값을 최대한 참고하여 주어진 레시피의 특징과 느낌을 2-3문장으로 감성적으로 설명'
    ),
  settings: FujifilmSettingsSchema.describe('후지필름 카메라 설정 객체'),
  keywords: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe('레시피의 특징이 드러나는 키워드 목록'),
  shootingTypes: z
    .array(
      z.enum([
        'portrait',
        'landscape',
        'night',
        'documentary',
        'weddings',
        'snap',
        'daily',
      ])
    )
    .min(1)
    .max(2)
    .describe('레시피의 촬영 목적에 적합한 태그 목록'),
  moods: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe('레시피의 감성에 적합한 태그 목록'),
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    'system',
    `
# 역할
후지필름 X 시리즈 레시피 분석 전문가

## 요구사항
1. **Summary**: 필름 시뮬레이션과 설정값을 최대한 참고하여 주어진 레시피의 특징과 느낌을 2-3문장으로 감성적으로 설명
2. **Settings**: 레시피 문자열에서 후지필름 카메라 설정값들을 구조화된 객체로 추출하여 반환
3. **Keywords**: 필름 시뮬레이션과 설정값을 최대한 참고하여 주어진 레시피의 특징을 3-5개의 키워드로 설명, ex) ["시네마틱", "빈티지", "인물", "풍경", "필름", "대비"]
4. **ShootingTypes**: 레시피의 촬영 목적에 적합한 태그 1-2개를 반환 ex) ['snap', 'night']
5. **Moods**: 필름 시뮬레이션과 설정값을 최대한 참고하여 주어진 레시피로 나타낼 수 있는 감성적인 표현 1-5개의 태그로 설명, ex) ["따뜻한", "차가운", "몽환적인",  "드라마틱", "차분한"]

## Summary 작성 예시 
"이 레시피는 한여름 밤의 꿈처럼 아련하고, 고요하지만 생명력이 느껴지는, 그리고 어딘가 모르게 신비로운 감성을 담은 사진을 만들어 줄 수 있을 것입니다. 아마도 깊은 밤의 도시 풍경, 인적이 드문 한적한 길, 달빛 아래의 자연, 또는 창가에서 깊은 생각에 잠긴 인물 사진 등에 특히 잘 어울릴 것 같네요."

## Settings 추출 가이드

${FILMSIMULATION_INSTRUCTION}

${SETTINGS_INSTRUCTIONS}

`,
  ],
  ['human', `{recipe}`],
]);

// Groq LLM 모델 초기화
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: GroqModel.Llama8b,
  temperature: 0.3,
});

const chain = promptTemplate.pipe(
  llm.withStructuredOutput(RecipeAnalysisSchema)
);

// 429 Rate Limit 에러 재시도 헬퍼
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const invokeWithRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isRateLimitError =
        error instanceof Error &&
        (error.message.includes('429') ||
          error.message.toLowerCase().includes('rate limit'));

      if (isRateLimitError && attempt < maxRetries - 1) {
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        console.warn(
          `⚠️ Rate limit hit. Retrying in ${delayMs}ms... (attempt ${attempt + 1}/${maxRetries})`
        );
        await sleep(delayMs);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};

const embeddings = new PineconeEmbeddings({
  apiKey: process.env.PINECONE_API_KEY,
  model: PINECONE_EMBEDDING_MODEL,
});

const saveToPinecone = async (documents: Document[]) => {
  const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 50,
  });

  await vectorStore.addDocuments(documents, {
    ids: documents.map((document) => document.metadata.id.toString()),
  });
};

export const processRecipes = async () => {
  try {
    const fileRecipes = readCSV(path.resolve('public', 'film-recipes.csv'));

    const BATCH_SIZE = 20;
    const start = Date.now();

    console.log(`총 ${fileRecipes.length}개 레시피 처리 시작...`);

    for (let i = 0; i < fileRecipes.length; i += BATCH_SIZE) {
      const batch = fileRecipes.slice(i, i + BATCH_SIZE);
      const batchDocuments = await Promise.all(
        batch.map(async (recipe, batchIndex: number) => {
          try {
            const analysis = await invokeWithRetry(() =>
              chain.invoke(
                {
                  recipe: JSON.stringify(recipe),
                },
                { callbacks: [langfuseHandler] }
              )
            );
            console.log('🚀 ~ processRecipes ~ analysis:', analysis);

            return new Document({
              pageContent: [
                `[Summary] ${analysis.summary}`,
                `[Base Film Simulation] ${analysis.settings.filmSimulation}`,
                `[Keywords] ${analysis.keywords.join(',')}`,
                `[Moods] ${analysis.moods.join(',')}`,
                `[ShootingTypes] ${analysis.shootingTypes.join(',')}`,
                `[Settings] ${recipe.settings}`,
              ].join('\n'),
              metadata: {
                id: i + batchIndex,
                name: recipe.name,
                creator: recipe.creator,
                colorOrBw: recipe.colorOrBw,
                camera: recipe.camera,
                sensor: recipe.sensor,
                url: recipe.url,
                rawSettings: JSON.stringify(analysis.settings),
                settings_filmSimulation: analysis.settings.filmSimulation,
                settings_iso: analysis.settings.iso,
                settings_exposure: analysis.settings.exposure,
                settings_dynamicRange: analysis.settings.dynamicRange,
                settings_priority: analysis.settings.priority,
                settings_grainEffect: analysis.settings.grainEffect,
                settings_grainSize: analysis.settings.grainSize,
                settings_colourChrome: analysis.settings.colourChrome,
                settings_colourChromeFXBlue:
                  analysis.settings.colourChromeFXBlue,
                settings_whiteBalance: analysis.settings.whiteBalance,
                settings_shiftRed: analysis.settings.shiftRed,
                settings_shiftBlue: analysis.settings.shiftBlue,
                settings_highlight: analysis.settings.highlight,
                settings_shadow: analysis.settings.shadow,
                settings_color: analysis.settings.color,
                settings_clarity: analysis.settings.clarity,
                settings_sharpness: analysis.settings.sharpness,
                settings_noiseReduction: analysis.settings.noiseReduction,
              },
            });
          } catch (error) {
            console.error(`레시피 ${i + batchIndex} 처리 중 오류:`, error);
            throw error; // 배치 전체를 실패시키려면 throw, 계속하려면 null 반환
          }
        })
      );

      await saveToPinecone(batchDocuments);

      const processed = Math.min(i + BATCH_SIZE, fileRecipes.length);
      console.log(`${processed}/${fileRecipes.length}개 인덱싱 생성 완료`);
      console.log(`소요 시간: ${(Date.now() - start) / 1000}초`);
    }

    console.log('모든 레시피 처리 완료!');
    return { success: true, processed: fileRecipes.length };
  } catch (error) {
    console.error('Chatbot API Error:', error);
    return { success: false, error };
  }
};
// 직접 실행할 때만 처리 (스크립트로 실행)
if (require.main === module) {
  processRecipes().then((result) => {
    console.log('처리 결과:', result);
    process.exit(result.success ? 0 : 1);
  });
}

// const search = async (query: string) => {
//   const pinecone = new PineconeClient({
//     apiKey: process.env.PINECONE_API_KEY!,
//   });

//   const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

//   const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
//     pineconeIndex,
//     maxConcurrency: 50,
//   });

//   const results = await vectorStore.similaritySearch(query, 3, {
//     sensor: { $in: ['X-Trans V HR', 'X-Trans IV'] }, // $in 연산자로 배열 내 포함 여부 검색
//   });
//   console.log('🚀 ~ search ~ results:', results);

//   return results;
// };

// search('여름');

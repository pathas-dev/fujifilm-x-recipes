import { readCSV } from '@/utils/csvReader';
import { FujifilmSettingsSchema } from '@/types/camera-schema';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PineconeEmbeddings, PineconeStore } from '@langchain/pinecone';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { z } from 'zod';

import path from 'path';

export const dynamic = 'force-dynamic'; // defaults to auto

// 레시피 분석 결과 스키마
const RecipeAnalysisSchema = z.object({
  summary: z.string().describe('필름 시뮬레이션과 설정값을 최대한 참고하여 주어진 레시피의 특징과 느낌을 2-3문장으로 감성적으로 설명'),
  settings: FujifilmSettingsSchema.describe('후지필름 카메라 설정 객체'),
});

type RecipeAnalysis = z.infer<typeof RecipeAnalysisSchema>;

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    'system',
    `
# 역할
후지필름 X 시리즈 레시피 분석 전문가

## 요구사항
1. **Summary**: 필름 시뮬레이션과 설정값을 최대한 참고하여 주어진 레시피의 특징과 느낌을 2-3문장으로 감성적으로 설명
2. **Settings**: 레시피 문자열에서 후지필름 카메라 설정값들을 구조화된 객체로 추출하여 반환

## Summary 작성 예시 
"이 레시피는 한여름 밤의 꿈처럼 아련하고, 고요하지만 생명력이 느껴지는, 그리고 어딘가 모르게 신비로운 감성을 담은 사진을 만들어 줄 수 있을 것입니다. 아마도 깊은 밤의 도시 풍경, 인적이 드문 한적한 길, 달빛 아래의 자연, 또는 창가에서 깊은 생각에 잠긴 인물 사진 등에 특히 잘 어울릴 것 같네요."

## Settings 추출 가이드

### Film Simulations 특징
- **Provia**: 표준, 만능, 자연스러운 색감
- **Astia**: 소프트, 화사한 피부톤, 부드러운 색감, 인물용
- **Classic Chrome**: 다큐멘터리, 차분한 색감, 낮은 채도, 매거진룩
- **Classic Negative**: 클래식필름, 스냅사진, 독특한 색감, 아날로그 감성
- **Reala Ace**: 충실한 색재현, 네거티브필름, 부드러운 계조
- **Eterna**: 영화적, 시네마틱, 낮은 채도, 영상용
- **Eterna Bleach Bypass**: 고대비 저채도, 하드한 느낌, 강렬함
- **Nostalgic Neg.**: 1970년대, 뉴컬러, 앰버톤, 따뜻한 감성
- **Pro Neg. High**: 인물용, 스튜디오, 강한 대비, 입체감
- **Pro Neg. Std**: 인물용, 부드러운 계조, 자연스러운 피부톤
- **Velvia**: 고채도, 고대비, 생생한 색감, 풍경용  
- **ACROS**: 고품질 흑백, 풍부한 계조, 뛰어난 디테일
- **Monochrome**: 표준 흑백, 깔끔함
- **Sepia**: 세피아, 갈색톤, 복고풍

### 주요 설정 효과 및 범위
- **Dynamic Range**: [AUTO, DR100%, DR200%, DR400%] - 기본값: AUTO
- **ISO**: 이미지 감도 설정 문자열
- **Exposure**: 노출 보정 문자열 - 기본값: "0"
- **Priority**: [AUTO, OFF, WEAK, STRONG] - 기본값: AUTO
- **Grain Effect**: [OFF, WEAK, STRONG] - 기본값: OFF, 필름룩, 아날로그 감성, 빈티지
- **Grain Size**: [OFF, SMALL, LARGE] - 기본값: OFF
- **Colour Chrome**: [OFF, WEAK, STRONG] - 기본값: OFF, 색감 강조, 깊이 있는 색상  
- **Colour Chrome FX Blue**: [OFF, WEAK, STRONG] - 기본값: OFF, 파란색 계열 강조, 하늘과 바다의 선명도 향상
- **White Balance**: 색온도 자동 조정 문자열
- **Shift(Red)**: -9~+9 정수 - 기본값: 0, R 높음 = 따뜻한 톤
- **Shift(Blue)**: -9~+9 정수 - 기본값: 0, B 높음 = 차가운 톤
- **Highlight**: -2~+4 정수 - 기본값: 0, 낮음 = 부드러운 계조, 디테일 보존
- **Shadow**: -2~+4 정수 - 기본값: 0, 낮음 = 부드러운 계조, 디테일 보존
- **Color**: -4~+4 정수 - 기본값: 0, 높음 = 채도 강조, 생생한 색상
- **Clarity**: -4~+4 정수 - 기본값: 0, 낮음 = 부드러운 이미지, 몽환적 느낌
- **Sharpness**: -2~+4 정수 - 기본값: 0
- **Noise Reduction**: -4~+4 정수 - 기본값: 0, 높음 = 깨끗하고 매끄러운 이미지

레시피 문자열에서 해당 설정값들을 찾아서 올바른 타입과 범위로 변환하세요. 명시되지 않은 설정은 기본값을 사용하세요.

`,
  ],
  ['human', `{recipe}`],
]);

// Google Gemini 모델 초기화
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.0-flash',
  streaming: false,
  temperature: 0.3,
});

const chain = promptTemplate.pipe(llm.withStructuredOutput(RecipeAnalysisSchema));

const embeddings = new PineconeEmbeddings({
  apiKey: process.env.PINECONE_API_KEY, // Defaults to process.env.HUGGINGFACEHUB_API_KEY
  model: 'multilingual-e5-large',
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
            const analysis = await chain.invoke({
              recipe: JSON.stringify(recipe),
            });

            return new Document({
              pageContent: analysis.summary,
              metadata: {
                id: i + batchIndex,
                creator: recipe.creator,
                name: recipe.name,
                type: recipe.type,
                colorOrBw: recipe.colorOrBw,
                camera: recipe.camera,
                sensor: recipe.sensor,
                base: recipe.base,
                url: recipe.url,
                // 설정을 1 depth로 평탄화하여 저장 (Pinecone 중첩 JSON 구조 제한 대응)
                settings_filmSimulation: analysis.settings.filmSimulation,
                settings_iso: analysis.settings.iso,
                settings_exposure: analysis.settings.exposure,
                settings_dynamicRange: analysis.settings.dynamicRange,
                settings_priority: analysis.settings.priority,
                settings_grainEffect: analysis.settings.grainEffect,
                settings_grainSize: analysis.settings.grainSize,
                settings_colourChrome: analysis.settings.colourChrome,
                settings_colourChromeFXBlue: analysis.settings.colourChromeFXBlue,
                settings_whiteBalance: analysis.settings.whiteBalance,
                settings_shiftRed: analysis.settings.shiftRed,
                settings_shiftBlue: analysis.settings.shiftBlue,
                settings_highlight: analysis.settings.highlight,
                settings_shadow: analysis.settings.shadow,
                settings_color: analysis.settings.color,
                settings_clarity: analysis.settings.clarity,
                settings_sharpness: analysis.settings.sharpness,
                settings_noiseReduction: analysis.settings.noiseReduction,
                rawSettings: recipe.settings, // 원본 설정 문자열도 보존
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
// if (require.main === module) {
//   processRecipes().then((result) => {
//     console.log('처리 결과:', result);
//     process.exit(result.success ? 0 : 1);
//   });
// }

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

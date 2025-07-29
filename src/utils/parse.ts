import { FujifilmSettingsSchema } from '@/types/camera-schema';
import { readCSV } from '@/utils/csvReader';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PineconeEmbeddings, PineconeStore } from '@langchain/pinecone';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { z } from 'zod';

import path from 'path';
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
        'documentry',
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

### Film Simulations 특징
Film Simulations 특징

## 필름 시뮬레이션 모드

### 컬러 필름
- **Provia**: 표준, 만능, 자연스러운 색감, 일상, 풍경, 스냅
- **Astia**: 소프트, 화사한 피부톤, 부드러운 색감, 인물용, 인물, 부드러움, 화사함
- **Classic Chrome**: 다큐멘터리, 차분한 색감, 낮은 채도, 매거진룩, 매거진, 차분함, 빈티지, 다큐멘터리
- **Classic Negative**: 클래식필름, 스냅사진, 독특한 색감, 아날로그 감성, 아날로그, 스냅, 레트로, 필름룩
- **Reala Ace**: 충실한 색재현, 네거티브필름, 부드러운 계조, 사실적, 자연스러움, 부드러움
- **Eterna**: 영화적, 시네마틱, 낮은 채도, 영상용, 시네마틱, 영상, 차분함, 영화
- **Eterna Bleach Bypass**: 고대비 저채도, 하드한 느낌, 강렬함, 강렬함, 고대비, 드라마틱, 거친
- **Nostalgic Neg.**: 1970년대, 뉴컬러, 앰버톤, 따뜻한 감성, 향수, 따뜻함, 앰버, 빈티지
- **Pro Neg. High**: 인물용, 스튜디오, 강한 대비, 입체감, 인물, 스튜디오, 선명함, 강렬함
- **Pro Neg. Std**: 인물용, 부드러운 계조, 자연스러운 피부톤, 인물, 부드러움, 자연스러움
- **Velvia**: 고채도, 고대비, 생생한 색감, 풍경용, 풍경, 고채도, 생생함, 강렬함

### 흑백 필름
- **ACROS**: 고품질 흑백, 풍부한 계조, 뛰어난 디테일, 흑백, 디테일, 선명함, 모노크롬
- **Monochrome**: 표준 흑백, 깔끔함, 흑백, 깔끔함, 모노크롬
- **Sepia**: 세피아, 갈색톤, 복고풍, 세피아, 갈색, 복고, 빈티지

## 주요 설정 효과 및 범위

### 다이나믹 레인지
- **Dynamic Range**: [AUTO, DR100%, DR200%, DR400%] - 기본값: AUTO
  - 키워드: 계조, 다이나믹, 밝기, 하이라이트
  - **DR100%**: 표준, 일반
  - **DR200%**: 중간 밝기, 계조 확장
  - **DR400%**: 넓은 다이나믹, 밝은 영역 보존, 하이라이트 보존

### 노출 설정
- **ISO**: 이미지 감도 설정 문자열
  - 키워드: 감도, 노이즈, 밝기
  - 높을수록: 밝기 증가, 노이즈 증가, 어두운 환경
  - 낮을수록: 밝기 감소, 노이즈 감소, 선명함

- **Exposure**: 노출 보정 문자열 - 기본값: "0"
  - 키워드: 노출, 밝기, 빛
  - 높을수록: 밝기 증가, 과노출
  - 낮을수록: 밝기 감소, 저노출

- **Priority**: [AUTO, OFF, WEAK, STRONG] - 기본값: AUTO
  - 키워드: 우선, 자동, 설정

### 필름 효과
- **Grain Effect**: [OFF, WEAK, STRONG] - 기본값: OFF
  - 키워드: 필름룩, 아날로그 감성, 빈티지
  - **OFF**: 깔끔함, 매끄러움
  - **WEAK**: 은은한 그레인, 필름 느낌
  - **STRONG**: 강한 그레인, 아날로그, 빈티지, 거친

- **Grain Size**: [OFF, SMALL, LARGE] - 기본값: OFF
  - 키워드: 그레인, 질감, 크기
  - **OFF**: 그레인 없음
  - **SMALL**: 미세한 그레인
  - **LARGE**: 굵은 그레인, 강렬한 질감

### 색상 강조
- **Colour Chrome**: [OFF, WEAK, STRONG] - 기본값: OFF
  - 키워드: 색감 강조, 깊이 있는 색상
  - **OFF**: 일반 색상
  - **WEAK**: 은은한 색감 강조
  - **STRONG**: 색감 강조, 깊은 색상, 선명함

- **Colour Chrome FX Blue**: [OFF, WEAK, STRONG] - 기본값: OFF
  - 키워드: 파란색 계열 강조, 하늘과 바다의 선명도 향상
  - **OFF**: 일반 파란색
  - **WEAK**: 은은한 파란색 강조
  - **STRONG**: 파란색 강조, 하늘, 바다, 선명함

### 화이트 밸런스
- **White Balance**: 색온도 자동 조정 문자열
  - 키워드: 화이트밸런스, 색온도, 색감
  - **Auto**: 자동 조정, 표준
  - **Daylight**: 주광, 따뜻한 톤
  - **Shade**: 그늘, 차가운 톤
  - **Fluorescent**: 형광등, 특정 색감

- **Shift(Red)**: -9~+9 정수 - 기본값: 0
  - 높을수록: 붉은색 증가, 따뜻한 톤, 앰버톤
  - 낮을수록: 붉은색 감소, 차가운 톤

- **Shift(Blue)**: -9~+9 정수 - 기본값: 0
  - 높을수록: 푸른색 증가, 차가운 톤
  - 낮을수록: 푸른색 감소, 따뜻한 톤

### 톤 조정
- **Highlight**: -2~+4 정수 - 기본값: 0
  - 높을수록: 하이라이트 밝기 증가, 밝음, 대비 강렬
  - 낮을수록: 하이라이트 밝기 감소, 부드러운 계조, 디테일 보존

- **Shadow**: -2~+4 정수 - 기본값: 0
  - 높을수록: 섀도우 밝기 증가, 어두운 영역 밝음, 대비 약화
  - 낮을수록: 섀도우 밝기 감소, 어두운 영역 강조, 대비 강렬, 드라마틱

- **Color**: -4~+4 정수 - 기본값: 0
  - 높을수록: 채도 강조, 생생한 색상, 선명한 색감
  - 낮을수록: 채도 감소, 차분한 색상, 흑백에 가까움

### 선명도 조정
- **Clarity**: -4~+4 정수 - 기본값: 0
  - 높을수록: 선명도 증가, 질감 강조, 또렷함
  - 낮을수록: 부드러운 이미지, 몽환적 느낌, 피부 보정

- **Sharpness**: -2~+4 정수 - 기본값: 0
  - 높을수록: 선명함 증가, 디테일 강조, 또렷함
  - 낮을수록: 선명함 감소, 부드러움, 소프트

- **Noise Reduction**: -4~+4 정수 - 기본값: 0
  - 높을수록: 노이즈 감소, 깨끗함, 매끄러운 이미지
  - 낮을수록: 노이즈 증가, 거친 질감, 필름룩

`,
  ],
  ['human', `{recipe}`],
]);

// Google Gemini 모델 초기화
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.0-flash-lite',
  streaming: false,
  temperature: 0.3,
});

const chain = promptTemplate.pipe(
  llm.withStructuredOutput(RecipeAnalysisSchema)
);

const embeddings = new PineconeEmbeddings({
  apiKey: process.env.PINECONE_API_KEY,
  model: 'llama-text-embed-v2',
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
            const analysis = await chain.invoke(
              {
                recipe: JSON.stringify(recipe),
              },
              { callbacks: [langfuseHandler] }
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

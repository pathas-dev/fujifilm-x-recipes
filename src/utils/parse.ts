import { readCSV } from '@/utils/csvReader';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PineconeEmbeddings, PineconeStore } from '@langchain/pinecone';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { ParseChainOutputSchema } from '@/types/camera-schema';

import path from 'path';

export const dynamic = 'force-dynamic'; // defaults to auto

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    'system',
    `# 후지필름 X 시리즈 레시피 분석 전문가

## 역할
주어진 후지필름 카메라 레시피 설정을 분석하여 구조화된 데이터를 출력합니다.

## 요구사항
1. **Summary**: 2-3문장으로 필름 시뮬레이션과 설정값을 최대한 참고하여 레시피의 특징과 느낌을 설명
2. **Camera Settings**: 제공된 설정을 정확히 파싱하여 구조화된 형태로 변환
3. **Color Mode**: 레시피가 컬러인지 흑백인지 판별 ('color' 또는 'bw')

## Summary 작성 가이드

### Film Simulations 특징
- **PROVIA**: 표준, 만능, 자연스러운 색감
- **Velvia**: 고채도, 고대비, 생생한 색감, 풍경용  
- **ASTIA**: 소프트, 화사한 피부톤, 부드러운 색감, 인물용
- **Classic Chrome**: 다큐멘터리, 차분한 색감, 낮은 채도, 매거진룩
- **PRO Neg. Hi**: 인물용, 스튜디오, 강한 대비, 입체감
- **PRO Neg. Std**: 인물용, 부드러운 계조, 자연스러운 피부톤
- **Classic Negative**: 클래식필름, 스냅사진, 독특한 색감, 아날로그 감성
- **ETERNA**: 영화적, 시네마틱, 낮은 채도, 영상용
- **ETERNA Bleach Bypass**: 고대비 저채도, 하드한 느낌, 강렬함
- **REALA ACE**: 충실한 색재현, 네거티브필름, 부드러운 계조
- **NOSTALGIC Neg.**: 1970년대, 뉴컬러, 앰버톤, 따뜻한 감성
- **ACROS**: 고품질 흑백, 풍부한 계조, 뛰어난 디테일
- **Monochrome**: 표준 흑백, 깔끔함

### 주요 설정 효과
- **Dynamic Range 높음**: 넓은 계조, 디테일 보존
- **Grain 효과**: 필름룩, 아날로그 감성, 빈티지
- **Colour Chrome**: 색감 강조, 깊이 있는 색상  
- **Shift**: R 높음/B 낮음 = 따뜻한 톤
- **Highlight/Shadow 낮음**: 부드러운 계조, 디테일 보존
- **Color 높음**: 채도 강조, 생생한 색상
- **Clarity 낮음**: 부드러운 이미지, 몽환적 느낌
- **Noise Reduction 높음**: 깨끗하고 매끄러운 이미지

[카메라 및 설정 정보]
{context}`,
  ],
  [
    'human',
    '위 정보를 바탕으로 이 레시피를 구조화된 형태로 분석해주세요.',
  ],
]);

// Google Gemini 모델 초기화
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.0-flash-lite',
  temperature: 0.3,
});

const chain = promptTemplate.pipe(llm.withStructuredOutput(ParseChainOutputSchema));

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

try {
  const fileRecipes = readCSV(path.resolve('public', 'film-recipes.csv'));

  const BATCH_SIZE = 20;

  const start = Date.now();

  for (let i = 0; i < fileRecipes.length; i += BATCH_SIZE) {
    const batch = fileRecipes.slice(i, i + BATCH_SIZE);
    const batchDocuments = await Promise.all(
      batch.map(async (recipe, batchIndex: number) => {
        const parsedOutput = await chain.invoke({
          context: JSON.stringify(recipe),
        });

        return new Document({
          pageContent: parsedOutput.summary,
          metadata: {
            id: i + batchIndex,
            creator: recipe.creator,
            name: recipe.name,
            type: recipe.type,
            url: recipe.url,
            // Use LLM structured output as metadata
            camera: parsedOutput.camera,
            sensor: parsedOutput.sensor,
            filmSimulation: parsedOutput.filmSimulation,
            colorOrBw: parsedOutput.colorOrBw,
            settings: parsedOutput.settings,
          },
        });
      })
    );
    await saveToPinecone(batchDocuments);

    console.log(`${i + 20}개 인덱싱 생성 완료`);
    console.log(`소요 시간: ${(Date.now() - start) / 1000}초`);
  }
} catch (error) {
  console.error('Chatbot API Error:', error);
}

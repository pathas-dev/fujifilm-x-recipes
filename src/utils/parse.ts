import { readCSV } from '@/utils/csvReader';
import { Document } from '@langchain/core/documents';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

import { Ollama } from '@langchain/ollama';
import { PineconeEmbeddings, PineconeStore } from '@langchain/pinecone';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';

import path from 'path';

export const dynamic = 'force-dynamic'; // defaults to auto

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    'system',
    `# 후지필름 X 시리즈 레시피 분석 전문가

## 역할
주어진 후지필름 카메라 레시피 설정을 분석하여 예상되는 이미지 느낌과 감상을 한 문장으로 표현합니다.

## 출력 형식
"이 {name} 레시피는 {camera} 카메라, {base} 필름 레시피, {sensor} 센서를 기반으로 한 [구체적인 느낌 설명]을 줍니다."

[카메라 및 설정 정보]
{context}

## 참고 자료

### 후지필름 시뮬레이션별 특징
- **PROVIA/Standard**: 표준, 만능, 자연스러운 색감
- **Velvia/Vivid**: 고채도, 고대비, 생생한 색감, 풍경용  
- **ASTIA/Soft**: 소프트, 화사한 피부톤, 부드러운 색감, 인물용
- **Classic Chrome**: 다큐멘터리, 차분한 색감, 낮은 채도, 매거진룩
- **PRO Neg. Hi**: 인물용, 스튜디오, 강한 대비, 입체감
- **PRO Neg. Std**: 인물용, 부드러운 계조, 자연스러운 피부톤
- **Classic Negative**: 클래식필름, 스냅사진, 독특한 색감, 아날로그 감성
- **ETERNA/Cinema**: 영화적, 시네마틱, 낮은 채도, 영상용
- **ETERNA Bleach Bypass**: 고대비 저채도, 하드한 느낌, 강렬함
- **REALA ACE**: 충실한 색재현, 네거티브필름, 부드러운 계조
- **NOSTALGIC Neg.**: 1970년대, 뉴컬러, 앰버톤, 따뜻한 감성
- **ACROS**: 고품질 흑백, 풍부한 계조, 뛰어난 디테일
- **Monochrome**: 표준 흑백, 깔끔함
- **Sepia**: 세피아, 갈색톤, 복고풍

### 주요 설정 효과
- **Dynamic Range 높음**: 넓은 계조, 디테일 보존
- **Grain 효과**: 필름룩, 아날로그 감성, 빈티지
- **Colour Chrome**: 색감 강조, 깊이 있는 색상
- **Shift**: R 높음/B 낮음 = 따뜻한 톤
- **Highlight/Shadow 낮음**: 부드러운 계조, 디테일 보존
- **Color 높음**: 채도 강조, 생생한 색상
- **Clarity 낮음**: 부드러운 이미지, 몽환적 느낌
- **Noise Reduction 높음**: 깨끗하고 매끄러운 이미지`,
  ],
  [
    'human',
    '위 정보를 바탕으로 이 레시피의 예상 느낌을 한 문장으로 요약해주세요.',
  ],
]);

// Ollama 모델 초기화
const llm = new Ollama({
  model: 'gemma3', // 사용할 모델명
});

const chain = promptTemplate.pipe(llm).pipe(new StringOutputParser());

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
        const summary = await chain.invoke({
          context: JSON.stringify(recipe),
          base: recipe.base,
          camera: recipe.camera,
          name: recipe.name,
          sensor: recipe.sensor,
        });

        return new Document({
          pageContent: summary,
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
            settings: recipe.settings,
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

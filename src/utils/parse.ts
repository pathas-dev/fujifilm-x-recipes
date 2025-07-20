import { readCSV } from "@/utils/csvReader";
import { Document } from "@langchain/core/documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { Ollama } from "@langchain/ollama";
import { PineconeEmbeddings, PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

import path from "path";

export const dynamic = "force-dynamic"; // defaults to auto

const promptTemplate = ChatPromptTemplate.fromTemplate(
  `
  당신은 후지필름 X 시리즈 카메라의 필름 레시피 전문가입니다.
  주어진 카메라 정보 및 설정을 통해 예상되는 느낌이나 감상을 한 문장으로 표현하세요.
  주어진 정보를 바탕으로 사용자의 질문에 대해 도움이 되는 답변을 한국어로 제공해주세요.

  답변은 마지막 요약 한 줄만 작성하세요.
  "~ 이 {name} 레시피는 {camera} 카메라, {base} 필름 레시피, {sensor} 센서를 기반으로 한 ~ 느낌을 줍니다." 형식으로 답변하세요. 

  [카메라 및 설정 정보]
  {context}

  [[평가 참고 자료]]

  [후지필름 시뮬레이션별 특징]

  PROVIA (프로비아) / Standard
  #표준 #만능 #자연스러운_색감 #있는_그대로

  Velvia (벨비아) / Vivid
  #고채도 #고대비 #생생한_색감 #풍경용

  ASTIA (아스티아) / Soft
  #소프트 #화사한_피부톤 #부드러운_색감 #인물용

  Classic Chrome (클래식 크롬)
  #다큐멘터리 #차분한_색감 #낮은_채도 #매거진룩

  PRO Neg. Hi (프로 네거티브 하이)
  #인물용 #스튜디오 #강한_대비 #입체감

  PRO Neg. Std (프로 네거티브 스탠다드)
  #인물용 #부드러운_계조 #자연스러운_피부톤 #후보정_용이

  Classic Negative (클래식 네거티브)
  #클래식필름 #스냅사진 #독특한_색감 #아날로그_감성

  ETERNA (이터나) / Cinema
  #영화적 #시네마틱 #낮은_채도 #영상용

  ETERNA Bleach Bypass (이터나 블리치 바이패스)
  #고대비_저채도 #하드한_느낌 #강렬함 #독특한_질감

  REALA ACE (리얼라 에이스)
  #충실한_색재현 #네거티브필름 #부드러운_계조 #균형감

  NOSTALGIC Neg. (노스탤직 네거티브)
  #1970년대 #뉴컬러 #앰버톤 #따뜻한_감성

  ACROS (아크로스)
  #고품질_흑백 #풍부한_계조 #뛰어난_디테일 #미세한_입자감

  Monochrome (모노크롬)
  #표준_흑백 #깔끔함 #기본

  Sepia (세피아)
  #세피아 #갈색톤 #복고풍 #오래된_사진

  [카메라 설정별 특징]
  Dynamic Range(DR): 값이 높으면 이미지의 밝고 어두운 부분 디테일이 잘 살아나 계조가 풍부해집니다. #넓은계조 #디테일보존
  Priority(우선순위): 'Off'로 설정되면 특정 이미지 처리 기능보다 센서의 원본 데이터가 더 직접적으로 이미지에 반영됩니다. #기본설정유지 #원본데이터활용
  Grain(그레인 효과): 강도가 약하고 입자 크기가 클 때 미묘하면서도 거친 필름 같은 아날로그 질감을 더합니다. #필름룩 #아날로그감성 #빈티지
  Colour Chrome(컬러 크롬 효과): 강도가 약할 때 색상의 깊이와 풍부함이 과장되지 않고 자연스럽게 더해집니다. #색감강조 #깊이있는색상
  Colour Chrome Blue(컬러 크롬 블루 효과): 강도가 강할 때 파란색 계열의 색상이 매우 깊고 풍부하게 표현되어 특정 색상을 강조합니다. #파란색강조 #드라마틱한색감
  Colour Chrome Red(컬러 크롬 레드): 붉은색 계열의 색상을 더욱 풍부하고 깊이 있게 표현해 주는 특성이 있습니다. #붉은색강조 #색감깊이 #디테일보존
  White Balance(화이트 밸런스): 'Auto WB'는 카메라가 촬영 환경의 광원을 분석하여 자동으로 색 온도를 조정, 자연스러운 색상을 얻게 해줍니다. #자동색온도 #자연스러운색상
  Shift(시프트): R(레드) 값이 높고 B(블루) 값이 낮을 때 이미지 전체에 따뜻한(붉은/노란) 톤이 강조됩니다. #따뜻한톤 #색온도조절 #미세조정
  Highlight(밝기강조): 값이 낮으면 (음수) 밝은 영역의 대비가 약해져 디테일이 보존되고 계조가 부드러워집니다. #하이라이트보존 #부드러운계조
  Shadow(그림자강조): 값이 낮으면 (음수) 어두운 영역의 대비가 약해져 디테일이 살아나고 정보 손실이 줄어듭니다. #섀도우디테일 #어두운부분보존
  Color(채도): 값이 높으면 이미지 전체의 채도가 강하게 증가하여 색상이 더욱 선명하고 생생하게 표현됩니다. #채도강조 #생생한색상 #선명함
  Clarity(선명도): 값이 낮으면 (음수) 이미지의 중간 톤 대비가 감소하여 선명도가 낮아지고 부드럽거나 몽환적인 느낌을 연출합니다. #부드러운이미지 #몽환적 #피부톤보정
  Noise Reduction (노이즈 감소): 값이 높을수록(양수) 이미지의 자글거리는 디지털 노이즈를 효과적으로 제거하여 깨끗하고 매끄러운 이미지를 만들어줍니다. #노이즈제거 #깨끗한이미지 #매끄러운질감 #저조도개선

  [요약]
`
);

// Ollama 모델 초기화
const llm = new Ollama({
  model: "gemma3", // 사용할 모델명
});

const chain = promptTemplate.pipe(llm).pipe(new StringOutputParser());

const embeddings = new PineconeEmbeddings({
  apiKey: process.env.PINECONE_API_KEY, // Defaults to process.env.HUGGINGFACEHUB_API_KEY
  model: "multilingual-e5-large",
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
  const fileRecipes = readCSV(path.resolve("public", "film-recipes.csv"));

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
  console.error("Chatbot API Error:", error);
}

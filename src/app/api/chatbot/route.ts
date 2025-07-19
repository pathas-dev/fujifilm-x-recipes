import { readCSV } from "@/utils/csvReader";
import { NextResponse } from "next/server";
import path from "path";
import { Ollama } from "@langchain/ollama";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";
import { PineconeEmbeddings, PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { BM25Retriever } from "@langchain/community/retrievers/bm25";
import { EnsembleRetriever } from "langchain/retrievers/ensemble";

export const dynamic = "force-dynamic"; // defaults to auto

const retrieve = async (query: string) => {
  const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

  const embeddings = new PineconeEmbeddings({
    apiKey: process.env.PINECONE_API_KEY,
    model: "multilingual-e5-large",
  });

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 50,
  });

  const pineconeRetriever = vectorStore.asRetriever({
    k: 5,
    searchType: "mmr",
    searchKwargs: { fetchK: 10 },
  });

  const documents = await vectorStore
    .asRetriever({
      k: 3,
      searchType: "mmr",
      searchKwargs: { fetchK: 10 },
    })
    .invoke(query);

  const bm25Retriever = BM25Retriever.fromDocuments(documents, {
    k: 3,
  });

  return new EnsembleRetriever({
    retrievers: [pineconeRetriever, bm25Retriever],
    weights: [0.7, 0.3],
  }).invoke(query);
};

export async function GET() {
  try {
    const query = "겨울 느낌의 필름 레시피 추천해주세요";
    const results = await retrieve(query);

    const context = results.reduce((acc, current, index) => {
      const text = `
        [본문 ${index + 1}] 
        ${current.pageContent},

        [세팅 ${index + 1}]
        ${current.metadata["settings"]},
        
        [URL ${index + 1}]
        ${current.metadata["url"]},
      `
        .split("\n\n")
        .map((line) => line.trim())
        .join("\n");

      return acc + "\n\n" + text;
    }, "");

    const llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-2.0-flash",
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `당신은 후지 필름 레시피, 사진 보정 전문가입니다.
        다음의 컨텍스트를 참고해서 질문에 맞는 필름 레시피를 추천해주세요.

        추천 이유를 간략히 설명하세요.
        추천하는 레시피의 세팅과 URL 정보를 추가하세요.

        [context]
        {context}
      `,
      ],
      ["human", query],
    ]);

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const result = await chain.invoke({ context });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Chatbot API Error:", error);
    return NextResponse.json(
      { error: "Failed to process film recipes data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    return NextResponse.json("a");
  } catch (error) {
    console.error("Chatbot POST Error:", error);
    return NextResponse.json(
      { error: "Failed to process chatbot request" },
      { status: 500 }
    );
  }
}

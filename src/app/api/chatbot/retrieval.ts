import { PineconeEmbeddings, PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { BM25Retriever } from "@langchain/community/retrievers/bm25";
import { EnsembleRetriever } from "langchain/retrievers/ensemble";
import { ColorType, SensorType } from "@/app/api/chatbot/shema";

export const createPineconeClient = () => {
  return new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

export const createEmbeddings = () => {
  return new PineconeEmbeddings({
    apiKey: process.env.PINECONE_API_KEY,
    model: "multilingual-e5-large",
  });
};

export const createVectorStore = async (
  embeddings: PineconeEmbeddings,
  pineconeIndex: any
) => {
  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 50,
  });
};

export const retrieve = async (
  query: string,
  metadata: { sensor?: SensorType; colorType?: ColorType }
) => {
  const pinecone = createPineconeClient();
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
  const embeddings = createEmbeddings();
  const vectorStore = await createVectorStore(embeddings, pineconeIndex);

  const pineconeRetriever = vectorStore.asRetriever({
    k: 3,
    searchType: "mmr",
    searchKwargs: { fetchK: 10 },
    metadata,
  });

  const documents = await pineconeRetriever.invoke(query);

  const bm25Retriever = BM25Retriever.fromDocuments(documents, {
    k: 3,
  });

  return new EnsembleRetriever({
    retrievers: [pineconeRetriever, bm25Retriever],
    weights: [0.6, 0.4],
  }).invoke(query);
};

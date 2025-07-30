import {
  ColorOrBw,
  FilmSimulationType,
  SensorType,
} from '@/types/camera-schema';
import { BM25Retriever } from '@langchain/community/retrievers/bm25';
import { PineconeEmbeddings, PineconeStore } from '@langchain/pinecone';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { Document } from 'langchain/document';
import { EnsembleRetriever } from 'langchain/retrievers/ensemble';
import { PineconeRecipesForKeywordSearch } from '../../../types/pinecone-recipes';

export const createPineconeClient = () => {
  return new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

export const PINECONE_EMBEDDING_MODEL = 'llama-text-embed-v2';

export const createEmbeddings = () => {
  return new PineconeEmbeddings({
    apiKey: process.env.PINECONE_API_KEY,
    model: PINECONE_EMBEDDING_MODEL,
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
  metadata: {
    sensors: SensorType[];
    colorOrBw: ColorOrBw;
    filmSimultations?: FilmSimulationType[];
  }
) => {
  const pinecone = createPineconeClient();
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
  const embeddings = createEmbeddings();
  const vectorStore = await createVectorStore(embeddings, pineconeIndex);

  const pineconeRetriever = vectorStore.asRetriever({
    k: 5,
    // searchType: 'mmr',
    // searchKwargs: { fetchK: 15, lambda: 0.4 },
    filter: {
      sensor: { $in: metadata.sensors },
      colorOrBw: metadata.colorOrBw,
      // settings_filmSimulation: { $in: metadata.filmSimultations },
    },
  });

  const recipeDocuments = PineconeRecipesForKeywordSearch.map((recipe) => {
    return new Document({
      pageContent: recipe.pageContent,
      id: recipe.id,
      metadata: { url: recipe.metadata.url },
    });
  });

  const bm25Retriever = BM25Retriever.fromDocuments(recipeDocuments, {
    k: 5,
  });

  return new EnsembleRetriever({
    retrievers: [pineconeRetriever, bm25Retriever],
    weights: [0.5, 0.5],
  }).invoke(query);
};

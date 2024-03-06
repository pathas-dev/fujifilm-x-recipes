import { MongoClient, ServerApiVersion } from 'mongodb';

const url = process.env.FUJIFILM_X_RECIPES_DATABASE_URL ?? '';

const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const getAllDocuments = async (collectionName: string) => {
  try {
    await client.connect();
    const data = await client
      .db('fujifilm-x')
      .collection(collectionName)
      .find()
      .toArray();
    return data;
  } catch (error) {
    throw error;
  } finally {
    await client.close();
  }
};

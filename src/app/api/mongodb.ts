import { MongoClient, ServerApiVersion } from 'mongodb';

const url = process.env.FUJIFILM_X_RECIPES_DATABASE_URL ?? '';

export const getAllDocuments = async (collectionName: string) => {
  let client = null;
  try {
    client = new MongoClient(url, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
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
    if (client) await client.close();
  }
};

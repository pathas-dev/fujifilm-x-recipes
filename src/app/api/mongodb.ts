const url = process.env.API_SERVER_URL ?? '';
const dataSource = process.env.DATA_SOURCE ?? '';
const database = process.env.DATABASE ?? '';
const apiKey = process.env.API_KEY ?? '';

export const getAllDocuments = async <T>(
  collectionName: string
): Promise<T[]> => {
  try {
    const response = await fetch(url + '/action/find', {
      method: 'POST',
      body: JSON.stringify({
        dataSource,
        database,
        collection: collectionName,
      }),
      headers: { apiKey },
    });

    const data = await response.json();
    return data.documents;
  } catch (error) {
    throw error;
  }
};

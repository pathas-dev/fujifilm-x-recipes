import { Recipe } from '@/types/api';

const apiServerUrl = 'http://localhost:3000';

const getRecipes = async (): Promise<Recipe[]> => {
  const res = await fetch(`${apiServerUrl}/api/recipes`);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Recipes data request failed');
  }

  return res.json();
};

export default async function Home() {
  const data = await getRecipes();
  return <main>home</main>;
}

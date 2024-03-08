import Card from '@/components/card/Card';
import { Recipe } from '@/types/api';

const apiServerUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';

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
  const recipes = await getRecipes();

  return (
    <main className="w-full h-fit p-2 flex flex-col gap-2">
      {recipes.slice(0, 10).map((recipe) => (
        <Card recipe={recipe} key={recipe._id} />
      ))}
    </main>
  );
}

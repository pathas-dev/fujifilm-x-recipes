import Card from '@/components/card/Card';
import { Recipe } from '@/types/api';
import { getAllDocuments } from './api/mongodb';

const getRecipes = async (): Promise<Recipe[]> => {
  try {
    const data = await getAllDocuments('recipes');
    return JSON.parse(JSON.stringify(data)) as Recipe[];
  } catch (error) {
    throw new Error('Recipes data request failed');
  }
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

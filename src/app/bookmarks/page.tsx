import BookmarkList from '@/components/bookmark/BookmarkList';
import { Recipe } from '@/types/api';
import { getAllDocuments } from '../api/mongodb';

const getRecipesWithFilters = async (): Promise<{
  recipes: Recipe[];
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
}> => {
  try {
    const data = await getAllDocuments('recipes');
    const recipes = JSON.parse(JSON.stringify(data)) as Recipe[];
    const filters = recipes.reduce<{
      cameras: string[];
      bases: string[];
      sensors: string[];
    }>(
      (acc, cur) => {
        if (cur.camera && acc.cameras.indexOf(cur.camera) < 0)
          acc.cameras.push(cur.camera);
        if (cur.base && acc.bases.indexOf(cur.base) < 0)
          acc.bases.push(cur.base);
        if (cur.sensor && acc.sensors.indexOf(cur.sensor) < 0)
          acc.sensors.push(cur.sensor);

        return acc;
      },
      {
        cameras: [],
        bases: [],
        sensors: [],
      }
    );

    Object.values(filters).forEach((filter) => filter.sort());

    return {
      recipes,
      filters,
    };
  } catch (error) {
    console.log(error);
    throw new Error('Recipes data request failed');
  }
};

export default async function Bookmarks() {
  const { recipes, filters } = await getRecipesWithFilters();

  return <BookmarkList recipes={recipes} filters={filters} />;
}

import { Origin, Recipe } from '@/types/api';
import recipesData from './recipes.json';
import filtersData from './filters.json';
import originsData from './origins.json';

export const getRecipesWithFilters = async (): Promise<{
  recipes: Recipe[];
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
}> => {
  return {
    recipes: recipesData.recipes as Recipe[],
    filters: filtersData.filters,
  };
};

export const getOrigins = async (): Promise<{
  origins: Origin[];
}> => {
  return {
    origins: originsData.origins as Origin[],
  };
};

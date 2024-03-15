import { Camera, Origin, Recipe } from '@/types/api';
import camerasData from './cameras.json';
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

export const getCamerasWithFilters = async (): Promise<{
  cameras: Camera[];
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
}> => {
  return {
    cameras: camerasData.cameras as Camera[],
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

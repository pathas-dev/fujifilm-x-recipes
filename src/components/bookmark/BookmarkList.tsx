'use client';

import { Recipe } from '@/types/api';
import { useEffect, useState } from 'react';
import { STORAGE_BOOKMARK_KEY } from '@/components/recipe/RecipeCard';
import RecipeCardList from '@/components/recipe/RecipeCardList';

interface IBookmarkListProps {
  recipes: Recipe[];
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
}

const BookmarkList = ({ filters, recipes }: IBookmarkListProps) => {
  const [markedRecipes, setMarkedRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const storedRecipeIds = JSON.parse(
      localStorage.getItem(STORAGE_BOOKMARK_KEY) ?? '[]'
    ) as string[];
    const matchedRecipes = recipes.filter((recipe) =>
      storedRecipeIds.includes(recipe._id)
    );

    setMarkedRecipes(matchedRecipes);
  }, [recipes]);

  return (
    <RecipeCardList recipes={markedRecipes} filters={filters} />
  );
};

export default BookmarkList;

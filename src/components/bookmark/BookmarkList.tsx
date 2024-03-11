'use client';

import { Recipe } from '@/types/api';
import { useEffect, useState } from 'react';
import { STORAGE_BOOKMARK_KEY } from '../card/Card';
import CardList from '../card/CardList';

interface IBookmarkListProps {
  recipes: Recipe[];
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
  labels: {
    bwOnly: string;
    dateLabel: string;
    nameLabel: string;
    baseLabel: string;
    cameraLabel: string;
    creatorLabel: string;
  };
}

const BookmarkList = ({ filters, recipes, labels }: IBookmarkListProps) => {
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

  return <CardList recipes={markedRecipes} filters={filters} labels={labels} />;
};

export default BookmarkList;

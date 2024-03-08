import React from 'react';
import CardInner from './CardInner';
import { Recipe } from '@/types/api';

interface ICardProps {
  recipe: Recipe;
}
const Card = async ({ recipe }: ICardProps) => {
  const response = await fetch(recipe.url);
  const urlHtml = await response.text();

  return <CardInner urlHtml={urlHtml} recipe={recipe} />;
};

export default Card;

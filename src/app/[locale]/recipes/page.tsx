import RecipeCardList from '@/components/recipe/RecipeCardList';
import { setRequestLocale } from 'next-intl/server';

import { getRecipesWithFilters } from '@/app/api/data/localData';
import { localeIntl } from '@/i18n/navigation';

export default async function Home(
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) {
  const params = await props.params;

  const { locale } = params;
  setRequestLocale(locale);
  const { recipes, filters } = await getRecipesWithFilters();

  return <RecipeCardList recipes={recipes} filters={filters} />;
}

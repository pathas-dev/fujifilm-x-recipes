import RecipeCardList from '@/components/recipe/RecipeCardList';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { localeIntl } from '@/navigation';
import { getRecipesWithFilters } from '@/app/api/data/localData';

export default async function Home({
  params: { locale },
}: Readonly<{
  params: { locale: (typeof localeIntl)[keyof typeof localeIntl] };
}>) {
  unstable_setRequestLocale(locale);
  const { recipes, filters } = await getRecipesWithFilters();

  const t = await getTranslations('Headers');

  const labels = {
    bwOnly: t('bwOnly'),
    dateLabel: t('dateLabel'),
    nameLabel: t('nameLabel'),
    baseLabel: t('baseLabel'),
    cameraLabel: t('cameraLabel'),
    creatorLabel: t('creatorLabel'),
  };

  return <RecipeCardList recipes={recipes} filters={filters} labels={labels} />;
}

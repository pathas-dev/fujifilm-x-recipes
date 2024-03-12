import CardList from '@/components/card/CardList';
import { localeIntl } from '@/i18n';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { getRecipesWithFilters } from '../api/data/localData';

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

  return <CardList recipes={recipes} filters={filters} labels={labels} />;
}

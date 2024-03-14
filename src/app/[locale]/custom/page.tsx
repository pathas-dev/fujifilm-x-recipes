import { getRecipesWithFilters } from '@/app/api/data/localData';
import BookmarkList from '@/components/bookmark/BookmarkList';
import CustomList from '@/components/custom/CustomList';
import { localeIntl } from '@/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

export default async function CustomPage({
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

  return <CustomList filters={filters} labels={labels} />;
}

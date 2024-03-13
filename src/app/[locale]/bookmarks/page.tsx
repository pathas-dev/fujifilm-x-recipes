import { getRecipesWithFilters } from '@/app/api/data/localData';
import BookmarkList from '@/components/bookmark/BookmarkList';
import { localeIntl } from '@/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

export default async function Bookmarks({
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

  return <BookmarkList recipes={recipes} filters={filters} labels={labels} />;
}

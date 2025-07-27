import { getRecipesWithFilters } from '@/app/api/data/localData';
import BookmarkList from '@/components/bookmark/BookmarkList';
import { localeIntl } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';

export default async function Bookmarks(
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) {
  const params = await props.params;

  const { locale } = params;
  setRequestLocale(locale);

  const { recipes, filters } = await getRecipesWithFilters();

  return <BookmarkList recipes={recipes} filters={filters} />;
}

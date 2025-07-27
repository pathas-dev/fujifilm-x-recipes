import { getRecipesWithFilters } from "@/app/api/data/localData";
import BookmarkList from "@/components/bookmark/BookmarkList";
import { localeIntl } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export default async function Bookmarks(
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) {
  const params = await props.params;

  const { locale } = params;
  setRequestLocale(locale);

  const { recipes, filters } = await getRecipesWithFilters();

  return (
    <NextIntlClientProvider>
      <BookmarkList recipes={recipes} filters={filters} />
    </NextIntlClientProvider>
  );
}

import RecipeCardList from "@/components/recipe/RecipeCardList";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { localeIntl } from "@/i18n/navigation";
import { getRecipesWithFilters } from "@/app/api/data/localData";

export default async function Home(
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) {
  const params = await props.params;

  const { locale } = params;
  setRequestLocale(locale);
  const { recipes, filters } = await getRecipesWithFilters();

  const t = await getTranslations("Headers");

  const labels = {
    bwOnly: t("bwOnly"),
    dateLabel: t("dateLabel"),
    nameLabel: t("nameLabel"),
    baseLabel: t("baseLabel"),
    cameraLabel: t("cameraLabel"),
    creatorLabel: t("creatorLabel"),
  };

  return <RecipeCardList recipes={recipes} filters={filters} labels={labels} />;
}

import { getAllDocuments } from '@/app/api/mongodb';
import CardList from '@/components/card/CardList';
import { localeIntl } from '@/i18n';
import { Recipe } from '@/types/api';
import dayjs from 'dayjs';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

const getRecipesWithFilters = async (): Promise<{
  recipes: Recipe[];
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
}> => {
  try {
    const data = await getAllDocuments('recipes');
    const recipes = JSON.parse(JSON.stringify(data)) as Recipe[];

    const filters = recipes.reduce<{
      cameras: string[];
      bases: string[];
      sensors: string[];
    }>(
      (acc, cur) => {
        if (cur.camera && acc.cameras.indexOf(cur.camera) < 0)
          acc.cameras.push(cur.camera);
        if (cur.base && acc.bases.indexOf(cur.base) < 0)
          acc.bases.push(cur.base);
        if (cur.sensor && acc.sensors.indexOf(cur.sensor) < 0)
          acc.sensors.push(cur.sensor);

        return acc;
      },
      {
        cameras: [],
        bases: [],
        sensors: [],
      }
    );

    recipes.sort((a, b) => dayjs(b.published).diff(a.published));
    Object.values(filters).forEach((filter) => filter.sort());

    return {
      recipes,
      filters,
    };
  } catch (error) {
    console.log(error);
    throw new Error('Recipes data request failed');
  }
};

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

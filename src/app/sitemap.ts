import { locales } from '@/i18n/navigation';
import { MetadataRoute } from 'next';

export const SITE_URL = 'https://fujifilm-x-recipes.vercel.app';

const pages = [
  '',
  '/recipes',
  '/origins',
  '/bookmarks',
  '/cameras',
  '/settings',
  '/guide',
  '/note',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
    },
    ...locales.reduce<MetadataRoute.Sitemap>((acc, locale) => {
      return acc.concat(
        pages.map((page) => ({
          url: `${SITE_URL}/${locale}${page}`,
          lastModified: new Date(),
        }))
      );
    }, []),
  ];
}

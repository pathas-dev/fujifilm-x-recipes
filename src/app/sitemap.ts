import { locales } from '@/navigation';
import { MetadataRoute } from 'next';

const siteUrl = process.env.SITE_URL;

const pages = [
  '',
  '/recipes',
  '/origins',
  '/bookmarks',
  '/cameras',
  '/settings',
  '/guide',
  '/note'
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
    },
    ...locales.reduce<MetadataRoute.Sitemap>((acc, locale) => {
      return acc.concat(
        pages.map((page) => ({
          url: `${siteUrl}/${locale}${page}`,
          lastModified: new Date(),
        }))
      );
    }, []),
  ];
}

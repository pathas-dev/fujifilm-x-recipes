import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const localeIntl = {
  ko: 'ko',
  en: 'en',
} as const;

// Can be imported from a shared config
const locales: Array<(typeof localeIntl)[keyof typeof localeIntl]> = [
  localeIntl.en,
  localeIntl.ko,
];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

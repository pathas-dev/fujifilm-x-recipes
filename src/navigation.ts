import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const localeIntl = {
  ko: 'ko',
  en: 'en',
} as const;

// Can be imported from a shared config
export const locales: Array<(typeof localeIntl)[keyof typeof localeIntl]> = [
  localeIntl.en,
  localeIntl.ko,
];

export const localePrefix = 'always'; // Default

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales, localePrefix });

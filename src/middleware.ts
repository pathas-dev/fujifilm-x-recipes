import createMiddleware from 'next-intl/middleware';
import { localeIntl, localePrefix, locales } from './navigation';

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  localePrefix,

  // Used when no locale matches
  defaultLocale: localeIntl.en,
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ko|en)/:path*'],
};

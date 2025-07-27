import type { locales } from '@/i18n/navigation';

type Messages = typeof import('../../messages/en.json');

declare global {
  interface IntlMessages extends Messages {}
}

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: Messages;
  }
}

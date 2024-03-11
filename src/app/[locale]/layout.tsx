import Navigation from '@/components/common/Navigation';
import ThemeSwitch from '@/components/common/ThemeSwitch';
import { localeIntl } from '@/i18n';
import type { Metadata } from 'next';
import {
  NextIntlClientProvider,
  useMessages,
  useTranslations,
} from 'next-intl';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'fujifilm-x-recipes',
  description: 'Fujifilm X-system recipes posted by Henri-Pierre Chavaz',
};

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: (typeof localeIntl)[keyof typeof localeIntl] };
}>) {
  const { locale } = params;

  const t = useTranslations('Navigation');

  const navigationTitles = {
    bookmarks: t('bookmarks'),
    recipes: t('recipes'),
    origins: t('origins'),
  };

  return (
    <html lang={locale} data-theme="dracula">
      <body
        className={[
          notoSans.className,
          'drawer-content',
          'flex',
          'h-max min-h-[calc(100vh-4rem)]',
          'w-full',
          'relative',
          'pb-16',
          'select-none',
        ].join(' ')}
        suppressHydrationWarning
      >
        {children}
        <Navigation titles={navigationTitles} />

        <ThemeSwitch />
      </body>
    </html>
  );
}

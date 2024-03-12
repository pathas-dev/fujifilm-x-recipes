import Navigation from '@/components/common/Navigation';
import ThemeSwitch from '@/components/common/ThemeSwitch';
import { localeIntl } from '@/i18n';
import { locales } from '@/navigation';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Noto_Sans_KR } from 'next/font/google';

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
});

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: (typeof localeIntl)[keyof typeof localeIntl] };
}) {
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const SITE_URL = 'https://www.fujifilm-x-recipes.site/';
  // 도메인 만료 시 아래 vercel 링크로 변경
  // const SITE_URL = 'https://fujifilm-x-recipes.vercel.app/';

  const metadata: Metadata = {
    title: 'fujifilm-x-recipes',
    description: 'Fujifilm X-system recipes posted by Henri-Pierre Chavaz',
    applicationName: 'X-recipes',
    manifest: `${SITE_URL}manifest.json`,
    openGraph: {
      title: 'fujifilm-x-recipes',
      description: t('description'),
      url: SITE_URL,
      siteName: 'fujifilm-x-recipes',
      images: [
        {
          url: `${SITE_URL}/og.png`, // Must be an absolute URL
          width: 800,
          height: 600,
        },
        {
          url: `${SITE_URL}/og-alt.png`, // Must be an absolute URL
          width: 1800,
          height: 900,
          alt: 'open graph alt image',
        },
      ],
      locale: locale,
      alternateLocale: 'en',
      type: 'website',
    },
  };
  return metadata;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: (typeof localeIntl)[keyof typeof localeIntl] };
}>) {
  const { locale } = params;
  unstable_setRequestLocale(locale);

  const t = useTranslations('Navigation');

  const navigationTitles = {
    bookmarks: t('bookmarks'),
    recipes: t('recipes'),
    origins: t('origins'),
    cameras: t('cameras'),
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

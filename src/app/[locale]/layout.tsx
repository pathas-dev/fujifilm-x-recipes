import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import NavigationBottom from '@/components/common/Navigation';
import ThemeSwitch, { DEFAULT_THEME } from '@/components/common/ThemeSwitch';
import { localeIntl, locales } from '@/navigation';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Noto_Sans_KR } from 'next/font/google';
import NavigationTop from '@/components/common/NavigationTop';
import Toast from '@/components/common/Toast';
import Help from '@/components/common/Help';
import { GoogleAnalytics } from '@next/third-parties/google';
import { cookies } from 'next/headers';

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
});

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: (typeof localeIntl)[keyof typeof localeIntl] };
}) {
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const SITE_URL = 'https://www.fujifilm-x-recipes.site';
  // 도메인 만료 시 아래 vercel 링크로 변경
  // const SITE_URL = 'https://fujifilm-x-recipes.vercel.app/';

  const metadata: Metadata = {
    title: 'fujifilm-x-recipes',
    description: t('description'),
    applicationName: 'X-recipes',
    manifest: `${SITE_URL}/manifest.json`,
    authors: [{ name: 'pathas', url: 'https://pathas.tistory.com/' }],
    keywords: [
      '후지필름',
      '레시피',
      '후지필름 레시피',
      '필름 시뮬레이션',
      '필름 레시피',
      '카메라',
      'fujifilm',
      'recipes',
      'fujifilm recipes',
      'film simulation',
      'film recipes',
      'camera',
    ],
    icons: { icon: `${SITE_URL}/favicon.ico` },

    robots: { follow: true, index: true },

    openGraph: {
      title: 'fujifilm-x-recipes',
      description: t('description'),
      url: SITE_URL,
      siteName: 'fujifilm-x-recipes',
      images: [
        {
          url: `${SITE_URL}/og.png`, // Must be an absolute URL
          width: 1200,
          height: 630,
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

export const COOKIE_THEME_KEY = 'theme';

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

  const themeCookie = cookies().get(COOKIE_THEME_KEY);
  const theme = themeCookie?.value ?? DEFAULT_THEME;

  const t = useTranslations('Navigation');

  const navigationTitles = {
    bookmarks: t('bookmarks'),
    recipes: t('recipes'),
    origins: t('origins'),
    cameras: t('cameras'),
    custom: t('custom'),
  };

  return (
    <html lang={locale} data-theme={theme}>
      <body
        className={[
          notoSans.className,
          'drawer-content',
          'flex',
          'flex-col',
          'h-dvh',
          'overflow-hidden',
          'w-full',
          'relative',
          'select-none',
        ].join(' ')}
        suppressHydrationWarning
      >
        <NavigationTop titles={navigationTitles} />
        <main className="w-full h-[calc(100%-4rem)]">{children}</main>
        <Toast />
        <NavigationBottom titles={navigationTitles} />
        <ThemeSwitch />
        <Help />

        <SpeedInsights />
        <Analytics />
        <GoogleAnalytics gaId={process.env.G_TAG ?? ''} />
      </body>
    </html>
  );
}

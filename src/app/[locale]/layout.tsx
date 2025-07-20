import Help from "@/components/common/Help";
import NavigationBottom from "@/components/common/Navigation";
import NavigationTop from "@/components/common/NavigationTop";
import Toast from "@/components/common/Toast";
import { DEFAULT_THEME } from "@/components/settings/ThemeSwitch";
import { localeIntl, locales } from "@/i18n/navigation";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Noto_Sans_KR } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";
import { COOKIE_THEME_KEY } from "../constants/cookie";
import { SITE_URL } from "../sitemap";

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
});

export async function generateMetadata(props: {
  params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale, namespace: "Metadata" });

  // 도메인 만료 시 아래 vercel 링크로 변경

  const metadata: Metadata = {
    title: "fujifilm-x-recipes",
    description: t("description"),
    applicationName: "X-recipes",
    manifest: `${SITE_URL}/manifest.json`,
    authors: [{ name: "pathas", url: "https://pathas.tistory.com/" }],
    keywords: [
      "후지필름",
      "레시피",
      "후지필름 레시피",
      "필름 시뮬레이션",
      "필름 레시피",
      "카메라",
      "fujifilm",
      "recipes",
      "fujifilm recipes",
      "film simulation",
      "film recipes",
      "camera",
    ],
    icons: {
      icon: `${SITE_URL}/favicon.ico`,
      shortcut: `${SITE_URL}/favicon.ico`,
    },
    alternates: { canonical: SITE_URL },
    robots: { follow: true, index: true },

    openGraph: {
      title: "fujifilm-x-recipes",
      description: t("description"),
      url: SITE_URL,
      siteName: "fujifilm-x-recipes",
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
          alt: "open graph alt image",
        },
      ],
      locale: locale,
      alternateLocale: "en",
      type: "website",
    },
  };
  return metadata;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
}>) {
  const { locale } = await params;

  setRequestLocale(locale);

  const themeCookie = (await cookies()).get(COOKIE_THEME_KEY);
  const theme = themeCookie?.value ?? DEFAULT_THEME;

  const t = await getTranslations({ locale, namespace: "Navigation" });

  const navigationTitles = {
    bookmarks: t("bookmarks"),
    recipes: t("recipes"),
    settings: t("settings"),
    cameras: t("cameras"),
    custom: t("custom"),
    chatbot: t("chatbot"),
  };

  return (
    <html lang={locale} data-theme={theme}>
      <body
        className={[
          notoSans.className,
          "drawer-content",
          "flex",
          "flex-col",
          "h-dvh",
          "overflow-hidden",
          "w-full",
          "relative",
          "select-none",
        ].join(" ")}
        suppressHydrationWarning
      >
        <NavigationTop titles={navigationTitles} />
        <main className="w-full h-[calc(100%-4rem)]">
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </main>
        <Toast />
        <NavigationBottom titles={navigationTitles} />
        <Help />

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

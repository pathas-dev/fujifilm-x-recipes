import { Metadata } from "next";
import "./globals.css";
import "./rc-slider.css";
import { SITE_URL } from "./sitemap";

export async function generateMetadata(): Promise<Metadata> {
  // 도메인 만료 시 아래 vercel 링크로 변경

  const metadata: Metadata = {
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
    robots: { follow: true, index: true },
  };
  return metadata;
}

// Since we have a root `not-found.tsx` page, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

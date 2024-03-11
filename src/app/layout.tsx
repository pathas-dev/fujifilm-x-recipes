import Navigation from '@/components/common/Navigation';
import ThemeSwitch from '@/components/common/ThemeSwitch';
import type { Metadata } from 'next';
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dracula">
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
        <Navigation />

        <ThemeSwitch />
      </body>
    </html>
  );
}

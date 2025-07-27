import { COOKIE_THEME_KEY } from '@/app/constants/cookie';
import { DEFAULT_THEME } from '@/components/settings/ThemeSwitch';
import { Noto_Sans_KR } from 'next/font/google';
import { cookies } from 'next/headers';

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
});

export default async function NotFound() {
  const themeCookie = (await cookies()).get(COOKIE_THEME_KEY);
  const theme = themeCookie?.value ?? DEFAULT_THEME;

  return (
    <html lang="en" data-theme="dark">
      <body
        className={[
          notoSans.className,
          'drawer-content',
          'flex',
          'h-dvh',
          'w-full',
          'relative',
          'select-none',
        ].join(' ')}
      >
        <main className="flex h-full w-full flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">Not Found</h2>
          <p className="text-xl">Could not find requested page</p>
          {/* eslint-disable-next-line */}
          <a href="/">
            <button className="btn btn-outline btn-error mt-2">
              Return Home
            </button>
          </a>
        </main>
      </body>
    </html>
  );
}

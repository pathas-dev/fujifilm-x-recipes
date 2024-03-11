'use client';

import { Link } from '@/navigation';
import { Noto_Sans_KR } from 'next/font/google';

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
});

export default function NotFound() {
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
          'select-none',
        ].join(' ')}
      >
        <main className="flex flex-col w-full min-h-screen items-center justify-center">
          <h2 className="text-2xl font-bold">Not Found</h2>
          <p className="text-xl">Could not find requested page</p>
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

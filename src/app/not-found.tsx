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
          'h-dvh',
          'w-full',
          'relative',
          'select-none',
        ].join(' ')}
      >
        <main className="flex h-full flex-col w-full items-center justify-center">
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

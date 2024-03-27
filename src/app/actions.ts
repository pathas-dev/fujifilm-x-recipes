'use server';

import { cookies } from 'next/headers';

export async function setCookieTheme(theme: string) {
  try {
    return cookies()
      .set({
        name: process.env.COOKIE_THEME_KEY ?? '',
        value: theme,
      })
      .toString();
  } catch (error) {
    throw error;
  }
}

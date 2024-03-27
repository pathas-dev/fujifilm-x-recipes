'use server';

import { cookies } from 'next/headers';
import { COOKIE_THEME_KEY } from './[locale]/layout';

export async function setCookieTheme(theme: string) {
  try {
    return cookies()
      .set({
        name: COOKIE_THEME_KEY,
        value: theme,
      })
      .toString();
  } catch (error) {
    throw error;
  }
}

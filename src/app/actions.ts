'use server';

import { cookies } from 'next/headers';
import { COOKIE_THEME_KEY } from './constants/cookie';

export async function setCookieTheme(theme: string) {
  try {
    return (await cookies())
      .set({
        name: COOKIE_THEME_KEY,
        value: theme,
      })
      .toString();
  } catch (error) {
    throw error;
  }
}

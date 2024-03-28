'use client';

import { setCookieTheme } from '@/app/actions';
import { useCallback, useEffect, useState } from 'react';

const THEME_ATTRIBUTE = 'data-theme';
const DARK_THEME = 'dracula';
const LIGHT_THEME = 'retro';

export const DEFAULT_THEME = DARK_THEME;

const ThemeSwitch = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const initialTheme =
      document
        .getElementsByTagName('html')
        ?.item(0)
        ?.getAttribute(THEME_ATTRIBUTE) ?? '';

    const isDarkThemeAtFirst = initialTheme === DARK_THEME;
    setIsDarkTheme(isDarkThemeAtFirst);
  }, []);

  const handleClick = useCallback(async () => {
    const nextTheme = isDarkTheme ? LIGHT_THEME : DARK_THEME;
    try {
      const response = await setCookieTheme(nextTheme);
      const isSuccess = !!response;
      if (isSuccess) {
        const html = document.getElementsByTagName('html').item(0);
        html?.setAttribute(THEME_ATTRIBUTE, nextTheme);
        setIsDarkTheme(!isDarkTheme);
      }
    } catch (error) {
      console.log(error);
    }
  }, [isDarkTheme]);

  return (
    <label className="cursor-pointer grid place-items-center">
      <input
        type="checkbox"
        className="toggle theme-controller bg-base-content row-start-1 col-start-1 col-span-2"
        checked={isDarkTheme}
        readOnly
        onClick={handleClick}
      />
      <svg
        className="col-start-1 row-start-1 stroke-amber-400 fill-amber-400"
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
      <svg
        className="col-start-2 row-start-1 stroke-blue-400 fill-blue-400"
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </label>
  );
};
export default ThemeSwitch;

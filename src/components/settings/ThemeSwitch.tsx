"use client";

import { setCookieTheme } from "@/app/actions";
import { SvgSunMini, SvgMoonMini } from "@/components/icon/svgs";
import { useCallback, useEffect, useState } from "react";

const THEME_ATTRIBUTE = "data-theme";
const DARK_THEME = "dracula";
const LIGHT_THEME = "retro";

export const DEFAULT_THEME = DARK_THEME;

const ThemeSwitch = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const initialTheme =
      document
        .getElementsByTagName("html")
        ?.item(0)
        ?.getAttribute(THEME_ATTRIBUTE) ?? "";

    const isDarkThemeAtFirst = initialTheme === DARK_THEME;
    setIsDarkTheme(isDarkThemeAtFirst);
  }, []);

  const handleClick = useCallback(async () => {
    const nextTheme = isDarkTheme ? LIGHT_THEME : DARK_THEME;
    try {
      const response = await setCookieTheme(nextTheme);
      const isSuccess = !!response;
      if (isSuccess) {
        const html = document.getElementsByTagName("html").item(0);
        html?.setAttribute(THEME_ATTRIBUTE, nextTheme);
        setIsDarkTheme(!isDarkTheme);
      }
    } catch (error) {
      console.log(error);
    }
  }, [isDarkTheme]);

  return (
    <div className="form-control">
      <label className="toggle text-base-content">
        <input
          type="checkbox"
          checked={isDarkTheme}
          onClick={handleClick}
          readOnly
        />
        <div>
          <SvgSunMini />
        </div>
        <div>
          <SvgMoonMini />
        </div>
      </label>
    </div>
  );
};
export default ThemeSwitch;

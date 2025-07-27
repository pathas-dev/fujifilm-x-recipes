'use client';

import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export const STORAGE_HIDE_CARD_IMAGE_KEY = 'hideCardImage';

const HideCardImageToggle = () => {
  const tSettingsPage = useTranslations("SettingsPage");
  const label = tSettingsPage("hideCardImage");
  
  const [hideCardImage, setHideCardImage] = useState(true);

  useEffect(() => {
    const storedHideImage = JSON.parse(
      localStorage.getItem(STORAGE_HIDE_CARD_IMAGE_KEY) || 'false'
    );
    setHideCardImage(storedHideImage);
  }, []);

  const handleChange = useCallback(
    async ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => {
      setHideCardImage(checked);
      localStorage.setItem(
        STORAGE_HIDE_CARD_IMAGE_KEY,
        JSON.stringify(checked)
      );
    },
    []
  );

  return (
    <div className="form-control">
      <label className="label cursor-pointer p-0">
        <input
          type="checkbox"
          className="toggle"
          checked={hideCardImage}
          onChange={handleChange}
        />
        <span className="label-text ml-2">{label}</span>
      </label>
    </div>
  );
};
export default HideCardImageToggle;

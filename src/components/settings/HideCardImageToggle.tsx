'use client';

import { ChangeEvent, useCallback, useEffect, useState } from 'react';

export const STORAGE_HIDE_CARD_IMAGE_KEY = 'hideCardImage';

interface IHideCardImageToggleProps {
  label: string;
}

const HideCardImageToggle = ({ label }: IHideCardImageToggleProps) => {
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

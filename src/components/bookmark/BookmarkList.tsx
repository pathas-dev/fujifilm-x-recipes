'use client';

import { Recipe } from '@/types/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SvgCameraMicro, SvgFilmMicro, SvgSensorMicro } from '../icon/svgs';
import Card, { STORAGE_BOOKMARK_KEY } from '../card/Card';
import { Dropbox, DropboxProps } from '../card/CardList';

interface IBookmarkListProps {
  recipes: Recipe[];
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
}

const BookmarkList = ({ filters, recipes }: IBookmarkListProps) => {
  const [markedRecipes, setMarkedRecipes] = useState<Recipe[]>([]);

  const [bases, setBases] = useState<string[]>([]);
  const [cameras, setCameras] = useState<string[]>([]);
  const [sensors, setSensors] = useState<string[]>([]);
  const [bwOnly, setBwonly] = useState<boolean>(false);

  useEffect(() => {
    const storedRecipeIds = JSON.parse(
      localStorage.getItem(STORAGE_BOOKMARK_KEY) ?? '[]'
    ) as string[];
    const matchedRecipes = recipes.filter((recipe) =>
      storedRecipeIds.includes(recipe._id)
    );

    setMarkedRecipes(matchedRecipes);
  }, [recipes]);

  const flteredRecipes = useMemo(() => {
    return markedRecipes.filter((recipe) => {
      const isBaseIncluded = bases.length === 0 || bases.includes(recipe.base);
      const isCameraIncluded =
        cameras.length === 0 || cameras.includes(recipe.camera);
      const isSensorIncluded =
        sensors.length === 0 || sensors.includes(recipe.sensor);

      const isBw = bwOnly ? !/color/i.test(recipe.colorType) : true;

      return isBaseIncluded && isCameraIncluded && isSensorIncluded && isBw;
    });
  }, [markedRecipes, bases, cameras, sensors, bwOnly]);

  const dropboxProps: DropboxProps[] = [
    {
      selectedValues: bases,
      values: filters.bases,
      onClickMenu: ({ value, checked }) => {
        if (checked) setBases((prev) => [...prev, value]);
        else setBases((prev) => prev.filter((v) => v !== value));
      },
      children: <SvgFilmMicro />,
    },
    {
      selectedValues: cameras,
      values: filters.cameras,
      onClickMenu: ({ value, checked }) => {
        if (checked) setCameras((prev) => [...prev, value]);
        else setCameras((prev) => prev.filter((v) => v !== value));
      },
      children: <SvgCameraMicro />,
    },
    {
      selectedValues: sensors,
      values: filters.sensors,
      onClickMenu: ({ value, checked }) => {
        if (checked) setSensors((prev) => [...prev, value]);
        else setSensors((prev) => prev.filter((v) => v !== value));
      },
      children: <SvgSensorMicro />,
    },
  ];

  const onBwToggle = useCallback(() => setBwonly((prev) => !prev), []);

  return (
    <main className="w-full h-fit p-2 flex flex-col gap-2">
      <div className="flex h-fit items-center">
        {dropboxProps.map((dropboxProps, index) => (
          <Dropbox {...dropboxProps} key={index} />
        ))}
        <div className="form-control">
          <label className="cursor-pointer label">
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={bwOnly}
              onChange={onBwToggle}
            />
            <span className="label-text text-xs ml-1">B/W only</span>
          </label>
        </div>
      </div>
      {flteredRecipes.map((recipe) => (
        <Card recipe={recipe} key={recipe._id} />
      ))}
    </main>
  );
};

export default BookmarkList;

'use client';

import { Recipe } from '@/types/api';
import Card from './Card';
import { useCallback, useMemo, useState } from 'react';
import { SvgCameraMicro, SvgFilmMicro, SvgSensorMicro } from '../icon/svgs';

interface ICardListProps {
  recipes: Recipe[];
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
}

const CardList = ({ filters, recipes }: ICardListProps) => {
  const [bases, setBases] = useState<string[]>([]);
  const [cameras, setCameras] = useState<string[]>([]);
  const [sensors, setSensors] = useState<string[]>([]);
  const [bwOnly, setBwonly] = useState<boolean>(false);

  const flteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const isBaseIncluded = bases.length === 0 || bases.includes(recipe.base);
      const isCameraIncluded =
        cameras.length === 0 || cameras.includes(recipe.camera);
      const isSensorIncluded =
        sensors.length === 0 || sensors.includes(recipe.sensor);

      const isBw = bwOnly ? !/color/i.test(recipe.colorType) : true;

      return isBaseIncluded && isCameraIncluded && isSensorIncluded && isBw;
    });
  }, [recipes, bases, cameras, sensors, bwOnly]);

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

export interface DropboxProps {
  values: string[];
  selectedValues: string[];
  onClickMenu: ({
    value,
    checked,
  }: {
    value: string;
    checked: boolean;
  }) => void;
  children: React.ReactElement;
  dropdownEnd?: boolean;
}

export const Dropbox = ({
  values,
  selectedValues,
  onClickMenu,
  children,
  dropdownEnd,
}: DropboxProps) => {
  return (
    <details className={`dropdown ${dropdownEnd ? 'dropdown-end' : ''}`.trim()}>
      <summary tabIndex={0} role="button" className="btn btn-sm m-1">
        {children}
      </summary>
      <ul
        tabIndex={0}
        className="dropdown-content z-[999] menu p-2 shadow bg-base-100 rounded-box"
      >
        <div className="overflow-y-scroll max-h-64 w-max">
          {values.map((value) => (
            <li key={value}>
              <label className="label cursor-pointer ">
                <a className="label-text flex grow">{value}</a>
                <input
                  type="checkbox"
                  checked={selectedValues.includes(value)}
                  onChange={({ target: { checked } }) => {
                    onClickMenu({ value, checked });
                  }}
                  className="checkbox checkbox-primary checkbox-xs"
                />
              </label>
            </li>
          ))}
        </div>
      </ul>
    </details>
  );
};

export default CardList;

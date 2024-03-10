'use client';

import { Recipe } from '@/types/api';
import Card from './Card';
import { useCallback, useMemo, useState } from 'react';

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
      title: 'Base',
      selectedValues: bases,
      values: filters.bases,
      onClickMenu: ({ value, checked }) => {
        if (checked) setBases((prev) => [...prev, value]);
        else setBases((prev) => prev.filter((v) => v !== value));
      },
      children: <SvgFilm />,
    },
    {
      title: 'Camera',
      selectedValues: cameras,
      values: filters.cameras,
      onClickMenu: ({ value, checked }) => {
        if (checked) setCameras((prev) => [...prev, value]);
        else setCameras((prev) => prev.filter((v) => v !== value));
      },
      children: <SvgCamera />,
    },
    {
      title: 'Sensor',
      selectedValues: sensors,
      values: filters.sensors,
      onClickMenu: ({ value, checked }) => {
        if (checked) setSensors((prev) => [...prev, value]);
        else setSensors((prev) => prev.filter((v) => v !== value));
      },
      children: <SvgSensor />,
      dropdownEnd: true,
    },
  ];

  const onBwToggle = useCallback(() => setBwonly((prev) => !prev), []);

  return (
    <main className="w-full h-fit p-2 flex flex-col gap-2">
      <div className="flex h-fit items-center">
        {dropboxProps.map((dropboxProps) => (
          <Dropbox {...dropboxProps} key={dropboxProps.title} />
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

interface DropboxProps {
  title: string;
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

const Dropbox = ({
  title,
  values,
  selectedValues,
  onClickMenu,
  children,
  dropdownEnd,
}: DropboxProps) => {
  return (
    <div className={`dropdown ${dropdownEnd ? 'dropdown-end' : ''}`.trim()}>
      <div tabIndex={0} role="button" className="btn btn-sm m-1">
        {title}
        {children}
      </div>
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
    </div>
  );
};

const SvgFilm = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path
      fillRule="evenodd"
      d="M1 3.5A1.5 1.5 0 0 1 2.5 2h11A1.5 1.5 0 0 1 15 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9Zm1.5.25a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25v1a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-1Zm3.75-.25a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h3.5a.25.25 0 0 0 .25-.25v-3.5a.25.25 0 0 0-.25-.25h-3.5ZM6 8.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5Zm5.75-5.25a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-1a.25.25 0 0 0-.25-.25h-1.5ZM2.5 11.25a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25v1a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-1Zm9.25-.25a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-1a.25.25 0 0 0-.25-.25h-1.5ZM2.5 8.75a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25v1a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-1Zm9.25-.25a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-1a.25.25 0 0 0-.25-.25h-1.5ZM2.5 6.25A.25.25 0 0 1 2.75 6h1.5a.25.25 0 0 1 .25.25v1a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-1ZM11.75 6a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-1a.25.25 0 0 0-.25-.25h-1.5Z"
      clipRule="evenodd"
    />
  </svg>
);
const SvgCamera = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M9.5 8.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    <path
      fillRule="evenodd"
      d="M2.5 5A1.5 1.5 0 0 0 1 6.5v5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 13.5 5h-.879a1.5 1.5 0 0 1-1.06-.44l-1.122-1.12A1.5 1.5 0 0 0 9.38 3H6.62a1.5 1.5 0 0 0-1.06.44L4.439 4.56A1.5 1.5 0 0 1 3.38 5H2.5ZM11 8.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      clipRule="evenodd"
    />
  </svg>
);
const SvgSensor = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path
      fillRule="evenodd"
      d="M4.5 1.938a.75.75 0 0 1 1.025.274l.652 1.131c.351-.138.71-.233 1.073-.288V1.75a.75.75 0 0 1 1.5 0v1.306a5.03 5.03 0 0 1 1.072.288l.654-1.132a.75.75 0 1 1 1.298.75l-.652 1.13c.286.23.55.492.785.786l1.13-.653a.75.75 0 1 1 .75 1.3l-1.13.652c.137.351.233.71.288 1.073h1.305a.75.75 0 0 1 0 1.5h-1.306a5.032 5.032 0 0 1-.288 1.072l1.132.654a.75.75 0 0 1-.75 1.298l-1.13-.652c-.23.286-.492.55-.786.785l.652 1.13a.75.75 0 0 1-1.298.75l-.653-1.13c-.351.137-.71.233-1.073.288v1.305a.75.75 0 0 1-1.5 0v-1.306a5.032 5.032 0 0 1-1.072-.288l-.653 1.132a.75.75 0 0 1-1.3-.75l.653-1.13a4.966 4.966 0 0 1-.785-.786l-1.13.652a.75.75 0 0 1-.75-1.298l1.13-.653a4.965 4.965 0 0 1-.288-1.073H1.75a.75.75 0 0 1 0-1.5h1.306a5.03 5.03 0 0 1 .288-1.072l-1.132-.653a.75.75 0 0 1 .75-1.3l1.13.653c.23-.286.492-.55.786-.785l-.653-1.13A.75.75 0 0 1 4.5 1.937Zm1.14 3.476a3.501 3.501 0 0 0 0 5.172L7.135 8 5.641 5.414ZM8.434 8.75 6.94 11.336a3.491 3.491 0 0 0 2.81-.305 3.49 3.49 0 0 0 1.669-2.281H8.433Zm2.987-1.5H8.433L6.94 4.664a3.501 3.501 0 0 1 4.48 2.586Z"
      clipRule="evenodd"
    />
  </svg>
);

export default CardList;

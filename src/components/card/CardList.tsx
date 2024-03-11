'use client';

import { Recipe } from '@/types/api';
import Card from './Card';
import { HTMLInputTypeAttribute, useCallback, useMemo, useState } from 'react';
import {
  SvgArrowUpDownMicro,
  SvgCameraMicro,
  SvgFilmMicro,
  SvgSensorMicro,
} from '../icon/svgs';
import dayjs from 'dayjs';

interface ICardListProps {
  recipes: Recipe[];
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
}

const DESC_CHARACTER = '↓';
const ASC_CHARACTER = '↑';
const DATE_LABEL = 'Date';
const NAME_LABEL = 'Name';
const CAMERA_LABEL = 'Camera';
const BASE_LABEL = 'Base';
const CREATOR_LABEL = 'Creator';
const DELIMETER = ' ';

const sortTypes = {
  dateDesc: [DATE_LABEL, DESC_CHARACTER].join(DELIMETER),
  dateAsc: [DATE_LABEL, ASC_CHARACTER].join(DELIMETER),
  nameDesc: [NAME_LABEL, DESC_CHARACTER].join(DELIMETER),
  nameAsc: [NAME_LABEL, ASC_CHARACTER].join(DELIMETER),
  cameraDesc: [CAMERA_LABEL, DESC_CHARACTER].join(DELIMETER),
  cameraAsc: [CAMERA_LABEL, ASC_CHARACTER].join(DELIMETER),
  baseDesc: [BASE_LABEL, DESC_CHARACTER].join(DELIMETER),
  baseAsc: [BASE_LABEL, ASC_CHARACTER].join(DELIMETER),
  creatorDesc: [CREATOR_LABEL, DESC_CHARACTER].join(DELIMETER),
  creatorAsc: [CREATOR_LABEL, ASC_CHARACTER].join(DELIMETER),
} as const;

const sortValues = Object.values(sortTypes);

const getSortDateCallback =
  ({ key, isAsc }: { key: keyof Recipe; isAsc?: boolean }) =>
  (prev: Recipe, next: Recipe) => {
    const diff = dayjs(prev[key]).diff(next[key]);

    if (!isAsc) return diff * -1;
    return diff;
  };

const getSortCharCallback =
  ({ key, isAsc }: { key: keyof Recipe; isAsc?: boolean }) =>
  (prev: Recipe, next: Recipe) => {
    const diff = next[key].localeCompare(prev[key]);

    if (!isAsc) return diff * -1;
    return diff;
  };

const CardList = ({ filters, recipes }: ICardListProps) => {
  const [bases, setBases] = useState<string[]>([]);
  const [cameras, setCameras] = useState<string[]>([]);
  const [sensors, setSensors] = useState<string[]>([]);
  const [sortType, setSortType] = useState<
    (typeof sortTypes)[keyof typeof sortTypes]
  >(sortTypes.dateDesc);

  const [bwOnly, setBwonly] = useState<boolean>(false);

  const filteredRecipes = useMemo(() => {
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

  const sortedRecipes = useMemo(() => {
    const copiedFilteredRecipes = [...filteredRecipes];
    const [label, directionChar] = sortType.split(DELIMETER);
    const isAsc = directionChar === ASC_CHARACTER;

    if (sortType.includes(DATE_LABEL)) {
      return copiedFilteredRecipes.sort(
        getSortDateCallback({ key: 'published', isAsc })
      );
    }

    return copiedFilteredRecipes.sort(
      getSortCharCallback({
        key: label.toLowerCase() as keyof Recipe,
        isAsc,
      })
    );
  }, [sortType, filteredRecipes]);

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
    {
      selectedValues: [sortType],
      values: sortValues,
      onClickMenu: ({ value, checked }) => {
        if (checked)
          setSortType(value as (typeof sortTypes)[keyof typeof sortTypes]);
      },
      children: <SvgArrowUpDownMicro />,
      type: 'radio',
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
      {sortedRecipes.map((recipe) => (
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
  type?: HTMLInputTypeAttribute;
}

export const Dropbox = ({
  values,
  selectedValues,
  onClickMenu,
  children,
  dropdownEnd,
  type = 'checkbox',
}: DropboxProps) => {
  const inputClassName = `${type} ${type}-primary ${type}-xs`;
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
                  type={type}
                  checked={selectedValues.includes(value)}
                  onChange={({ target: { checked } }) => {
                    onClickMenu({ value, checked });
                  }}
                  className={inputClassName}
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

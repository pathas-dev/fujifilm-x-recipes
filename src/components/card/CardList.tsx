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
  labels: {
    bwOnly: string;
    dateLabel: string;
    nameLabel: string;
    baseLabel: string;
    cameraLabel: string;
    creatorLabel: string;
  };
}

const CardList = ({ filters, recipes, labels }: ICardListProps) => {
  const DESC_CHARACTER = '↓';
  const ASC_CHARACTER = '↑';
  const DELIMETER = ' ';
  const dateLabel = labels.dateLabel;
  const nameLabel = labels.nameLabel;
  const cameraLabel = labels.cameraLabel;
  const baseLabel = labels.baseLabel;
  const creatorLabel = labels.creatorLabel;

  const sortTypes = {
    dateDesc: [dateLabel, DESC_CHARACTER].join(DELIMETER),
    dateAsc: [dateLabel, ASC_CHARACTER].join(DELIMETER),
    nameDesc: [nameLabel, DESC_CHARACTER].join(DELIMETER),
    nameAsc: [nameLabel, ASC_CHARACTER].join(DELIMETER),
    cameraDesc: [cameraLabel, DESC_CHARACTER].join(DELIMETER),
    cameraAsc: [cameraLabel, ASC_CHARACTER].join(DELIMETER),
    baseDesc: [baseLabel, DESC_CHARACTER].join(DELIMETER),
    baseAsc: [baseLabel, ASC_CHARACTER].join(DELIMETER),
    creatorDesc: [creatorLabel, DESC_CHARACTER].join(DELIMETER),
    creatorAsc: [creatorLabel, ASC_CHARACTER].join(DELIMETER),
  } as const;

  const sortValues = Object.values(sortTypes);

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
    const labelToRecipeKeyMap: { [key: string]: keyof Recipe } = {
      [dateLabel]: 'published',
      [nameLabel]: 'name',
      [cameraLabel]: 'camera',
      [baseLabel]: 'base',
      [creatorLabel]: 'creator',
    };

    const copiedFilteredRecipes = [...filteredRecipes];
    const [label, directionChar] = sortType.split(DELIMETER);
    const isAsc = directionChar === ASC_CHARACTER;

    if (sortType.includes(dateLabel)) {
      return copiedFilteredRecipes.sort(
        getSortDateCallback({ key: 'published', isAsc })
      );
    }

    return copiedFilteredRecipes.sort(
      getSortCharCallback({
        key: labelToRecipeKeyMap[label],
        isAsc,
      })
    );
  }, [
    sortType,
    filteredRecipes,
    dateLabel,
    nameLabel,
    cameraLabel,
    baseLabel,
    creatorLabel,
  ]);

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
    <>
      <header className="w-full h-fit shadow-md flex items-center fixed top-0 p-2 bg-base-100 z-[999]">
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
            <span className="label-text text-xs ml-1">{labels.bwOnly}</span>
          </label>
        </div>
        <span className="flex ml-2 text-xs">
          <SvgFilmMicro />x{sortedRecipes.length}
        </span>
      </header>
      <main className="w-full h-fit p-2 pt-16 flex flex-col gap-2">
        {sortedRecipes.map((recipe) => (
          <Card recipe={recipe} key={recipe._id} />
        ))}
      </main>
    </>
  );
};

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
  let inputClassName =
    type === 'checkbox'
      ? 'checkbox checkbox-primary checkbox-xs'
      : 'dropbox dropbox-primary dropbox-xs';

  return (
    <details className={`dropdown ${dropdownEnd ? 'dropdown-end' : ''}`.trim()}>
      <summary tabIndex={0} role="button" className="btn btn-sm m-1">
        {children}
      </summary>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box"
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

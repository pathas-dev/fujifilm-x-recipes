'use client';

import dayjs from 'dayjs';
import _reject from 'lodash/reject';
import _some from 'lodash/some';
import {
  Dispatch,
  HTMLInputTypeAttribute,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import Card from '../card/Card';
import {
  SvgArrowUpDownMicro,
  SvgCameraMicro,
  SvgFilmMicro,
  SvgSensorMicro,
} from '../icon/svgs';
import CustomCard, { CustomRecipe } from './CustomCard';

interface ICardListProps {
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

const DESC_CHARACTER = '↓';
const ASC_CHARACTER = '↑';
const DELIMETER = ' ';

const CardList = ({ filters, labels }: ICardListProps) => {
  const sortTypes: Item[] = useMemo(
    () => [
      {
        label: [labels.dateLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'published',
        isAsc: true,
      },
      {
        label: [labels.dateLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'published',
      },
      {
        label: [labels.nameLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'name',
        isAsc: true,
      },
      {
        label: [labels.nameLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'name',
      },
      {
        label: [labels.cameraLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'camera',
        isAsc: true,
      },
      {
        label: [labels.cameraLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'camera',
      },
      {
        label: [labels.baseLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'base',
        isAsc: true,
      },
      {
        label: [labels.baseLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'base',
      },
      {
        label: [labels.creatorLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'creator',
        isAsc: true,
      },
      {
        label: [labels.creatorLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'creator',
      },
    ],
    [
      labels.dateLabel,
      labels.nameLabel,
      labels.cameraLabel,
      labels.baseLabel,
      labels.creatorLabel,
    ]
  );

  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([
    { _id: '24', base: '', camera: '', colorType: '', sensor: '' },
  ]);

  const [bases, setBases] = useState<Item[]>([]);
  const [cameras, setCameras] = useState<Item[]>([]);
  const [sensors, setSensors] = useState<Item[]>([]);
  const [sortType, setSortType] = useState<Item>(sortTypes[1]);

  const [bwOnly, setBwonly] = useState<boolean>(false);

  const filteredRecipes = useMemo(() => {
    return customRecipes.filter((recipe) => {
      const isBaseIncluded =
        bases.length === 0 || !!_some(bases, { value: recipe.base });
      const isCameraIncluded =
        cameras.length === 0 || !!_some(cameras, { value: recipe.camera });
      const isSensorIncluded =
        sensors.length === 0 || !!_some(sensors, { value: recipe.sensor });

      const isBw = bwOnly ? !/color/i.test(recipe.colorType) : true;

      return isBaseIncluded && isCameraIncluded && isSensorIncluded && isBw;
    });
  }, [customRecipes, bases, cameras, sensors, bwOnly]);

  const sortedRecipes = useMemo(() => {
    const copiedFilteredRecipes = [...filteredRecipes];
    const { value, isAsc } = sortType;

    const sort =
      value === 'published' ? getSortDateCallback : getSortCharCallback;

    return copiedFilteredRecipes.sort(
      sort({ key: value as keyof CustomRecipe, isAsc })
    );
  }, [sortType, filteredRecipes]);

  const sortValues = Object.values(sortTypes);
  const baseItems = filters.bases.map((base) => ({ label: base, value: base }));
  const cameraItems = filters.cameras.map((carmera) => ({
    label: carmera,
    value: carmera,
  }));
  const sensorItems = filters.sensors.map((sensor) => ({
    label: sensor,
    value: sensor,
  }));

  const dropboxProps: DropboxProps[] = [
    {
      selectedItems: bases,
      items: baseItems,
      onClickMenu: getOnClickMenu(setBases),
      children: <SvgFilmMicro />,
    },
    {
      selectedItems: cameras,
      items: cameraItems,
      onClickMenu: getOnClickMenu(setCameras),
      children: <SvgCameraMicro />,
    },
    {
      selectedItems: sensors,
      items: sensorItems,
      onClickMenu: getOnClickMenu(setSensors),
      children: <SvgSensorMicro />,
    },
    {
      selectedItems: [sortType],
      items: sortValues,
      onClickMenu: ({ item, checked }) => {
        if (checked) setSortType(item);
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
      <main className="w-full h-fit p-2 pt-16 flex flex-col gap-2 items-center">
        {sortedRecipes.map((customRecipe) => (
          <CustomCard key={customRecipe._id} customRecipe={customRecipe} />
        ))}
      </main>
    </>
  );
};

const getOnClickMenu =
  (dispatch: Dispatch<SetStateAction<Item[]>>) =>
  ({ item, checked }: { item: Item; checked: boolean }) => {
    if (checked) dispatch((prev) => [...prev, item]);
    else dispatch((prev) => _reject(prev, item));
  };

const getSortDateCallback =
  ({ key, isAsc }: { key: keyof CustomRecipe; isAsc?: boolean }) =>
  (prev: CustomRecipe, next: CustomRecipe) => {
    const diff = dayjs(prev[key]).diff(next[key]);

    if (!isAsc) return diff * -1;
    return diff;
  };

const getSortCharCallback =
  ({ key, isAsc }: { key: keyof CustomRecipe; isAsc?: boolean }) =>
  (prev: CustomRecipe, next: CustomRecipe) => {
    const diff = prev[key].localeCompare(next[key]);

    if (!isAsc) return diff * -1;
    return diff;
  };

type Item = {
  value: string;
  label: string;
  isAsc?: boolean;
};

export interface DropboxProps {
  items: Item[];
  selectedItems: Item[];
  onClickMenu: ({ item, checked }: { item: Item; checked: boolean }) => void;
  children: React.ReactElement;
  dropdownEnd?: boolean;
  type?: HTMLInputTypeAttribute;
}

export const Dropbox = ({
  items,
  selectedItems,
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
          {items.map((item) => (
            <li key={item.label}>
              <label className="label cursor-pointer ">
                <a className="label-text flex grow">{item.label}</a>
                <input
                  type={type}
                  checked={!!_some(selectedItems, item)}
                  onChange={({ target: { checked } }) => {
                    onClickMenu({ item: item, checked });
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

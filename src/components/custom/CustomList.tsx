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
  useRef,
  useState,
} from 'react';
import {
  SvgArrowUpDownMicro,
  SvgCameraMicro,
  SvgFilmMicro,
  SvgPlusMicro,
  SvgPlusSolid,
  SvgSensorMicro,
} from '../icon/svgs';
import CustomCard, {
  CustomRecipe,
  ERROR_TYPES,
  initialCustomRecipe,
} from './CustomCard';
import { HeaderLabels, SettingMessages } from '@/types/language';
import { Camera } from '@/types/api';

interface ICardListProps {
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
  headerLabels: HeaderLabels;
  settingMessages: SettingMessages;
  cameras: Camera[];
}

const DESC_CHARACTER = '↓';
const ASC_CHARACTER = '↑';
const DELIMETER = ' ';

const CustomList = ({
  filters,
  headerLabels,
  settingMessages,
  cameras,
}: ICardListProps) => {
  const sortTypes: Item[] = useMemo(
    () => [
      {
        label: [headerLabels.dateLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'published',
        isAsc: true,
      },
      {
        label: [headerLabels.dateLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'published',
      },
      {
        label: [headerLabels.nameLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'name',
        isAsc: true,
      },
      {
        label: [headerLabels.nameLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'name',
      },
      {
        label: [headerLabels.cameraLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'camera',
        isAsc: true,
      },
      {
        label: [headerLabels.cameraLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'camera',
      },
      {
        label: [headerLabels.baseLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'base',
        isAsc: true,
      },
      {
        label: [headerLabels.baseLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'base',
      },
      {
        label: [headerLabels.creatorLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'creator',
        isAsc: true,
      },
      {
        label: [headerLabels.creatorLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'creator',
      },
    ],
    [
      headerLabels.dateLabel,
      headerLabels.nameLabel,
      headerLabels.cameraLabel,
      headerLabels.baseLabel,
      headerLabels.creatorLabel,
    ]
  );

  console.log(settingMessages.errors);

  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([
    initialCustomRecipe,
  ]);

  const [bases, setBases] = useState<Item[]>([]);
  const [filterCameras, setFilterCameras] = useState<Item[]>([]);
  const [sensors, setSensors] = useState<Item[]>([]);
  const [sortType, setSortType] = useState<Item>(sortTypes[1]);

  const [bwOnly, setBwonly] = useState<boolean>(false);

  const [sccuessMessage, setSuccessMessage] = useState('');
  const [errorType, setErrorType] = useState<(typeof ERROR_TYPES)[number] | ''>(
    ''
  );

  const refMain = useRef<HTMLElement>(null);

  const filteredRecipes = useMemo(() => {
    return customRecipes.filter((recipe) => {
      const isBaseIncluded =
        bases.length === 0 || !!_some(bases, { value: recipe.base });
      const isCameraIncluded =
        filterCameras.length === 0 ||
        !!_some(filterCameras, { value: recipe.camera });
      const isSensorIncluded =
        sensors.length === 0 || !!_some(sensors, { value: recipe.sensor });

      const isBw = bwOnly ? !/color/i.test(recipe.colorType) : true;

      return isBaseIncluded && isCameraIncluded && isSensorIncluded && isBw;
    });
  }, [customRecipes, bases, filterCameras, sensors, bwOnly]);

  const sortedRecipes = useMemo(() => {
    const copiedFilteredRecipes = [...filteredRecipes];
    const { value, isAsc } = sortType;

    const sort =
      value === 'published' ? getSortDateCallback : getSortCharCallback;

    return copiedFilteredRecipes.sort(
      sort({ key: value as keyof Omit<CustomRecipe, 'settings'>, isAsc })
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
      selectedItems: filterCameras,
      items: cameraItems,
      onClickMenu: getOnClickMenu(setFilterCameras),
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

  const TOAST_ALIVE_TIME = 900;

  const onCreateSuccess = (recipe: CustomRecipe) => {
    setCustomRecipes((prev) => [recipe, ...prev]);
    setSuccessMessage(settingMessages.successes.create);
    setTimeout(() => {
      setSuccessMessage('');
    }, TOAST_ALIVE_TIME);
  };

  const onUpdateSuccess = (recipe: CustomRecipe) => {
    setCustomRecipes((prev) => [recipe, ...prev]);
    setSuccessMessage(settingMessages.successes.update);
    setTimeout(() => {
      setSuccessMessage('');
    }, TOAST_ALIVE_TIME);
  };

  const onError = (errorType: (typeof ERROR_TYPES)[number]) => {
    setErrorType(errorType);
    setTimeout(() => {
      setErrorType('');
    }, TOAST_ALIVE_TIME);
  };

  return (
    <>
      <header className="w-full h-fit shadow-md flex items-center top-0 p-2 bg-base-100">
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
            <span className="label-text text-xs ml-1">
              {headerLabels.bwOnly}
            </span>
          </label>
        </div>
        <span className="flex ml-2 text-xs">
          <SvgFilmMicro />x{sortedRecipes.length}
        </span>
      </header>
      <button
        className="fixed z-[999] btn bottom-20 right-6 btn-primary btn-circle"
        onClick={() => {
          console.log(refMain.current);
          refMain.current?.scrollTo({ top: 0 });
        }}
      >
        <SvgPlusSolid />
      </button>
      <main
        className="w-full h-full p-3 pb-20 flex flex-col gap-2 items-center overflow-auto"
        ref={refMain}
      >
        {!!sccuessMessage && <SuccessToast message={sccuessMessage} />}
        {!!errorType && (
          <ErrorToast message={settingMessages.errors[errorType]} />
        )}
        <CustomCard
          cameras={cameras}
          customRecipe={initialCustomRecipe}
          filters={filters}
          settingLabels={settingMessages}
          onSuccess={onCreateSuccess}
          onError={onError}
        />
        {sortedRecipes.map((customRecipe) => (
          <CustomCard
            cameras={cameras}
            key={customRecipe._id}
            customRecipe={customRecipe}
            filters={filters}
            settingLabels={settingMessages}
            onSuccess={onUpdateSuccess}
            onError={onError}
          />
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
  ({
    key,
    isAsc,
  }: {
    key: keyof Omit<CustomRecipe, 'settings'>;
    isAsc?: boolean;
  }) =>
  (prev: CustomRecipe, next: CustomRecipe) => {
    const diff = dayjs(prev[key]).diff(next[key]);

    if (!isAsc) return diff * -1;
    return diff;
  };

const getSortCharCallback =
  ({
    key,
    isAsc,
  }: {
    key: keyof Omit<CustomRecipe, 'settings'>;
    isAsc?: boolean;
  }) =>
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

interface IToastProps {
  message: string;
}

const SuccessToast = ({ message }: IToastProps) => {
  return (
    <div className="toast toast-center toast-middle z-10">
      <div className="alert alert-success shadow-lg text-base-100">
        <span>{message}</span>
      </div>
    </div>
  );
};

const ErrorToast = ({ message }: IToastProps) => {
  return (
    <div className="toast toast-center toast-middle z-10 ">
      <div className="alert alert-error shadow-lg text-base-100">
        <span>{message}</span>
      </div>
    </div>
  );
};

export default CustomList;

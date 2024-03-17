'use client';

import { Camera } from '@/types/api';
import { HeaderLabels, SettingMessages } from '@/types/language';
import dayjs from 'dayjs';
import { produce } from 'immer';
import _reject from 'lodash/reject';
import _some from 'lodash/some';
import {
  Dispatch,
  HTMLInputTypeAttribute,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  SvgArrowUpDownMicro,
  SvgArrowUpSolid,
  SvgCameraMicro,
  SvgChebronDoubleDownSolid,
  SvgChebronDoubleUpSolid,
  SvgFilmMicro,
  SvgSensorMicro,
} from '../icon/svgs';
import CustomCard from './CustomCard';
import CustomEditCard from './CustomEditCard';
import { CustomRecipe, ERROR_TYPES } from './customRecipe';

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

const CUSTOM_RECIPES_STORAGE_KEY = 'customRecipes';

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
        value: 'createdAt',
        isAsc: true,
      },
      {
        label: [headerLabels.dateLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'createdAt',
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
    ],
    [
      headerLabels.dateLabel,
      headerLabels.nameLabel,
      headerLabels.cameraLabel,
      headerLabels.baseLabel,
    ]
  );

  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);

  const [bases, setBases] = useState<Item[]>([]);
  const [filterCameras, setFilterCameras] = useState<Item[]>([]);
  const [sensors, setSensors] = useState<Item[]>([]);
  const [sortType, setSortType] = useState<Item>(sortTypes[1]);

  const [bwOnly, setBwonly] = useState<boolean>(false);

  const [sccuessMessage, setSuccessMessage] = useState('');
  const [errorType, setErrorType] = useState<(typeof ERROR_TYPES)[number] | ''>(
    ''
  );

  const [shrinkCreateCard, setShrinkCreateCard] = useState(false);

  const refMain = useRef<HTMLElement>(null);

  useEffect(() => {
    const storedRecipes = JSON.parse(
      localStorage.getItem(CUSTOM_RECIPES_STORAGE_KEY) ?? '[]'
    );
    setCustomRecipes(storedRecipes);
  }, []);

  const filteredRecipes = useMemo(() => {
    return customRecipes.filter((recipe) => {
      const isBaseIncluded =
        bases.length === 0 || !!_some(bases, { value: recipe.base });
      const isCameraIncluded =
        filterCameras.length === 0 ||
        !!_some(filterCameras, { value: recipe.camera });
      const isSensorIncluded =
        sensors.length === 0 || !!_some(sensors, { value: recipe.sensor });

      const isBw = bwOnly ? recipe.colorType === 'BW' : true;

      return isBaseIncluded && isCameraIncluded && isSensorIncluded && isBw;
    });
  }, [customRecipes, bases, filterCameras, sensors, bwOnly]);

  const sortedRecipes = useMemo(() => {
    const copiedFilteredRecipes = [...filteredRecipes];

    const { value, isAsc } = sortType;

    const sort =
      value === 'createdAt' ? getSortDateCallback : getSortCharCallback;

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
    const recipes = [recipe, ...customRecipes];
    setCustomRecipes(recipes);

    localStorage.setItem(CUSTOM_RECIPES_STORAGE_KEY, JSON.stringify(recipes));

    setSuccessMessage(settingMessages.successes.create);
    setTimeout(() => {
      setSuccessMessage('');
    }, TOAST_ALIVE_TIME);
  };

  const onUpdateSuccess = (recipe: CustomRecipe) => {
    const recipesUpdated = produce(customRecipes, (draft) => {
      const index = draft.findIndex((value) => value._id === recipe._id);
      draft = draft.with(index, recipe);
      return draft;
    });
    setCustomRecipes(recipesUpdated);

    localStorage.setItem(
      CUSTOM_RECIPES_STORAGE_KEY,
      JSON.stringify(recipesUpdated)
    );

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

  const handleNewButton = () => {
    refMain.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDeleteSuccess = (deletedRecipe: CustomRecipe): void => {
    setCustomRecipes(
      produce(customRecipes, (draft) => {
        draft = _reject(draft, deletedRecipe);
        return draft;
      })
    );
    const storedItems = JSON.parse(
      localStorage.getItem(CUSTOM_RECIPES_STORAGE_KEY) ?? '[]'
    );
    const filtered = _reject(storedItems, deletedRecipe);
    localStorage.setItem(CUSTOM_RECIPES_STORAGE_KEY, JSON.stringify(filtered));
  };

  const createCardClassName = shrinkCreateCard
    ? 'w-full h-12 invisible overflow-hidden'
    : 'w-full h-full flex justify-center';

  const onChebronClick = () => setShrinkCreateCard((prev) => !prev);

  return (
    <>
      <header className="w-full h-fit shadow-md flex items-center top-0 p-2 bg-base-100  z-[999]">
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
        <span className="flex ml-1 text-xs">
          <SvgFilmMicro />x{sortedRecipes.length}
        </span>
      </header>
      <button
        className="fixed z-[999] btn bottom-16 right-6 btn-accent btn-square btn-sm fill-white shadow-md"
        onClick={handleNewButton}
      >
        <SvgArrowUpSolid />
      </button>
      <main
        className="w-full h-full p-3 pb-20 flex flex-col gap-2 items-center overflow-auto scroll-smooth"
        ref={refMain}
      >
        {!!sccuessMessage && <SuccessToast message={sccuessMessage} />}
        {!!errorType && (
          <ErrorToast message={settingMessages.errors[errorType]} />
        )}
        <section className="w-full relative">
          <button
            className="absolute btn btn-circle btn-accent z-10 left-0 right-0 mx-auto fill-white"
            onClick={onChebronClick}
          >
            {shrinkCreateCard ? (
              <SvgChebronDoubleDownSolid />
            ) : (
              <SvgChebronDoubleUpSolid />
            )}
          </button>
          <div className={createCardClassName}>
            <CustomEditCard
              cameras={cameras}
              filters={filters}
              settingLabels={settingMessages}
              onSuccess={onCreateSuccess}
              onError={onError}
            />
          </div>
        </section>
        {sortedRecipes.map((customRecipe, index) => (
          <CustomCard
            cameras={cameras}
            key={index}
            customRecipe={customRecipe}
            filters={filters}
            settingLabels={settingMessages}
            onUpdateSuccess={onUpdateSuccess}
            onUpdateError={onError}
            onDeleteSuccess={onDeleteSuccess}
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
    console.log(key);
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

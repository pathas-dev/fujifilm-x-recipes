'use client';

import { Recipe } from '@/types/api';
import dayjs from 'dayjs';
import { useInView } from 'framer-motion';
import _reject from 'lodash/reject';
import _some from 'lodash/some';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslations } from 'next-intl';
import RecipeFilterHeader, {
  DropboxItem,
  IDropboxProps,
} from '../common/RecipeFilterHeader';
import {
  SvgArrowUpDownMicro,
  SvgCameraMicro,
  SvgFilmMicro,
  SvgSensorMicro,
} from '../icon/svgs';
import RecipeCard from './RecipeCard';
import ScrollUpButton from '../common/ScrollUpButton';

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
const DELIMETER = ' ';

const RecipeCardList = ({ filters, recipes }: ICardListProps) => {
  // Translation hooks
  const tHeaders = useTranslations("Headers");

  // Create labels object from translations
  const labels = {
    bwOnly: tHeaders("bwOnly"),
    dateLabel: tHeaders("dateLabel"),
    nameLabel: tHeaders("nameLabel"),
    baseLabel: tHeaders("baseLabel"),
    cameraLabel: tHeaders("cameraLabel"),
    creatorLabel: tHeaders("creatorLabel"),
  };

  const sortTypes: DropboxItem[] = useMemo(
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

  const [page, setPage] = useState(0);

  const [bases, setBases] = useState<DropboxItem[]>([]);
  const [cameras, setCameras] = useState<DropboxItem[]>([]);
  const [sensors, setSensors] = useState<DropboxItem[]>([]);
  const [sortType, setSortType] = useState<DropboxItem>(sortTypes[1]);

  const [bwOnly, setBwonly] = useState<boolean>(false);

  const refMain = useRef<HTMLDivElement>(null);

  const refSkeleton = useRef(null);
  const isSkeletonInView = useInView(refSkeleton);

  useEffect(() => {
    if (isSkeletonInView) {
      setPage((prev) => prev + 1);
    }
  }, [isSkeletonInView]);

  const resetPage = () => {
    setPage(0);
    if (refMain.current) refMain.current.scrollTo({ top: 0 });
  };

  const filteredRecipes = useMemo(() => {
    resetPage();
    return recipes.filter((recipe) => {
      const isBaseIncluded =
        bases.length === 0 || !!_some(bases, { value: recipe.base });
      const isCameraIncluded =
        cameras.length === 0 || !!_some(cameras, { value: recipe.camera });
      const isSensorIncluded =
        sensors.length === 0 || !!_some(sensors, { value: recipe.sensor });

      const isBw = bwOnly ? !/color/i.test(recipe.colorType) : true;

      return isBaseIncluded && isCameraIncluded && isSensorIncluded && isBw;
    });
  }, [recipes, bases, cameras, sensors, bwOnly]);

  const sortedRecipes = useMemo(() => {
    resetPage();
    const copiedFilteredRecipes = [...filteredRecipes];
    const { value, isAsc } = sortType;

    const sort =
      value === 'published' ? getSortDateCallback : getSortCharCallback;

    return copiedFilteredRecipes.sort(
      sort({ key: value as keyof Recipe, isAsc })
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

  const dropboxProps: IDropboxProps[] = [
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

  const onBwToggle = useCallback((checked: boolean) => setBwonly(checked), []);

  const PAGE_SIZE = 30;
  const lastPage = Math.floor(sortedRecipes.length / PAGE_SIZE);
  const sliceTo = (page + 1) * PAGE_SIZE;

  return (
    <section className="w-full h-full">
      <RecipeFilterHeader
        bwOnly={bwOnly}
        onBwOnlyChange={onBwToggle}
        bwOnlyLabel={labels.bwOnly}
        filters={dropboxProps}
        recipesCount={sortedRecipes.length}
      />
      <main
        className="w-full h-[calc(100%-3.5rem)] p-2 grid grid-cols-1 md:grid-cols-3 gap-2 overflow-y-auto overflow-x-hidden scroll-smooth"
        style={{
          gridAutoRows: 'min-content',
        }}
        ref={refMain}
      >
        {sortedRecipes.slice(0, sliceTo).map((recipe) => (
          <RecipeCard recipe={recipe} key={recipe._id} />
        ))}
        {page !== lastPage && (
          <div
            ref={refSkeleton}
            className="skeleton card card-compact w-full min-h-44 h-fit flex items-center justify-center"
          >
            <span className="loading loading-infinity loading-lg"></span>
          </div>
        )}
        <ScrollUpButton refObject={refMain} />
      </main>
    </section>
  );
};

const getOnClickMenu =
  (dispatch: Dispatch<SetStateAction<DropboxItem[]>>) =>
  ({ item, checked }: { item: DropboxItem; checked: boolean }) => {
    if (checked) dispatch((prev) => [...prev, item]);
    else dispatch((prev) => _reject(prev, item));
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
    const diff = prev[key].localeCompare(next[key]);

    if (!isAsc) return diff * -1;
    return diff;
  };

export default RecipeCardList;

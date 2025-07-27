'use client';

import useToastStore from '@/stores/toast';
import useCustomRecipeStore from '@/stores/customRecipe';
import { Camera } from '@/types/api';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import _reject from 'lodash/reject';
import _some from 'lodash/some';
import lzString from 'lz-string';
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
import ScrollUpButton from '../common/ScrollUpButton';
import {
  SvgArrowUpDownMicro,
  SvgCameraMicro,
  SvgChebronDoubleUpSolid,
  SvgChevronDoubleDownSolid,
  SvgFilmMicro,
  SvgSensorMicro,
} from '../icon/svgs';
import CustomCard, { QUERY_KEY_ADD_RECIPE } from './CustomCard';
import CustomEditCard from './CustomEditCard';
import { CustomRecipe, ERROR_TYPES, isCustomRecipeJSON } from './customRecipe';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

interface ICardListProps {
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
  cameras: Camera[];
}

const DESC_CHARACTER = '↓';
const ASC_CHARACTER = '↑';
const DELIMETER = ' ';

const CustomList = ({ filters, cameras }: ICardListProps) => {
  // Translation hooks
  const tHeaders = useTranslations('Headers');
  const tSettings = useTranslations('Settings');
  const tCopyAndPasteMessages = useTranslations('CopyAndPasteMessages');

  // Create message objects from translations
  const headerMessages = {
    bwOnly: tHeaders('bwOnly'),
    dateLabel: tHeaders('dateLabel'),
    nameLabel: tHeaders('nameLabel'),
    baseLabel: tHeaders('baseLabel'),
    cameraLabel: tHeaders('cameraLabel'),
    creatorLabel: tHeaders('creatorLabel'),
  };

  const settingMessages = {
    newTitle: tSettings('newTitle'),
    updateTitle: tSettings('updateTitle'),
    placeholders: {
      name: tSettings('placeholders.name'),
      camera: tSettings('placeholders.camera'),
      base: tSettings('placeholders.base'),
    },
    labels: {
      highlight: tSettings('labels.highlight'),
      tone: tSettings('labels.tone'),
      shadow: tSettings('labels.shadow'),
      grain: tSettings('labels.grain'),
      grainSize: tSettings('labels.grainSize'),
      grainRoughness: tSettings('labels.grainRoughness'),
      dynamicRange: tSettings('labels.dynamicRange'),
      colorChromeEffect: tSettings('labels.colorChromeEffect'),
      colorChromeFXBlue: tSettings('labels.colorChromeFXBlue'),
      sharpness: tSettings('labels.sharpness'),
      color: tSettings('labels.color'),
      clarity: tSettings('labels.clarity'),
      isoNoiseReduction: tSettings('labels.isoNoiseReduction'),
      exposure: tSettings('labels.exposure'),
      iso: tSettings('labels.iso'),
      whiteBalance: tSettings('labels.whiteBalance'),
      whiteBalanceK: tSettings('labels.whiteBalanceK'),
      whiteBalanceShift: tSettings('labels.whiteBalanceShift'),
      bwAdj: tSettings('labels.bwAdj'),
    },
    options: {
      effects: {
        off: tSettings('options.effects.off'),
        strong: tSettings('options.effects.strong'),
        weak: tSettings('options.effects.weak'),
      },
      sizes: {
        off: tSettings('options.sizes.off'),
        large: tSettings('options.sizes.large'),
        small: tSettings('options.sizes.small'),
      },
      whiteBalances: {
        autoWhitePriority: tSettings('options.whiteBalances.autoWhitePriority'),
        auto: tSettings('options.whiteBalances.auto'),
        autoAmbiencePriority: tSettings(
          'options.whiteBalances.autoAmbiencePriority'
        ),
        measure: tSettings('options.whiteBalances.measure'),
        k: tSettings('options.whiteBalances.k'),
        sunlight: tSettings('options.whiteBalances.sunlight'),
        shade: tSettings('options.whiteBalances.shade'),
        daylight: tSettings('options.whiteBalances.daylight'),
        warmWhite: tSettings('options.whiteBalances.warmWhite'),
        coolWhite: tSettings('options.whiteBalances.coolWhite'),
        incandescent: tSettings('options.whiteBalances.incandescent'),
        underwater: tSettings('options.whiteBalances.underwater'),
      },
    },
    errors: {
      noName: tSettings('errors.noName'),
      noCamera: tSettings('errors.noCamera'),
      noBase: tSettings('errors.noBase'),
    },
    successes: {
      create: tSettings('successes.create'),
      update: tSettings('successes.update'),
    },
  };

  const copyAndPasteMessages = {
    copy: {
      success: tCopyAndPasteMessages('copy.success'),
      fail: tCopyAndPasteMessages('copy.fail'),
    },
    paste: {
      success: tCopyAndPasteMessages('paste.success'),
      errors: {
        invalidURL: tCopyAndPasteMessages('paste.errors.invalidURL'),
        invalidScheme: tCopyAndPasteMessages('paste.errors.invalidScheme'),
      },
    },
  };

  const sortTypes: DropboxItem[] = useMemo(
    () => [
      {
        label: [headerMessages.dateLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'createdAt',
        isAsc: true,
      },
      {
        label: [headerMessages.dateLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'createdAt',
      },
      {
        label: [headerMessages.nameLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'name',
        isAsc: true,
      },
      {
        label: [headerMessages.nameLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'name',
      },
      {
        label: [headerMessages.cameraLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'camera',
        isAsc: true,
      },
      {
        label: [headerMessages.cameraLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'camera',
      },
      {
        label: [headerMessages.baseLabel, ASC_CHARACTER].join(DELIMETER),
        value: 'base',
        isAsc: true,
      },
      {
        label: [headerMessages.baseLabel, DESC_CHARACTER].join(DELIMETER),
        value: 'base',
      },
    ],
    [
      headerMessages.dateLabel,
      headerMessages.nameLabel,
      headerMessages.cameraLabel,
      headerMessages.baseLabel,
    ]
  );

  const searchParams = useSearchParams();
  const addParam = searchParams.get(QUERY_KEY_ADD_RECIPE);
  const router = useRouter();

  const setToastMessage = useToastStore((state) => state.setMessage);

  const { customRecipes, addRecipe, updateRecipe, deleteRecipe, setRecipes } =
    useCustomRecipeStore();

  const [bases, setBases] = useState<DropboxItem[]>([]);
  const [filterCameras, setFilterCameras] = useState<DropboxItem[]>([]);
  const [sensors, setSensors] = useState<DropboxItem[]>([]);
  const [sortType, setSortType] = useState<DropboxItem>(sortTypes[1]);

  const [bwOnly, setBwonly] = useState<boolean>(false);

  const [shrinkCreateCard, setShrinkCreateCard] = useState(false);

  const refMain = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!addParam) return;

    const decompressedRecipe =
      lzString.decompressFromEncodedURIComponent(addParam);

    if (!decompressedRecipe) {
      setToastMessage({
        message: copyAndPasteMessages.paste.errors.invalidURL,
      });
      return router.replace('/');
    }

    const sharedRecipe = JSON.parse(decompressedRecipe) as CustomRecipe;
    const isValidCustomRecipe = isCustomRecipeJSON(sharedRecipe);

    if (!isValidCustomRecipe) {
      setToastMessage({
        message: copyAndPasteMessages.paste.errors.invalidScheme,
      });
      return router.replace('/');
    }
    const newRecipe: CustomRecipe = {
      ...sharedRecipe,
      _id: uuidv4(),
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    addRecipe(newRecipe);
    setToastMessage({ message: copyAndPasteMessages.paste.success });
    router.replace('/');
  }, [
    addParam,
    router,
    setToastMessage,
    copyAndPasteMessages.paste.errors.invalidScheme,
    copyAndPasteMessages.paste.errors.invalidURL,
    copyAndPasteMessages.paste.success,
    addRecipe,
  ]);

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

  const dropboxProps: IDropboxProps[] = [
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

  const onBwToggle = useCallback((checked: boolean) => setBwonly(checked), []);

  const onCreateSuccess = (recipe: CustomRecipe) => {
    addRecipe(recipe);
    setToastMessage({
      message: settingMessages.successes.create,
    });
  };

  const onUpdateSuccess = (recipe: CustomRecipe) => {
    updateRecipe(recipe);
    setToastMessage({
      message: settingMessages.successes.update,
    });
  };

  const onError = (errorType: (typeof ERROR_TYPES)[number]) => {
    setToastMessage({
      type: 'Error',
      message: settingMessages.errors[errorType],
    });
  };

  const handleToUpButton = () => {
    refMain.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDeleteSuccess = (deletedRecipe: CustomRecipe): void => {
    deleteRecipe(deletedRecipe);
  };

  const createCardClassName = shrinkCreateCard
    ? 'w-full h-12 invisible overflow-hidden'
    : 'w-full h-full flex justify-center';

  const onChebronClick = () => setShrinkCreateCard((prev) => !prev);

  const onImportSuccess = (unionRecipes: CustomRecipe[]) =>
    setRecipes(unionRecipes);

  return (
    <section className="h-full w-full">
      <RecipeFilterHeader
        bwOnly={bwOnly}
        onBwOnlyChange={onBwToggle}
        bwOnlyLabel={headerMessages.bwOnly}
        filters={dropboxProps}
        recipesCount={sortedRecipes.length}
      />

      <main
        className="grid h-[calc(100%-3.5rem)] w-full grid-cols-1 gap-2 overflow-x-hidden overflow-y-auto scroll-smooth p-2 md:grid-cols-3"
        ref={refMain}
        style={{
          gridAutoRows: 'min-content',
        }}
      >
        <section className="relative col-span-1 w-full md:col-span-3">
          <motion.button
            className="btn btn-circle btn-accent absolute right-0 left-0 z-10 mx-auto fill-white"
            onClick={onChebronClick}
            transition={{ duration: 0.4 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.9 }}
          >
            {shrinkCreateCard ? (
              <SvgChevronDoubleDownSolid />
            ) : (
              <SvgChebronDoubleUpSolid />
            )}
          </motion.button>

          <motion.div
            className={createCardClassName}
            transition={{ duration: 0.5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CustomEditCard
              cameras={cameras}
              filters={filters}
              onSuccess={onCreateSuccess}
              onError={onError}
              onImportSuccess={onImportSuccess}
            />
          </motion.div>
        </section>
        {sortedRecipes.map((customRecipe, index) => (
          <CustomCard
            cameras={cameras}
            key={index}
            customRecipe={customRecipe}
            filters={filters}
            onUpdateSuccess={onUpdateSuccess}
            onUpdateError={onError}
            onDeleteSuccess={onDeleteSuccess}
          />
        ))}
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

export default CustomList;

"use client";

import useToastStore from "@/stores/toast";
import { Camera } from "@/types/api";
import {
  CopyAndPasteMessages,
  HeaderMessages,
  ImportFileMessages,
  SendEmailMessages,
  SettingMessages,
} from "@/types/language";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { produce } from "immer";
import _reject from "lodash/reject";
import _some from "lodash/some";
import lzString from "lz-string";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import RecipeFilterHeader, {
  DropboxItem,
  IDropboxProps,
} from "../common/RecipeFilterHeader";
import ScrollUpButton from "../common/ScrollUpButton";
import {
  SvgArrowUpDownMicro,
  SvgCameraMicro,
  SvgChebronDoubleUpSolid,
  SvgChevronDoubleDownSolid,
  SvgFilmMicro,
  SvgSensorMicro,
} from "../icon/svgs";
import CustomCard, { QUERY_KEY_ADD_RECIPE } from "./CustomCard";
import CustomEditCard from "./CustomEditCard";
import { CustomRecipe, ERROR_TYPES, isCustomRecipeJSON } from "./customRecipe";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

interface ICardListProps {
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
  headerMessages: HeaderMessages;
  settingMessages: SettingMessages;
  sendEmailMessages: SendEmailMessages;
  importFileMessages: ImportFileMessages;
  copyAndPasteMessages: CopyAndPasteMessages;
  cameras: Camera[];
}

const DESC_CHARACTER = "↓";
const ASC_CHARACTER = "↑";
const DELIMETER = " ";

export const STORAGE_CUSTOM_RECIPES_KEY = "customRecipes";

const CustomList = ({
  filters,
  headerMessages,
  settingMessages,
  sendEmailMessages,
  importFileMessages,
  copyAndPasteMessages,
  cameras,
}: ICardListProps) => {
  const sortTypes: DropboxItem[] = useMemo(
    () => [
      {
        label: [headerMessages.dateLabel, ASC_CHARACTER].join(DELIMETER),
        value: "createdAt",
        isAsc: true,
      },
      {
        label: [headerMessages.dateLabel, DESC_CHARACTER].join(DELIMETER),
        value: "createdAt",
      },
      {
        label: [headerMessages.nameLabel, ASC_CHARACTER].join(DELIMETER),
        value: "name",
        isAsc: true,
      },
      {
        label: [headerMessages.nameLabel, DESC_CHARACTER].join(DELIMETER),
        value: "name",
      },
      {
        label: [headerMessages.cameraLabel, ASC_CHARACTER].join(DELIMETER),
        value: "camera",
        isAsc: true,
      },
      {
        label: [headerMessages.cameraLabel, DESC_CHARACTER].join(DELIMETER),
        value: "camera",
      },
      {
        label: [headerMessages.baseLabel, ASC_CHARACTER].join(DELIMETER),
        value: "base",
        isAsc: true,
      },
      {
        label: [headerMessages.baseLabel, DESC_CHARACTER].join(DELIMETER),
        value: "base",
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

  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);

  const [bases, setBases] = useState<DropboxItem[]>([]);
  const [filterCameras, setFilterCameras] = useState<DropboxItem[]>([]);
  const [sensors, setSensors] = useState<DropboxItem[]>([]);
  const [sortType, setSortType] = useState<DropboxItem>(sortTypes[1]);

  const [bwOnly, setBwonly] = useState<boolean>(false);

  const [shrinkCreateCard, setShrinkCreateCard] = useState(false);

  const refMain = useRef<HTMLElement>(null);

  useEffect(() => {
    const storedRecipes = JSON.parse(
      localStorage.getItem(STORAGE_CUSTOM_RECIPES_KEY) ?? "[]"
    );
    setCustomRecipes(storedRecipes);
  }, []);

  useEffect(() => {
    if (!addParam) return;

    const decompressedRecipe =
      lzString.decompressFromEncodedURIComponent(addParam);

    if (!decompressedRecipe) {
      setToastMessage({
        message: copyAndPasteMessages.paste.errors.invalidURL,
      });
      return router.replace("/");
    }

    const sharedRecipe = JSON.parse(decompressedRecipe) as CustomRecipe;
    const isValidCustomRecipe = isCustomRecipeJSON(sharedRecipe);

    if (!isValidCustomRecipe) {
      setToastMessage({
        message: copyAndPasteMessages.paste.errors.invalidScheme,
      });
      return router.replace("/");
    }
    const newRecipe: CustomRecipe = {
      ...sharedRecipe,
      _id: uuidv4(),
      createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };

    const storedRecipe = JSON.parse(
      localStorage.getItem(STORAGE_CUSTOM_RECIPES_KEY) ?? "[]"
    );

    const addedStoredRecipe = [newRecipe, ...storedRecipe];
    localStorage.setItem(
      STORAGE_CUSTOM_RECIPES_KEY,
      JSON.stringify(addedStoredRecipe)
    );

    setCustomRecipes(addedStoredRecipe);
    setToastMessage({ message: copyAndPasteMessages.paste.success });
    router.replace("/");
  }, [
    addParam,
    router,
    setToastMessage,
    copyAndPasteMessages.paste.errors.invalidScheme,
    copyAndPasteMessages.paste.errors.invalidURL,
    copyAndPasteMessages.paste.success,
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

      const isBw = bwOnly ? recipe.colorType === "BW" : true;

      return isBaseIncluded && isCameraIncluded && isSensorIncluded && isBw;
    });
  }, [customRecipes, bases, filterCameras, sensors, bwOnly]);

  const sortedRecipes = useMemo(() => {
    const copiedFilteredRecipes = [...filteredRecipes];

    const { value, isAsc } = sortType;

    const sort =
      value === "createdAt" ? getSortDateCallback : getSortCharCallback;

    return copiedFilteredRecipes.sort(
      sort({ key: value as keyof Omit<CustomRecipe, "settings">, isAsc })
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
      type: "radio",
    },
  ];

  const onBwToggle = useCallback((checked: boolean) => setBwonly(checked), []);

  const onCreateSuccess = (recipe: CustomRecipe) => {
    const recipes = [recipe, ...customRecipes];
    setCustomRecipes(recipes);

    localStorage.setItem(STORAGE_CUSTOM_RECIPES_KEY, JSON.stringify(recipes));

    setToastMessage({
      message: settingMessages.successes.create,
    });
  };

  const onUpdateSuccess = (recipe: CustomRecipe) => {
    const recipesUpdated = produce(customRecipes, (draft) => {
      const index = draft.findIndex((value) => value._id === recipe._id);
      draft = draft.with(index, recipe);
      return draft;
    });
    setCustomRecipes(recipesUpdated);

    localStorage.setItem(
      STORAGE_CUSTOM_RECIPES_KEY,
      JSON.stringify(recipesUpdated)
    );

    setToastMessage({
      message: settingMessages.successes.update,
    });
  };

  const onError = (errorType: (typeof ERROR_TYPES)[number]) => {
    setToastMessage({
      type: "Error",
      message: settingMessages.errors[errorType],
    });
  };

  const handleToUpButton = () => {
    refMain.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDeleteSuccess = (deletedRecipe: CustomRecipe): void => {
    setCustomRecipes((prev) => _reject(prev, deletedRecipe));
    const storedItems = JSON.parse(
      localStorage.getItem(STORAGE_CUSTOM_RECIPES_KEY) ?? "[]"
    );
    const filtered = _reject(storedItems, deletedRecipe);
    localStorage.setItem(STORAGE_CUSTOM_RECIPES_KEY, JSON.stringify(filtered));
  };

  const createCardClassName = shrinkCreateCard
    ? "w-full h-12 invisible overflow-hidden"
    : "w-full h-full flex justify-center";

  const onChebronClick = () => setShrinkCreateCard((prev) => !prev);

  const onImportSuccess = (unionRecipes: CustomRecipe[]) =>
    setCustomRecipes(unionRecipes);

  return (
    <section className="w-full h-full">
      <RecipeFilterHeader
        bwOnly={bwOnly}
        onBwOnlyChange={onBwToggle}
        bwOnlyLabel={headerMessages.bwOnly}
        filters={dropboxProps}
        recipesCount={sortedRecipes.length}
      />

      <main
        className="w-full h-[calc(100%-3.5rem)] p-2 grid grid-cols-1 md:grid-cols-3 gap-2 overflow-y-auto overflow-x-hidden scroll-smooth"
        ref={refMain}
        style={{
          gridAutoRows: "min-content",
        }}
      >
        <section className="w-full relative col-span-1 md:col-span-3">
          <motion.button
            className="absolute btn btn-circle btn-accent z-10 left-0 right-0 mx-auto fill-white"
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
              settingMessages={settingMessages}
              onSuccess={onCreateSuccess}
              onError={onError}
              sendEmailMessages={sendEmailMessages}
              importFileMessages={importFileMessages}
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
            settingMessages={settingMessages}
            onUpdateSuccess={onUpdateSuccess}
            onUpdateError={onError}
            onDeleteSuccess={onDeleteSuccess}
            copyAndPasteMessages={copyAndPasteMessages}
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
    key: keyof Omit<CustomRecipe, "settings">;
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
    key: keyof Omit<CustomRecipe, "settings">;
    isAsc?: boolean;
  }) =>
  (prev: CustomRecipe, next: CustomRecipe) => {
    console.log(key);
    const diff = prev[key].localeCompare(next[key]);

    if (!isAsc) return diff * -1;
    return diff;
  };

export default CustomList;

'use client';
import { Camera } from '@/types/api';
import {
  CopyAndPasteMessages,
  ImportFileMessages,
  SendEmailMessages,
  SettingI18NMessages,
  SettingMessages,
} from '@/types/language';
import dayjs from 'dayjs';
import { produce } from 'immer';
import {
  ReactElement,
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SvgDocumentCheck, SvgDocumentPlus } from '../icon/svgs';
import ExportButton from './ExportButton';
import { CustomInput, CustomSelect } from './SettingInput';
import SettingTab from './SettingTab';
import {
  CustomRecipe,
  ERROR_TYPES,
  getInitialCustomRecipe,
  initialSettings,
} from './customRecipe';
import {
  COLOR_CHROME,
  COLOR_CHROME_FX_BLUE,
  GRAIN_ROUGHNESS,
  GRAIN_SIZE,
  WHITE_BALANCES,
} from './fujiSettings';
import ImportButton from './ImportButton';

export interface ICustomEditCardProps {
  customRecipe?: CustomRecipe;
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
  settingMessages: SettingMessages;
  sendEmailMessages?: SendEmailMessages;
  importFileMessages?: ImportFileMessages;
  copyAndPasteMessages?: CopyAndPasteMessages;

  cameras: Camera[];
  onSuccess: (recipe: CustomRecipe) => void;
  onError: (errorType: (typeof ERROR_TYPES)[number]) => void;
  onImportSuccess?: (unionRecipes: CustomRecipe[]) => void;
}

const CustomEditCard = ({
  customRecipe,
  filters,
  settingMessages,
  sendEmailMessages,
  importFileMessages,
  cameras,
  onSuccess,
  onError,
  onImportSuccess,
}: ICustomEditCardProps) => {
  const [recipe, setRecipe] = useState(getInitialCustomRecipe());

  const refTab = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setRecipe((prev) => ({
      ...prev,
      _id: customRecipe?._id ?? '',
      base: customRecipe?.base ?? '',
      camera: customRecipe?.camera ?? '',
      colorType: customRecipe?.colorType ?? 'Color',
      createdAt: customRecipe?.createdAt ?? '',
      updatedAt: customRecipe?.updatedAt ?? '',
      name: customRecipe?.name ?? '',
      sensor: customRecipe?.sensor ?? '',
      settings: customRecipe?.settings ?? initialSettings,
    }));
  }, [
    customRecipe?._id,
    customRecipe?.base,
    customRecipe?.camera,
    customRecipe?.colorType,
    customRecipe?.createdAt,
    customRecipe?.updatedAt,
    customRecipe?.name,
    customRecipe?.sensor,
    customRecipe?.settings,
  ]);

  const [currentTab, setCurrentTab] =
    useState<keyof typeof settingMessages.labels>('tone');

  const grainRoughness = GRAIN_ROUGHNESS.map((value) => ({
    value: value,
    label: settingMessages.options.effects[value],
  }));
  const grainSizes = GRAIN_SIZE.map((value) => ({
    value: value,
    label: settingMessages.options.sizes[value],
  }));
  const colorChromes = COLOR_CHROME.map((value) => ({
    value: value,
    label: settingMessages.options.effects[value],
  }));
  const colorChromeBlues = COLOR_CHROME_FX_BLUE.map((value) => ({
    value: value,
    label: settingMessages.options.effects[value],
  }));
  const whiteBalanceTypes = WHITE_BALANCES.map((value) => ({
    value,
    label: settingMessages.options.whiteBalances[value],
  }));

  const tabs: Array<{
    id: keyof SettingI18NMessages;
    label: string;
    settingTab: ReactElement<any>;
  }> = [
    {
      id: 'tone',
      label: settingMessages.labels.tone,
      settingTab: (
        <SettingTab.Tone
          highlight={recipe.settings.tone.highlight}
          onHighlightChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.tone.highlight = value as number;
              })
            );
          }}
          highlightLabel={settingMessages.labels.highlight}
          shadow={recipe.settings.tone.shadow}
          onShadowChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.tone.shadow = value as number;
              })
            );
          }}
          shadowLabel={settingMessages.labels.shadow}
        />
      ),
    },

    {
      id: 'grainRoughness',
      label: settingMessages.labels.grainRoughness,
      settingTab: (
        <SettingTab.GrainRoughness
          value={recipe.settings.grain.roughness}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.grain.roughness = value;
              })
            );
          }}
          displayValue={
            settingMessages.options.effects[recipe.settings.grain.roughness]
          }
          label={settingMessages.labels.grainRoughness}
          items={grainRoughness}
        />
      ),
    },
    {
      id: 'grainSize',
      label: settingMessages.labels.grainSize,
      settingTab: (
        <SettingTab.GrainSize
          value={recipe.settings.grain.size}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.grain.size = value;
              })
            );
          }}
          displayValue={
            settingMessages.options.sizes[recipe.settings.grain.size]
          }
          label={settingMessages.labels.grainSize}
          items={grainSizes}
        />
      ),
    },
    {
      id: 'dynamicRange',
      label: settingMessages.labels.dynamicRange,
      settingTab: (
        <SettingTab.DynamicRange
          value={recipe.settings.dRange}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.dRange = value;
              })
            );
          }}
          label={settingMessages.labels.dynamicRange}
        />
      ),
    },
    {
      id: 'colorChromeEffect',
      label: settingMessages.labels.colorChromeEffect,
      settingTab: (
        <SettingTab.ColorChrome
          value={recipe.settings.colorChrome.effect}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.colorChrome.effect = value;
              })
            );
          }}
          label={settingMessages.labels.colorChromeEffect}
          items={colorChromes}
          displayValue={
            settingMessages.options.effects[recipe.settings.colorChrome.effect]
          }
        />
      ),
    },
    {
      id: 'colorChromeFXBlue',
      label: settingMessages.labels.colorChromeFXBlue,
      settingTab: (
        <SettingTab.ColorChromeBlue
          value={recipe.settings.colorChrome.fxBlue}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.colorChrome.fxBlue = value;
              })
            );
          }}
          label={settingMessages.labels.colorChromeFXBlue}
          items={colorChromeBlues}
          displayValue={
            settingMessages.options.effects[recipe.settings.colorChrome.fxBlue]
          }
        />
      ),
    },
    {
      id: 'sharpness',
      label: settingMessages.labels.sharpness,
      settingTab: (
        <SettingTab.Sharpness
          value={recipe.settings.sharpness}
          label={settingMessages.labels.sharpness}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.sharpness = value;
                return draft;
              })
            );
          }}
        />
      ),
    },
    {
      id: 'color',
      label: settingMessages.labels.color,
      settingTab: (
        <SettingTab.Color
          value={recipe.settings.color}
          label={settingMessages.labels.color}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.color = value;
                return draft;
              })
            );
          }}
        />
      ),
    },
    {
      id: 'clarity',
      label: settingMessages.labels.clarity,
      settingTab: (
        <SettingTab.Clarity
          value={recipe.settings.clarity}
          label={settingMessages.labels.clarity}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.clarity = value;
                return draft;
              })
            );
          }}
        />
      ),
    },
    {
      id: 'isoNoiseReduction',
      label: settingMessages.labels.isoNoiseReduction,
      settingTab: (
        <SettingTab.IsoNoiseReduction
          value={recipe.settings.isoNoiseReduction}
          label={settingMessages.labels.isoNoiseReduction}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.isoNoiseReduction = value;
                return draft;
              })
            );
          }}
        />
      ),
    },
    {
      id: 'exposure',
      label: settingMessages.labels.exposure,
      settingTab: (
        <SettingTab.Exposure
          label={settingMessages.labels.exposure}
          value={recipe.settings.exposure}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.exposure = value as number;
              })
            );
          }}
        />
      ),
    },
    {
      id: 'iso',
      label: settingMessages.labels.iso,
      settingTab: (
        <SettingTab.Iso
          label="ISO"
          value={recipe.settings.iso.value}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.iso.value = value as number;
              })
            );
          }}
          isAuto={recipe.settings.iso.isAuto}
          onToggle={(isAuto) =>
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.iso.isAuto = isAuto;
              })
            )
          }
        />
      ),
    },
    {
      id: 'whiteBalance',
      label: settingMessages.labels.whiteBalance,
      settingTab: (
        <SettingTab.WhiteBalance
          types={whiteBalanceTypes}
          onTypeChange={(type) =>
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.whiteBalance.type = type;
              })
            )
          }
          whiteBanlance={recipe.settings.whiteBalance}
          onKChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.whiteBalance.k = value as number;
              })
            );
          }}
          onShiftCahnge={({ blue, red }) => {
            setRecipe(
              produce(recipe, (draft) => {
                if (!draft.settings.whiteBalance.shift) return;
                draft.settings.whiteBalance.shift.red = red;
                draft.settings.whiteBalance.shift.blue = blue;
              })
            );
          }}
        />
      ),
    },
    {
      id: 'bwAdj',
      label: settingMessages.labels.bwAdj,
      settingTab: (
        <SettingTab.BwAdjust
          label={settingMessages.labels.bwAdj}
          value={recipe.settings.bwAdj}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.bwAdj = value as number;
              })
            );
          }}
        />
      ),
    },
  ];

  const baseOptions = filters.bases.map((base) => ({
    label: base,
    value: base,
  }));

  const cameraOptions = filters.cameras.map((camera) => ({
    label: camera,
    value: camera,
  }));

  const onClickCreate = (recipe: CustomRecipe) => {
    if (!recipe.name) return onError('noName');
    if (!recipe.camera) return onError('noCamera');
    if (!recipe.base) return onError('noBase');

    const isBW = /mono|acros/i.test(recipe.base);

    onSuccess({
      ...recipe,
      _id: uuidv4(),
      colorType: isBW ? 'BW' : 'Color',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    });
    setCurrentTab('tone');
    refTab.current?.scrollTo({ left: 0, behavior: 'smooth' });
    setRecipe(getInitialCustomRecipe());
  };
  const onClickUpdate = (recipe: CustomRecipe) => {
    if (!recipe.name) return onError('noName');
    if (!recipe.camera) return onError('noCamera');
    if (!recipe.base) return onError('noBase');

    onSuccess({
      ...recipe,
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    });
  };

  const onChangeCamera: (value: any) => void = (value) =>
    setRecipe(
      produce(recipe, (draft) => {
        draft.camera = value;
        const target = cameras.find((camera) => camera.cameraType === value);
        if (target) draft.sensor = target.sensor;
      })
    );

  const onChangeBase: (value: any) => void = (value) =>
    setRecipe(
      produce(recipe, (draft) => {
        draft.base = value;
      })
    );

  const isUpdateMode = !!recipe._id;

  const onClickConfirm = isUpdateMode
    ? () => onClickUpdate(recipe)
    : () => onClickCreate(recipe);

  const title = isUpdateMode
    ? settingMessages.updateTitle
    : settingMessages.newTitle;

  const articleClassName = isUpdateMode
    ? 'card w-full bg-base-300 shadow-xl'
    : 'card w-full bg-base-100';

  const confirmIcon = isUpdateMode ? <SvgDocumentCheck /> : <SvgDocumentPlus />;

  return (
    <article className={articleClassName}>
      <div className="card-body">
        <header className="flex justify-between">
          <h2 className="card-title">{title}</h2>
          <div className="flex gap-1">
            {isUpdateMode ? null : (
              <ImportButton
                importFileMessages={importFileMessages}
                onImportSuccess={onImportSuccess}
              />
            )}
            {isUpdateMode ? null : (
              <ExportButton sendEmailMessages={sendEmailMessages} />
            )}
            <button
              className="btn btn-ghost btn-circle btn-primary btn-sm fill-warning"
              onClick={onClickConfirm}
            >
              {confirmIcon}
            </button>
          </div>
        </header>
        <CustomInput
          value={recipe.name}
          placeholder={settingMessages.placeholders.name}
          onChange={(value) =>
            setRecipe(
              produce(recipe, (draft) => {
                draft.name = value;
              })
            )
          }
        />
        <div className="w-full flex gap-1">
          <CustomSelect
            value={recipe.camera}
            placeholder={settingMessages.placeholders.camera}
            items={cameraOptions}
            onChange={onChangeCamera}
          />
          <CustomSelect
            value={recipe.base}
            placeholder={settingMessages.placeholders.base}
            items={baseOptions}
            onChange={onChangeBase}
          />
        </div>
        <TabNavigation
          tabs={tabs}
          currentTab={currentTab}
          onChangeTab={(tab) => setCurrentTab(tab)}
          ref={refTab}
        />
        <SettingTab>
          {tabs.find((tab) => tab.id === currentTab)?.settingTab ?? null}
        </SettingTab>
      </div>
    </article>
  );
};

interface ITabNavigationProps {
  tabs: Array<{
    id: keyof SettingI18NMessages;
    label: string;
    settingTab: ReactElement<any>;
  }>;
  currentTab: keyof SettingI18NMessages;
  onChangeTab: (tab: keyof SettingI18NMessages) => void;
}

const TabNavigation = forwardRef<HTMLElement, ITabNavigationProps>(
  ({ tabs, currentTab, onChangeTab }, ref) => {
    return (
      <nav
        role="tablist"
        className="w-full tabs tabs-boxed overflow-auto scroll-smooth"
        ref={ref}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === currentTab;
          const className = isActive
            ? 'tab min-w-max tab-active'
            : 'tab min-w-max';
          return (
            <a
              role="tab"
              className={className}
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
            >
              {tab.label}
            </a>
          );
        })}
      </nav>
    );
  }
);

TabNavigation.displayName = 'TabNavigation';

export default CustomEditCard;

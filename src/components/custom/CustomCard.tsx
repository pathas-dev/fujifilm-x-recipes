'use client';
import { SettingI18NLabels, SettingLabels } from '@/types/language';
import { produce } from 'immer';
import { ReactElement, useState } from 'react';
import { CustomInput, CustomSelect } from './SettingInput';
import SettingTab from './SettingTab';
import {
  COLOR_CHROME,
  COLOR_CHROME_FX_BLUE,
  D_RANGES,
  GRAIN_ROUGHNESS,
  GRAIN_SIZE,
  WHITE_BALANCES,
} from './fujiSettings';
import { SvgAirplaneSolid, SvgPencilSquareSolid } from '../icon/svgs';
import { Camera } from '@/types/api';

export type FujiSetting = {
  tone: { highlight: number; shadow: number };
  color: number;
  sharpness: number;
  isoNoiseReduction: number;
  clarity: number;
  exposure: number;
  iso: { value: number; isAuto: boolean };
  grain: {
    size: (typeof GRAIN_SIZE)[number];
    roughness: (typeof GRAIN_ROUGHNESS)[number];
  };
  colorChrome: {
    effect: (typeof COLOR_CHROME)[number];
    fxBlue: (typeof COLOR_CHROME_FX_BLUE)[number];
  };
  dRange: (typeof D_RANGES)[number];
  whiteBalance: WhiteBalance;
};

export type WhiteBalance = {
  type: (typeof WHITE_BALANCES)[number];
  shift?: { red: number; blue: number };
  k?: number;
};

export type CustomRecipe = {
  _id: string;
  name: string;
  base: string;
  camera: string;
  sensor: string;
  colorType: string;
  settings: FujiSetting;
};

export const initialCustomRecipe: CustomRecipe = {
  _id: '',
  name: '',
  base: '',
  camera: '',
  colorType: '',
  sensor: '',
  settings: {
    tone: {
      highlight: 0,
      shadow: 0,
    },
    color: 0,
    sharpness: 0,
    isoNoiseReduction: 0,
    clarity: 0,
    exposure: 0,
    iso: {
      value: 200,
      isAuto: false,
    },
    colorChrome: {
      effect: 'off',
      fxBlue: 'off',
    },
    dRange: 'AUTO',
    grain: {
      roughness: 'off',
      size: 'off',
    },
    whiteBalance: {
      type: 'autoWhitePriority',
      shift: { red: 0, blue: 0 },
      k: 5500,
    },
  },
};

interface ICustomCardProps {
  customRecipe: CustomRecipe;
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
  settingLabels: SettingLabels;
  cameras: Camera[];
  onCreateSuccess: (recipe: CustomRecipe) => void;
}

const CustomCard = ({
  customRecipe,
  filters,
  settingLabels,
  cameras,
  onCreateSuccess,
}: ICustomCardProps) => {
  const [recipe, setRecipe] = useState(customRecipe);

  const [currentTab, setCurrentTab] =
    useState<keyof typeof settingLabels.labels>('tone');

  const isUpdateMode = !!recipe._id;

  const grainRoughness = GRAIN_ROUGHNESS.map((value) => ({
    value: value,
    label: settingLabels.options.effects[value],
  }));
  const grainSizes = GRAIN_SIZE.map((value) => ({
    value: value,
    label: settingLabels.options.sizes[value],
  }));
  const colorChromes = COLOR_CHROME.map((value) => ({
    value: value,
    label: settingLabels.options.effects[value],
  }));
  const colorChromeBlues = COLOR_CHROME_FX_BLUE.map((value) => ({
    value: value,
    label: settingLabels.options.effects[value],
  }));
  const whiteBalanceTypes = WHITE_BALANCES.map((value) => ({
    value,
    label: settingLabels.options.whiteBalances[value],
  }));

  const tabs: Array<{
    id: keyof SettingI18NLabels;
    label: string;
    settingTab: ReactElement;
  }> = [
    {
      id: 'tone',
      label: settingLabels.labels.tone,
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
          highlightLabel={settingLabels.labels.highlight}
          shadow={recipe.settings.tone.shadow}
          onShadowChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.tone.shadow = value as number;
              })
            );
          }}
          shadowLabel={settingLabels.labels.shadow}
        />
      ),
    },

    {
      id: 'grainRoughness',
      label: settingLabels.labels.grainRoughness,
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
            settingLabels.options.effects[recipe.settings.grain.roughness]
          }
          label={settingLabels.labels.grainRoughness}
          items={grainRoughness}
        />
      ),
    },
    {
      id: 'grainSize',
      label: settingLabels.labels.grainSize,
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
          displayValue={settingLabels.options.sizes[recipe.settings.grain.size]}
          label={settingLabels.labels.grainSize}
          items={grainSizes}
        />
      ),
    },
    {
      id: 'dynamicRange',
      label: settingLabels.labels.dynamicRange,
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
          label={settingLabels.labels.dynamicRange}
        />
      ),
    },
    {
      id: 'colorChromeEffect',
      label: settingLabels.labels.colorChromeEffect,
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
          label={settingLabels.labels.colorChromeEffect}
          items={colorChromes}
          displayValue={
            settingLabels.options.effects[recipe.settings.colorChrome.effect]
          }
        />
      ),
    },
    {
      id: 'colorChromeFXBlue',
      label: settingLabels.labels.colorChromeFXBlue,
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
          label={settingLabels.labels.colorChromeFXBlue}
          items={colorChromeBlues}
          displayValue={
            settingLabels.options.effects[recipe.settings.colorChrome.fxBlue]
          }
        />
      ),
    },
    {
      id: 'sharpness',
      label: settingLabels.labels.sharpness,
      settingTab: (
        <SettingTab.Sharpness
          value={recipe.settings.sharpness}
          label={settingLabels.labels.sharpness}
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
      label: settingLabels.labels.color,
      settingTab: (
        <SettingTab.Color
          value={recipe.settings.color}
          label={settingLabels.labels.color}
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
      label: settingLabels.labels.clarity,
      settingTab: (
        <SettingTab.Clarity
          value={recipe.settings.clarity}
          label={settingLabels.labels.clarity}
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
      label: settingLabels.labels.isoNoiseReduction,
      settingTab: (
        <SettingTab.IsoNoiseReduction
          value={recipe.settings.isoNoiseReduction}
          label={settingLabels.labels.isoNoiseReduction}
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
      label: settingLabels.labels.exposure,
      settingTab: (
        <SettingTab.Exposure
          label={settingLabels.labels.exposure}
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
      label: settingLabels.labels.iso,
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
      label: settingLabels.labels.whiteBalance,
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
  ];

  const baseOptions = filters.bases
    .filter((v) => v.toLowerCase().indexOf('dual') < 0)
    .map((v) => ({ label: v, value: v }));

  const onClickCreate = (recipe: CustomRecipe) => {
    onCreateSuccess(recipe);
  };
  const onClickUpdate = (recipe: CustomRecipe) => {};

  return (
    <article className="card w-full min-w-96 bg-base-300 shadow-xl">
      <div className="card-body">
        <header className="flex justify-between">
          <h2 className="card-title">
            {isUpdateMode ? settingLabels.updateTitle : settingLabels.newTitle}
          </h2>
          <button
            className="btn btn-ghost btn-circle btn-primary btn-sm fill-accent"
            onClick={
              isUpdateMode
                ? () => onClickUpdate(recipe)
                : () => onClickCreate(recipe)
            }
          >
            {isUpdateMode ? <SvgPencilSquareSolid /> : <SvgAirplaneSolid />}
          </button>
        </header>
        <CustomInput
          value={recipe.name}
          placeholder={settingLabels.placeholders.name}
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
            placeholder={settingLabels.placeholders.camera}
            items={filters.cameras.map((v) => ({ label: v, value: v }))}
            onChange={(value) =>
              setRecipe(
                produce(recipe, (draft) => {
                  draft.camera = value;
                  const target = cameras.find(
                    (camera) => camera.cameraType === value
                  );
                  if (target) draft.sensor = target.sensor;
                })
              )
            }
          />
          <CustomSelect
            value={recipe.base}
            placeholder={settingLabels.placeholders.base}
            items={baseOptions}
            onChange={(value) =>
              setRecipe(
                produce(recipe, (draft) => {
                  draft.base = value;
                })
              )
            }
          />
        </div>
        <TabNavigation
          tabs={tabs}
          currentTab={currentTab}
          onChangeTab={(tab) => setCurrentTab(tab)}
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
    id: keyof SettingI18NLabels;
    label: string;
    settingTab: ReactElement;
  }>;
  currentTab: keyof SettingI18NLabels;
  onChangeTab: (tab: keyof SettingI18NLabels) => void;
}

const TabNavigation = ({
  tabs,
  currentTab,
  onChangeTab,
}: ITabNavigationProps) => {
  return (
    <nav role="tablist" className="w-full tabs tabs-boxed overflow-auto">
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
};

export default CustomCard;

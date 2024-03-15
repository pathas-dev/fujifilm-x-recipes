'use client';
import { current, produce } from 'immer';
import { ReactElement, useState } from 'react';
import {
  CustomInput,
  CustomSelect,
  CustomSlider,
  Join,
  JoinItem,
  WhiteBalanceShiftSelector,
} from './SettingInput';
import {
  CLARITIES,
  COLORS,
  EXPOSURES,
  HIGHLIGHTS,
  ISOS,
  ISO_NOISE_REDUCTION,
  SHADOWS,
  SHARPNESS,
  WHITE_BALANCE_K,
  formatExposure,
} from './fujiSettings';
import { SettingLabels } from '@/types/language';
import SettingTab from './SettingTab';

export type FujiSetting = {
  tone: { highlight: number; shadow: number };
  color: number;
  sharpness: number;
  isoNoiseReduction: number;
  clarity: number;
  exposure: number;
  iso: number;
  grain: {
    size: string;
    roughness: string;
  };
  colorChrome: {
    effect: string;
    fxBlue: string;
  };
  dRange: string;
  whiteBalance: WhiteBalance;
};

export type WhiteBalance = {
  type: string;
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

interface ICustomCardProps {
  customRecipe: CustomRecipe;
  filters: {
    cameras: string[];
    bases: string[];
    sensors: string[];
  };
  settingLabels: SettingLabels;
}
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
    iso: 200,
    colorChrome: {
      effect: 'OFF',
      fxBlue: 'OFF',
    },
    dRange: 'AUTO',
    grain: {
      roughness: 'OFF',
      size: 'OFF',
    },
    whiteBalance: {
      type: 'auto',
      shift: { red: 0, blue: 0 },
      k: 5000,
    },
  },
};

const CustomCard = ({
  customRecipe,
  filters,
  settingLabels,
}: ICustomCardProps) => {
  const [recipe, setRecipe] = useState(customRecipe);
  const [currentTab, setCurrentTab] =
    useState<keyof typeof settingLabels.labels>('tone');

  const isoMarks = ISOS.reduce((acc, cur) => {
    return { ...acc, [cur]: ' ' };
  }, {});

  const tabs: Array<{
    id: keyof typeof settingLabels.labels;
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
          label={settingLabels.labels.grainSize}
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
          label={settingLabels.labels.grainRoughness}
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
          value={recipe.settings.iso}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.iso = value as number;
              })
            );
          }}
        />
      ),
    },
    {
      id: 'whiteBalance',
      label: settingLabels.labels.whiteBalance,
      settingTab: (
        <SettingTab.WhiteBalance
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

  return (
    <article className="card w-full min-w-96">
      <div className="card-body">
        <h2 className="card-title">New Custom Recipe</h2>
        <CustomInput
          value={recipe.name}
          placeholder="Type Custom Film Simulation Name"
          onChange={(value) =>
            setRecipe(
              produce(recipe, (draft) => {
                draft.name = value;
              })
            )
          }
        />
        <div className="flex gap-1">
          <CustomSelect
            value={recipe.camera}
            placeholder="Pick Camera"
            items={filters.cameras.map((v) => ({ label: v, value: v }))}
            onChange={(value) =>
              setRecipe(
                produce(recipe, (draft) => {
                  draft.camera = value;
                })
              )
            }
          />
          <CustomSelect
            value={recipe.base}
            placeholder="Pick Base Film Simulation"
            items={filters.bases
              .filter((v) => v.toLowerCase().indexOf('dual') < 0)
              .map((v) => ({ label: v, value: v }))}
            onChange={(value) =>
              setRecipe(
                produce(recipe, (draft) => {
                  draft.base = value;
                })
              )
            }
          />
        </div>
        <div role="tablist" className="w-full tabs tabs-boxed overflow-auto">
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
                onClick={() => setCurrentTab(tab.id)}
              >
                {tab.label}
              </a>
            );
          })}
        </div>
        <SettingTab>
          {tabs.find((tab) => tab.id === currentTab)?.settingTab ?? null}
        </SettingTab>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">Apply</button>
        </div>
      </div>
    </article>
  );
};

export default CustomCard;

'use client';
import { produce } from 'immer';
import { useState } from 'react';
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

export type FujiSetting = {
  highlight?: number;
  shadow?: number;
  color?: number;
  sharpness?: number;
  isoNoiseReduction?: number;
  clarity?: number;
  exposure?: number;
  whiteBalance?: string;
  WhiteBalanceShift?: { red: number; blue: number };
  whiteBalanceK?: number;
  iso?: number;
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
}

const asJoinItem = (numbers: number[]): JoinItem[] =>
  numbers.map((v) => ({ label: v.toString(), value: v }));

const highlights = asJoinItem(HIGHLIGHTS);
const shadows = asJoinItem(SHADOWS);
const colors = asJoinItem(COLORS);
const sharpness = asJoinItem(SHARPNESS);
const isoNoiseReductions = asJoinItem(ISO_NOISE_REDUCTION);
const clarities = asJoinItem(CLARITIES);
const exposures = EXPOSURES.map(({ value, quotient, remainder }) => ({
  label: remainder === 0 ? String(quotient) : `${quotient} ${remainder} ⁄3`,
  value,
}));

export const initialCustomRecipe: CustomRecipe = {
  _id: '',
  name: '',
  base: '',
  camera: '',
  colorType: '',
  sensor: '',
  settings: {
    highlight: 0,
    shadow: 0,
    color: 0,
    sharpness: 0,
    isoNoiseReduction: 0,
    clarity: 0,
    exposure: 0,
    iso: 200,
    whiteBalance: 'auto',
    WhiteBalanceShift: { red: 0, blue: 0 },
  },
};

const CustomCard = ({ customRecipe, filters }: ICustomCardProps) => {
  const [recipe, setRecipe] = useState(customRecipe);
  const exposureMarks = EXPOSURES.reduce((acc, { value }) => {
    if (value % 3 !== 0) return acc;
    return { ...acc, [value]: formatExposure(value) };
  }, {});

  const isoMarks = ISOS.reduce((acc, cur) => {
    return { ...acc, [cur]: ' ' };
  }, {});
  return (
    <article className="card w-full min-w-96 glass">
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
        highlights
        <CustomSlider
          included={false}
          label="highlights"
          min={highlights[0].value}
          max={highlights[highlights.length - 1].value}
          marks={{ 0: 0, '-2': -2, 4: 4 }}
          step={0.5}
          value={recipe.settings.highlight}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.highlight = value as number;
              })
            );
          }}
        />
        shadows
        <CustomSlider
          included={false}
          label="shadow"
          min={shadows[0].value}
          max={shadows[shadows.length - 1].value}
          marks={{ 0: 0, '-2': -2, 4: 4 }}
          step={0.5}
          value={recipe.settings.shadow}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.shadow = value as number;
              })
            );
          }}
        />
        color
        <Join
          items={colors}
          onClickRadio={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.color = value;
                return draft;
              })
            );
          }}
          value={recipe.settings.color}
          label="color"
        />
        sharpness
        <Join
          items={sharpness}
          onClickRadio={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.sharpness = value;
                return draft;
              })
            );
          }}
          value={recipe.settings.sharpness}
          label="sharpness"
        />
        isoNoiseReduction
        <Join
          items={isoNoiseReductions}
          onClickRadio={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.isoNoiseReduction = value;
                return draft;
              })
            );
          }}
          value={recipe.settings.isoNoiseReduction}
          label="isoNoiseReduction"
        />
        clarity
        <Join
          items={clarities}
          onClickRadio={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.clarity = value;
                return draft;
              })
            );
          }}
          value={recipe.settings.clarity}
          label="clarity"
        />
        EXPOSURE
        <CustomSlider
          included={false}
          label="exposure"
          min={exposures[0].value}
          max={exposures[exposures.length - 1].value}
          marks={exposureMarks}
          step={1}
          value={recipe.settings.exposure}
          displayValue={formatExposure(recipe.settings.exposure ?? 0)}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.exposure = value as number;
              })
            );
          }}
        />
        K
        <CustomSlider
          label="K"
          min={WHITE_BALANCE_K.min}
          max={WHITE_BALANCE_K.max}
          marks={{
            [WHITE_BALANCE_K.min]: `${WHITE_BALANCE_K.min}K`,
            [WHITE_BALANCE_K.max]: `${WHITE_BALANCE_K.max}K`,
          }}
          classNames={{ track: 'bg-k-low', rail: 'bg-k-high' }}
          step={WHITE_BALANCE_K.step}
          value={recipe.settings.whiteBalanceK}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.whiteBalanceK = value as number;
              })
            );
          }}
        />
        ISOS
        <CustomSlider
          label="ISO"
          included={false}
          min={ISOS[0]}
          max={ISOS[ISOS.length - 1]}
          marks={isoMarks}
          step={null}
          value={recipe.settings.iso}
          onChange={(value) => {
            setRecipe(
              produce(recipe, (draft) => {
                draft.settings.iso = value as number;
              })
            );
          }}
        />
        <WhiteBalanceShiftSelector
          whiteBalance={
            recipe.settings.WhiteBalanceShift ?? { red: 0, blue: 0 }
          }
          onClick={({ blue, red }) => {
            setRecipe(
              produce(recipe, (draft) => {
                if (!draft.settings.WhiteBalanceShift) return;
                draft.settings.WhiteBalanceShift.red = red;
                draft.settings.WhiteBalanceShift.blue = blue;
              })
            );
          }}
        />
        <div className="card-actions justify-end">
          <button className="btn btn-primary">Apply</button>
        </div>
      </div>
    </article>
  );
};

export default CustomCard;

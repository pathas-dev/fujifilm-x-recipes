import { ReactElement } from 'react';
import { WhiteBalance } from './CustomCard';
import {
  CustomSelect,
  CustomSlider,
  Join,
  JoinItem,
  WhiteBalanceShiftSelector,
} from './SettingInput';
import {
  CLARITIES,
  COLORS,
  D_RANGES,
  EXPOSURES,
  HIGHLIGHTS,
  ISOS,
  ISO_NOISE_REDUCTION,
  SHADOWS,
  SHARPNESS,
  WHITE_BALANCES,
  WHITE_BALANCE_K,
  formatExposure,
} from './fujiSettings';

interface CustomFormProps {
  children: ReactElement | null | Array<ReactElement | null>;
}

const SettingTab = ({ children }: CustomFormProps) => {
  return (
    <article className="px-5 py-7 bg-base-200 flex-1 justify-center rounded-lg">
      {children}
    </article>
  );
};

export const asJoinItem = (
  values: Array<number | string> | typeof D_RANGES
): JoinItem[] => values.map((v) => ({ label: v.toString(), value: v }));

const highlights = asJoinItem(HIGHLIGHTS);
const shadows = asJoinItem(SHADOWS);
const colors = asJoinItem(COLORS);
const sharpnesses = asJoinItem(SHARPNESS);
const isoNoiseReductions = asJoinItem(ISO_NOISE_REDUCTION);
const clarities = asJoinItem(CLARITIES);
const dRanges = asJoinItem(D_RANGES);

const exposures = EXPOSURES.map(({ value, quotient, remainder }) => ({
  label: remainder === 0 ? String(quotient) : `${quotient} ${remainder} ⁄3`,
  value,
}));

interface IToneProps {
  highlight: number;
  onHighlightChange: (value: number) => void;
  highlightLabel: string;
  shadow: number;
  onShadowChange: (value: number) => void;
  shadowLabel: string;
}

const Tone = ({
  highlight,
  onHighlightChange,
  highlightLabel,
  shadow,
  onShadowChange,
  shadowLabel,
}: IToneProps) => {
  return (
    <div className="w-full">
      <CustomSlider
        included={false}
        label={highlightLabel}
        min={highlights[0].value}
        max={highlights[highlights.length - 1].value}
        marks={{ 0: 0, '-2': -2, 4: 4 }}
        step={0.5}
        value={highlight}
        onChange={(value) => onHighlightChange(value as number)}
      />
      <CustomSlider
        included={false}
        label={shadowLabel}
        min={shadows[0].value}
        max={shadows[shadows.length - 1].value}
        marks={{ 0: 0, '-2': -2, 4: 4 }}
        step={0.5}
        value={shadow}
        onChange={(value) => onShadowChange(value as number)}
      />
    </div>
  );
};

interface IJoinTabProps {
  value: any;
  onChange: (value: any) => void;
  label: string;
  items?: JoinItem[];
  displayValue?: string;
}

const GrainSize = ({
  value,
  onChange,
  label,
  items = [],
  displayValue,
}: IJoinTabProps) => {
  return (
    <Join
      items={items}
      displayValue={displayValue}
      onClickRadio={onChange}
      value={value}
      label={label}
    />
  );
};

const GrainRoughness = ({
  value,
  onChange,
  label,
  items = [],
  displayValue,
}: IJoinTabProps) => {
  return (
    <Join
      items={items}
      displayValue={displayValue}
      onClickRadio={onChange}
      value={value}
      label={label}
    />
  );
};

const DynamicRange = ({ value, onChange, label }: IJoinTabProps) => {
  return (
    <Join items={dRanges} onClickRadio={onChange} value={value} label={label} />
  );
};

const ColorChrome = ({
  value,
  onChange,
  label,
  items = [],
  displayValue,
}: IJoinTabProps) => {
  return (
    <Join
      items={items}
      onClickRadio={onChange}
      value={value}
      label={label}
      displayValue={displayValue}
    />
  );
};

const ColorChromeBlue = ({
  value,
  onChange,
  label,
  items = [],
  displayValue,
}: IJoinTabProps) => {
  return (
    <Join
      items={items}
      onClickRadio={onChange}
      value={value}
      label={label}
      displayValue={displayValue}
    />
  );
};

const Sharpness = ({ value, onChange, label }: IJoinTabProps) => {
  return (
    <Join
      items={sharpnesses}
      onClickRadio={onChange}
      value={value}
      label={label}
    />
  );
};

const Color = ({ value, onChange, label }: IJoinTabProps) => {
  return (
    <Join items={colors} onClickRadio={onChange} value={value} label={label} />
  );
};
const Clarity = ({ value, onChange, label }: IJoinTabProps) => {
  return (
    <Join
      items={clarities}
      onClickRadio={onChange}
      value={value}
      label={label}
    />
  );
};
const IsoNoiseReduction = ({ value, onChange, label }: IJoinTabProps) => {
  return (
    <Join
      items={isoNoiseReductions}
      onClickRadio={onChange}
      value={value}
      label={label}
    />
  );
};

interface IsoProps extends IJoinTabProps {
  isAuto: boolean;
  onToggle: (isAuto: boolean) => void;
}

const Iso = ({ label, onChange, value, isAuto, onToggle }: IsoProps) => {
  const isoMarks = ISOS.reduce((acc, cur) => {
    const points = [200, 6400, 12800, 25600, 51200];

    if (points.includes(cur))
      return {
        ...acc,
        [cur]: cur,
      };

    return { ...acc, [cur]: ' ' };
  }, {});
  return (
    <div className="w-full relative">
      <div className="form-control absolute right-0 -top-1">
        <label className="label cursor-pointer">
          <span className="label-text mr-2">AUTO</span>
          <input
            type="checkbox"
            className="toggle toggle-sm"
            checked={isAuto}
            onChange={({ target: { checked } }) => {
              onToggle(checked);
            }}
          />
        </label>
      </div>
      <CustomSlider
        label={label}
        included={false}
        min={ISOS[0]}
        max={ISOS[ISOS.length - 1]}
        marks={isoMarks}
        step={null}
        value={value}
        onChange={(value) => {
          onChange(value as number);
        }}
        onPlusClick={() => {
          const nextIndex = ISOS.indexOf(value) + 1;
          if (nextIndex >= ISOS.length) return;
          onChange(ISOS[nextIndex]);
        }}
        onMinusClick={() => {
          const prevIndex = ISOS.indexOf(value) - 1;
          if (prevIndex < 0) return;
          onChange(ISOS[prevIndex]);
        }}
      />
    </div>
  );
};

const Exposure = ({ label, onChange, value }: IJoinTabProps) => {
  const exposureMarks = EXPOSURES.reduce((acc, { value }) => {
    if (value % 3 !== 0) return acc;
    return { ...acc, [value]: formatExposure(value) };
  }, {});

  return (
    <CustomSlider
      included={false}
      label={label}
      min={exposures[0].value}
      max={exposures[exposures.length - 1].value}
      marks={exposureMarks}
      step={1}
      value={value}
      displayValue={formatExposure(value ?? 0)}
      onChange={(value) => onChange(value as number)}
    />
  );
};

interface IWhiteBalanceSettingProps {
  whiteBanlance: WhiteBalance;
  types: { label: string; value: (typeof WHITE_BALANCES)[number] }[];
  onTypeChange: (value: (typeof WHITE_BALANCES)[number]) => void;
  onKChange: (value: number) => void;
  onShiftCahnge: (params: { red: number; blue: number }) => void;
}

const WhiteBalanceTab = ({
  whiteBanlance,
  onKChange,
  onShiftCahnge,
  onTypeChange,
  types,
}: IWhiteBalanceSettingProps) => {
  return (
    <div>
      <div className="mb-3">
        <CustomSelect
          value={whiteBanlance.type}
          onChange={onTypeChange}
          items={types}
          placeholder=""
        />
      </div>
      {whiteBanlance.type === 'k' && (
        <div className="w-11/12 mx-auto">
          <CustomSlider
            label="K"
            min={WHITE_BALANCE_K.min}
            max={WHITE_BALANCE_K.max}
            marks={{
              [WHITE_BALANCE_K.min]: `${WHITE_BALANCE_K.min}K`,
              5500: '5500K',
              [WHITE_BALANCE_K.max]: `${WHITE_BALANCE_K.max}K`,
            }}
            style={{ marginBottom: '3rem' }}
            classNames={{ track: 'bg-k-low', rail: 'bg-k-high' }}
            step={WHITE_BALANCE_K.step}
            value={whiteBanlance.k}
            onChange={(value) => onKChange(value as number)}
          />
        </div>
      )}
      <WhiteBalanceShiftSelector
        shift={whiteBanlance.shift ?? { red: 0, blue: 0 }}
        onClick={onShiftCahnge}
      />
    </div>
  );
};

SettingTab.Tone = Tone;
SettingTab.GrainSize = GrainSize;
SettingTab.GrainRoughness = GrainRoughness;
SettingTab.DynamicRange = DynamicRange;
SettingTab.ColorChrome = ColorChrome;
SettingTab.ColorChromeBlue = ColorChromeBlue;
SettingTab.Sharpness = Sharpness;
SettingTab.Color = Color;
SettingTab.Clarity = Clarity;
SettingTab.IsoNoiseReduction = IsoNoiseReduction;
SettingTab.Iso = Iso;
SettingTab.Exposure = Exposure;
SettingTab.WhiteBalance = WhiteBalanceTab;

export default SettingTab;

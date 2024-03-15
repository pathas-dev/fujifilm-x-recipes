import { ReactElement } from 'react';
import {
  CustomSlider,
  Join,
  JoinItem,
  WhiteBalanceShiftSelector,
} from './SettingInput';
import {
  CLARITIES,
  COLORS,
  COLOR_CHROME,
  COLOR_CHROME_FX_BLUE,
  D_RANGES,
  EXPOSURES,
  GRAIN_ROUGHNESS,
  GRAIN_SIZE,
  HIGHLIGHTS,
  ISOS,
  ISO_NOISE_REDUCTION,
  SHADOWS,
  SHARPNESS,
  WHITE_BALANCE_K,
  formatExposure,
} from './fujiSettings';
import { WhiteBalance } from './CustomCard';

interface CustomFormProps {
  children: ReactElement | null;
}

const SettingTab = ({ children }: CustomFormProps) => {
  return <article className="p-5 bg-base-300 rounded-md">{children}</article>;
};

const asJoinItem = (values: Array<number | string>): JoinItem[] =>
  values.map((v) => ({ label: v.toString(), value: v }));

const highlights = asJoinItem(HIGHLIGHTS);
const shadows = asJoinItem(SHADOWS);
const colors = asJoinItem(COLORS);
const sharpnesses = asJoinItem(SHARPNESS);
const isoNoiseReductions = asJoinItem(ISO_NOISE_REDUCTION);
const clarities = asJoinItem(CLARITIES);
const dRanges = asJoinItem(D_RANGES);
const grainRoughness = asJoinItem(GRAIN_ROUGHNESS);
const grainSizes = asJoinItem(GRAIN_SIZE);
const colorChromes = asJoinItem(COLOR_CHROME);
const colorChromeBlues = asJoinItem(COLOR_CHROME_FX_BLUE);

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
    <div>
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
}

const GrainSize = ({ value, onChange, label }: IJoinTabProps) => {
  return (
    <Join
      items={grainSizes}
      onClickRadio={onChange}
      value={value}
      label={label}
    />
  );
};

const GrainRoughness = ({ value, onChange, label }: IJoinTabProps) => {
  return (
    <Join
      items={grainRoughness}
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

const ColorChrome = ({ value, onChange, label }: IJoinTabProps) => {
  return (
    <Join
      items={colorChromes}
      onClickRadio={onChange}
      value={value}
      label={label}
    />
  );
};

const ColorChromeBlue = ({ value, onChange, label }: IJoinTabProps) => {
  return (
    <Join
      items={colorChromeBlues}
      onClickRadio={onChange}
      value={value}
      label={label}
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
const Iso = ({ label, onChange, value }: IJoinTabProps) => {
  const isoMarks = ISOS.reduce((acc, cur) => {
    return { ...acc, [cur]: ' ' };
  }, {});
  return (
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
    />
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
  onKChange: (value: number) => void;
  onShiftCahnge: (params: { red: number; blue: number }) => void;
}

const WhiteBalance = ({
  whiteBanlance,
  onKChange,
  onShiftCahnge,
}: IWhiteBalanceSettingProps) => {
  return (
    <div>
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
        value={whiteBanlance.k}
        onChange={(value) => onKChange(value as number)}
      />
      <WhiteBalanceShiftSelector
        whiteBalance={whiteBanlance.shift ?? { red: 0, blue: 0 }}
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
SettingTab.WhiteBalance = WhiteBalance;

export default SettingTab;

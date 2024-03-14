import _range from 'lodash/range';

export type CustomRecipe = {
  _id: string;
  base: string;
  camera: string;
  sensor: string;
  colorType: string;
};

interface ICustomCardProps {
  customRecipe: CustomRecipe;
}

const HIGHLIGHTS: JoinItem[] = _range(-2, 5, 0.5).map((v) => ({
  label: String(v),
  value: v,
}));

const SHADOWS: JoinItem[] = _range(-2, 6, 0.5).map((v) => ({
  label: String(v),
  value: v,
}));

const EXPOSURES: JoinItem[] = _range(-15, 16, 1).map((v) => {
  const abs = Math.abs(v);
  let quotient = Math.floor(abs / 3);
  if (v < 0) quotient *= -1;

  const remainder = Math.abs(v % 3);

  return {
    label: remainder === 0 ? String(quotient) : `${quotient} ${remainder} ⁄3`,
    value: v,
  };
});

const COLORS: JoinItem[] = _range(-4, 5, 1).map((v) => ({
  label: String(v),
  value: v,
}));
const SHARPNESS: JoinItem[] = _range(-4, 5, 1).map((v) => ({
  label: String(v),
  value: v,
}));
const ISO_NOISE_REDUCTION: JoinItem[] = _range(-4, 5, 1).map((v) => ({
  label: String(v),
  value: v,
}));

const CLARITIES: JoinItem[] = _range(-5, 6, 1).map((v) => ({
  label: String(v),
  value: v,
}));

const D_RANGES = ['AUTO', '100%', '200%', '400%'];

const GRAIN_ROUGHNESS = ['OFF', 'STRONG', 'WEAK'];
const GRAIN_SIZE = ['LARGE', 'SMALL'];

const COLOR_CHROME = ['OFF', 'STRONG', 'WEAK'];
const COLOR_CHROME_FX_BLUE = ['OFF', 'STRONG', 'WEAK'];

const COLOR_TEMPERATURE = [2500, 10000, 10]; // 10 step

const WHITE_BALANCE_SHIFT = _range(0, 19, 1).map((y) =>
  _range(0, 20, 1).map((x) => [x, y])
);

const ISOS = [
  80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000,
  2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600, 32000,
  40000, 51200,
];

const WHITE_BALANCES = [
  'AUTO WHITE PRIORITY',
  'AUTO',
  'AUTO AMBIENCE PRIORITY',
  'MEASURE',
  'K',
  'SUNLIGHT',
  'SHADE',
  'DAYLIGHT',
  'WARM WHITE',
  'COOL WHITE',
  'INCANDESCENT',
  'UNDERWATER',
];

const WHITE_BALANCE_SHIFT_COLORS = [
  ['#229F7B', '#3B84C5', '#76318E'],
  ['#1CA16F', '#4A92CE', '#852A8C'],
  ['#1DAE65E', '#66A4D8', '#9A1887'],
  ['#2FB15A', '#8BBAE4', '#AD0E77'],
  ['#44B34C', '#B4D2EF', '#BB0E62'],
  ['#53B43E', '#D9E7F6', '#C8124D'],
  ['#60B632', '#EFF3FA', '#D5133A'],
  ['#68B82D', '#FAF8FB', '#DF142B'],
  ['#6AB82C', '#FBF9FC', '#E7141F'],
  ['#6AB82C', '#FFFFFF', '#E71C1D'], //10
  ['#6DB92B', '#FBF9FC', '#E7261D'],
  ['#6FBA2B', '#FBFAFC', '#E72E1A'],
  ['#75BB29', '#FBF8F5', '#E83E19'], //13
  ['#7BBD26', '#F7F5DE', '#E94A1A'],
  ['#87C122', '#F2F1B5', '#EA581A'],
  ['#8FC322', '#EEEF8E', '#EC691A'],
  ['#93C524', '#ECEB69', '#EE791C'],
  ['#95C525', '#ECEA50', '#F1881C'],
  ['#95C526', '#ECE941', '#F2921B'],
];

const CustomCard = ({ customRecipe }: ICustomCardProps) => {
  return (
    <article className="card w-full min-w-96 glass">
      <div className="card-body">
        <h2 className="card-title">Life hack</h2>
        highlights
        <Join items={HIGHLIGHTS} onClickRadio={() => {}} value={5} />
        shadows
        <Join items={SHADOWS} onClickRadio={() => {}} value={5} />
        color
        <Join items={COLORS} onClickRadio={() => {}} value={5} />
        sharpness
        <Join items={SHARPNESS} onClickRadio={() => {}} value={5} />
        isoNoiseReduction
        <Join items={ISO_NOISE_REDUCTION} onClickRadio={() => {}} value={5} />
        clarity
        <Join items={CLARITIES} onClickRadio={() => {}} value={5} />
        EXPOSURES
        <Join items={EXPOSURES} onClickRadio={() => {}} value={5} />
        <p>How to park your car at your garage?</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">Learn now!</button>
        </div>
      </div>
      <div className="border p-0 border-black w-fit flex flex-col">
        {WHITE_BALANCE_SHIFT.map((row, index) => {
          const [from, via, to] = WHITE_BALANCE_SHIFT_COLORS[index];

          const className = `inline-block h-4 bg-clip-text text-transparent bg-gradient-to-r from-[${from}] via-[${via}]  to-[${to}] `;
          const getClassName = () =>
            `inline-block h-4 bg-clip-text text-transparent bg-gradient-to-r from-[${from}] via-[${via}]  to-[${to}] `;

          return (
            <span key={index} className={getClassName()}>
              {row.map(([x, y]) => {
                return (
                  <button
                    key={x + y}
                    className="h-4 w-4 text-xs align-top leading-4"
                  >
                    ■
                  </button>
                );
              })}
            </span>
          );
        })}
      </div>
    </article>
  );
};

type JoinItem = {
  label: string;
  value: any;
};

interface IJoinProps {
  items: JoinItem[];
  value: any;
  onClickRadio: (params: { checked: boolean; item: JoinItem }) => void;
}

const Join = ({ items, onClickRadio, value }: IJoinProps) => (
  <div className="join">
    {items.map((item) => (
      <input
        key={item.value}
        className="join-item btn btn-sm"
        type="radio"
        name="options"
        aria-label={item.label}
        checked={value === item.value}
        onChange={({ target: { checked } }) => {
          onClickRadio({ checked, item });
        }}
      />
    ))}
  </div>
);

interface IRangeProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

const Range = ({ max, min, onChange, value }: IRangeProps) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={({ target: { value } }) => onChange(Number(value))}
      className="range"
    />
  );
};

export default CustomCard;

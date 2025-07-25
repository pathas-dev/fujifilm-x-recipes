import _range from 'lodash/range';

export const HIGHLIGHTS = _range(-2, 4 + 0.5, 0.5);

export const SHADOWS = _range(-2, 4 + 0.5, 0.5);

export const BW_ADJ = _range(-9, 9 + 1, 1);

export const EXPOSURES = _range(-15, 15 + 1, 1).map((value) => {
  const abs = Math.abs(value);
  let quotient = Math.floor(abs / 3);
  if (value < 0) quotient *= -1;

  const remainder = Math.abs(value % 3);

  return { value, remainder, quotient };
});

export const formatExposure = (value: number) => {
  const abs = Math.abs(value);
  let quotient = Math.floor(abs / 3);

  let prefix = '';
  if (value > 0) prefix = '+';
  else if (value < 0) prefix = '-';

  const remainder = Math.abs(value % 3);

  if (quotient === 0 && remainder > 0) return `${prefix}${remainder} ⁄3`;

  return remainder === 0
    ? `${prefix}${quotient}`
    : `${prefix}${quotient} ${remainder} ⁄3`;
};

export const COLORS = _range(-4, 4 + 1, 1);
export const SHARPNESS = _range(-4, 4 + 1, 1);
export const ISO_NOISE_REDUCTION = _range(-4, 4 + 1, 1);

export const CLARITIES = _range(-5, 5 + 1, 1);

export const D_RANGES = ['AUTO', '100%', '200%', '400%'] as const;

export const GRAIN_ROUGHNESS = ['off', 'weak', 'strong'] as const;
export const GRAIN_SIZE = ['off', 'small', 'large'] as const;

export const COLOR_CHROME = ['off', 'weak', 'strong'] as const;
export const COLOR_CHROME_FX_BLUE = ['off', 'weak', 'strong'] as const;

export const WHITE_BALANCE_K = { min: 2500, max: 10000, step: 10 };

export const WHITE_BALANCE_SHIFT = _range(0, 18 + 1, 1).map((y) =>
  _range(0, 18 + 1, 1).map((x) => [x, y])
);

export const ISOS = [
  80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000,
  2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600, 32000,
  40000, 51200,
];

export const WHITE_BALANCES = [
  'autoWhitePriority',
  'auto',
  'autoAmbiencePriority',
  'measure',
  'k',
  'sunlight',
  'shade',
  'daylight',
  'warmWhite',
  'coolWhite',
  'incandescent',
  'underwater',
] as const;

export const WHITE_BALANCE_SHIFT_COLORS = [
  ['#229F7B', '#3B84C5', '#76318E'],
  ['#1CA16F', '#4A92CE', '#852A8C'],
  ['#1DAE65', '#66A4D8', '#9A1887'],
  ['#2FB15A', '#8BBAE4', '#AD0E77'],
  ['#44B34C', '#B4D2EF', '#BB0E62'],
  ['#53B43E', '#D9E7F6', '#C8124D'],
  ['#60B632', '#EFF3FA', '#D5133A'],
  ['#68B82D', '#FAF8FB', '#DF142B'],
  ['#6AB82C', '#FBF9FC', '#E7141F'],
  ['#6AB82C', '#FFFFFF', '#E71C1D'],
  ['#6DB92B', '#FBF9FC', '#E7261D'],
  ['#6FBA2B', '#FBFAFC', '#E72E1A'],
  ['#75BB29', '#FBF8F5', '#E83E19'],
  ['#7BBD26', '#F7F5DE', '#E94A1A'],
  ['#87C122', '#F2F1B5', '#EA581A'],
  ['#8FC322', '#EEEF8E', '#EC691A'],
  ['#93C524', '#ECEB69', '#EE791C'],
  ['#95C525', '#ECEA50', '#F1881C'],
  ['#95C526', '#ECE941', '#F2921B'],
];
export const whiteBalnceColorMap: { [key: string]: string } = {
  '18': 'from-[#229F7B] via-[#3B84C5] to-[#76318E]',
  '17': 'from-[#1CA16F] via-[#4A92CE] to-[#852A8C]',
  '16': 'from-[#1DAE65] via-[#66A4D8] to-[#9A1887]',
  '15': 'from-[#2FB15A] via-[#8BBAE4] to-[#AD0E77]',
  '14': 'from-[#44B34C] via-[#B4D2EF] to-[#BB0E62]',
  '13': 'from-[#53B43E] via-[#D9E7F6] to-[#C8124D]',
  '12': 'from-[#60B632] via-[#EFF3FA] to-[#D5133A]',
  '11': 'from-[#68B82D] via-[#FAF8FB] to-[#DF142B]',
  '10': 'from-[#6AB82C] via-[#FBF9FC] to-[#E7141F]',
  '9': 'from-[#6AB82C] via-[#FFFFFF] to-[#E71C1D]',
  '8': 'from-[#6DB92B] via-[#FBF9FC] to-[#E7261D]',
  '7': 'from-[#6FBA2B] via-[#FBFAFC] to-[#E72E1A]',
  '6': 'from-[#75BB29] via-[#FBF8F5] to-[#E83E19]',
  '5': 'from-[#7BBD26] via-[#F7F5DE] to-[#E94A1A]',
  '4': 'from-[#87C122] via-[#F2F1B5] to-[#EA581A]',
  '3': 'from-[#8FC322] via-[#EEEF8E] to-[#EC691A]',
  '2': 'from-[#93C524] via-[#ECEB69] to-[#EE791C]',
  '1': 'from-[#95C525] via-[#ECEA50] to-[#F1881C]',
  '0': 'from-[#95C526] via-[#ECE941] to-[#F2921B]',
};

export const toStringWithSign = (value: number) => {
  if (value === 0) return '0';

  if (value > 0) return '+' + value.toString();

  return value.toString();
};

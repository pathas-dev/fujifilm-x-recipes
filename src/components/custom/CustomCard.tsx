'use client';
import 'rc-slider/assets/index.css';
import { useState } from 'react';
import {
  CLARITIES,
  COLORS,
  EXPOSURES,
  HIGHLIGHTS,
  ISO_NOISE_REDUCTION,
  SHADOWS,
  SHARPNESS,
  WHITE_BALANCE_SHIFT,
  whiteBalnceColorMap,
} from './fujiSettings';
import Slider from 'rc-slider';

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

const asJoinItem = (numbers: number[]): JoinItem[] =>
  numbers.map((v) => ({ label: v.toString(), value: v }));

const highlights = asJoinItem(HIGHLIGHTS);
const shadows = asJoinItem(SHADOWS);
const colors = asJoinItem(COLORS);
const sharpness = asJoinItem(SHARPNESS);
const isoNoiseReduction = asJoinItem(ISO_NOISE_REDUCTION);
const clarities = asJoinItem(CLARITIES);
const exposures = EXPOSURES.map(({ value, quotient, remainder }) => ({
  label: remainder === 0 ? String(quotient) : `${quotient} ${remainder} ⁄3`,
  value,
}));

const CustomCard = ({ customRecipe }: ICustomCardProps) => {
  return (
    <article className="card w-full min-w-96 glass">
      <div className="card-body">
        <h2 className="card-title">Life hack</h2>
        highlights
        <Join items={highlights} onClickRadio={() => {}} value={5} />
        shadows
        <Join items={shadows} onClickRadio={() => {}} value={5} />
        color
        <Join items={colors} onClickRadio={() => {}} value={5} />
        sharpness
        <Join items={sharpness} onClickRadio={() => {}} value={3} />
        isoNoiseReduction
        <Join items={isoNoiseReduction} onClickRadio={() => {}} value={5} />
        clarity
        <Join items={clarities} onClickRadio={() => {}} value={5} />
        EXPOSURES
        <Join items={exposures} onClickRadio={() => {}} value={5} />
        <p>How to park your car at your garage?</p>
        <div className="card-actions justify-end bg-primary">
          <button className="btn btn-primary">Learn now!</button>
        </div>
        <Slider
          included={false}
          className="[&>*:nth-child(1)]:bg-primary [&>*:nth-child(3)]:border-secondary [&>*:nth-child(4)>span]:text-content-base"
          marks={{ 1: <div>3353</div> }}
          onChange={(value) => {
            console.log(value);
          }}
        />
        {/* <input type="range" min={0} max="100" value="40" className="range" /> */}
      </div>
      <div className="border p-0 border-black w-fit flex flex-col">
        {WHITE_BALANCE_SHIFT.map((row, index) => {
          const rowColor = whiteBalnceColorMap[index.toString()];
          const className = `bg-clip-text text-transparent bg-gradient-to-r inline-block h-4 ${rowColor} `;

          return (
            <span key={index} className={className}>
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

export type JoinItem = {
  label: string;
  value: any;
};

interface IJoinProps {
  items: JoinItem[];
  value: any;
  onClickRadio: (params: { checked: boolean; item: JoinItem }) => void;
}

const Join = ({ items, onClickRadio, value }: IJoinProps) => {
  const initialIndex = items.findIndex((item) => item.value === value);
  console.log('🚀 ~ Join ~ initialIndex:', initialIndex);

  const [top, setTop] = useState(initialIndex * 32);

  const onClickPlus = () => {
    setTop((prev) => prev + 32);
  };

  const onClickMinus = () => {
    setTop((prev) => prev - 32);
  };

  return (
    <div>
      <button onClick={onClickMinus}> -</button>
      <div className="h-8 overflow-hidden relative">
        <div
          className="join join-vertical rounded-none absolute transition-all"
          style={{ bottom: top }}
        >
          {items.map((item) => (
            <input
              key={item.value}
              className="join-item btn btn-sm"
              type="radio"
              style={{ margin: 0 }}
              name="options"
              aria-label={item.label}
              checked={value === item.value}
              onChange={({ target: { checked } }) => {
                onClickRadio({ checked, item });
              }}
            />
          ))}
        </div>
      </div>
      <button onClick={onClickPlus}>+</button>
    </div>
  );
};

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

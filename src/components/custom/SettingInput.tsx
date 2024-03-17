import Slider, { SliderProps } from 'rc-slider';
import { WHITE_BALANCE_SHIFT, whiteBalnceColorMap } from './fujiSettings';
import { SvgMinusMicro, SvgPlusMicro } from '../icon/svgs';

interface ICustomInputProps {
  placeholder: string;
  value: any;
  onChange: (value: any) => void;
}

export const CustomInput = ({
  placeholder,
  value,
  onChange,
}: ICustomInputProps) => {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      className="input input-bordered input-primary input-sm w-full"
      onChange={({ target: { value } }) => onChange(value)}
    />
  );
};

interface ICustomSelectProps {
  placeholder: string;
  items: JoinItem[];
  value: any;
  onChange: (value: any) => void;
}

export const CustomSelect = ({
  placeholder,
  items,
  value,
  onChange,
}: ICustomSelectProps) => {
  return (
    <label className="form-control w-full">
      <select
        className="w-full select select-bordered select-secondary select-sm"
        onChange={({ target: { value } }) => {
          onChange(value);
        }}
        value={value}
      >
        {placeholder && (
          <option disabled value="">
            {placeholder}
          </option>
        )}
        {items.map((item) => (
          <option value={item.value} key={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
};

interface ISliderProps extends SliderProps {
  label: string;
  displayValue?: string;
  onPlusClick?: () => void;
  onMinusClick?: () => void;
}

export const CustomSlider = (props: ISliderProps) => {
  const onPlusClick = () => {
    if (
      !!props.onChange &&
      !isNaN(props.value as number) &&
      props.step &&
      (props.value as number) < (props.max as number)
    )
      props.onChange((props.value as number) + props.step);
  };

  const onMinusClick = () => {
    if (
      !!props.onChange &&
      !isNaN(props.value as number) &&
      props.step &&
      (props.value as number) > (props.min as number)
    )
      props.onChange((props.value as number) - props.step);
  };

  return (
    <article className="w-full flex flex-col justify-center items-center gap-2 pb-5">
      <div className="flex flex-col justify-center items-center">
        <h2 className="font-medium">{props.label}</h2>
        <div className="flex my-2 gap-2 items-center">
          <button
            className="btn btn-ghost flex btn-xs"
            onClick={
              !!props.onMinusClick
                ? () => {
                    props.onMinusClick?.();
                  }
                : onMinusClick
            }
          >
            <SvgMinusMicro />
          </button>
          <p className="text-lg w-16 text-center">
            {props.displayValue ?? props.value}
          </p>
          <button
            className="btn btn-ghost flex btn-xs"
            onClick={
              !!props.onPlusClick
                ? () => {
                    props.onPlusClick?.();
                  }
                : onPlusClick
            }
          >
            <SvgPlusMicro />
          </button>
        </div>
      </div>
      <Slider
        classNames={props.classNames}
        min={props.min}
        step={props.step}
        max={props.max}
        value={props.value}
        included={props.included}
        className="[&>*:nth-child(1)]:bg-primary [&>*:nth-child(3)]:border-secondary [&>*:nth-child(4)>span]:text-content-base"
        marks={props.marks}
        onChange={props.onChange}
      />
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
  onClickRadio: (value: any) => void;
  label: string;
  displayValue?: string;
}

export const Join = ({
  items,
  onClickRadio,
  label,
  value,
  displayValue,
}: IJoinProps) => {
  return (
    <article className="flex flex-col justify-center items-center gap-2 w-full">
      <div className="flex flex-col justify-center items-center">
        <h2 className="font-medium">{label}</h2>
        <div className="flex my-2 gap-2 items-center">
          <p className="text-lg w-16 text-center">{displayValue ?? value}</p>
        </div>
      </div>

      <form className="join mx-auto">
        {items.map((item) => (
          <input
            key={item.value}
            className="join-item btn btn-xs"
            type="radio"
            name="options"
            aria-label={item.label}
            checked={value === item.value}
            onChange={() => {
              onClickRadio(item.value);
            }}
          />
        ))}
      </form>
    </article>
  );
};
interface IWhiteBalanceShiftSelectorProps {
  onClick: (whiteBalaceShift: { red: number; blue: number }) => void;
  shift: { red: number; blue: number };
}

export const WhiteBalanceShiftSelector = ({
  onClick,
  shift,
}: IWhiteBalanceShiftSelectorProps) => {
  const MAX = 9;
  const MIN = -9;
  return (
    <div className="p-0 w-fit flex flex-col m-auto">
      <div className="w-fit flex flex-col-reverse relative">
        <h1 className="absolute text-lg font-medium -top-7">
          R:{shift.red} B: {shift.blue}
        </h1>
        <div className="absolute flex flex-col gap-1 items-center top-[32%] -left-10">
          <button
            className="btn btn-ghost flex btn-xs"
            onClick={() =>
              onClick({
                red: shift.red,
                blue: shift.blue < MAX ? shift.blue + 1 : shift.blue,
              })
            }
          >
            <SvgPlusMicro />
          </button>
          <h2>B</h2>
          <button
            className="btn btn-ghost flex btn-xs"
            onClick={() =>
              onClick({
                red: shift.red,
                blue: shift.blue > MIN ? shift.blue - 1 : shift.blue,
              })
            }
          >
            <SvgMinusMicro />
          </button>
        </div>
        <div className="absolute flex gap-1 items-center left-[30%] -bottom-7">
          <button
            className="btn btn-ghost flex btn-xs"
            onClick={() =>
              onClick({
                red: shift.red > MIN ? shift.red - 1 : shift.red,
                blue: shift.blue,
              })
            }
          >
            <SvgMinusMicro />
          </button>
          <h2>R</h2>
          <button
            className="btn btn-ghost flex btn-xs"
            onClick={() =>
              onClick({
                red: shift.red < MAX ? shift.red + 1 : shift.red,
                blue: shift.blue,
              })
            }
          >
            <SvgPlusMicro />
          </button>
        </div>
        {WHITE_BALANCE_SHIFT.map((row, index) => {
          const rowColor = whiteBalnceColorMap[index.toString()];
          const className = `relative bg-clip-text text-transparent bg-gradient-to-r inline-block h-3 ${rowColor} `;

          return (
            <span key={index} className={className}>
              {row.map(([x, y]) => {
                const red = x - 9;
                const blue = y - 9;
                const selected = shift.red === red && shift.blue === blue;

                const button = selected ? (
                  <button
                    key={x + y}
                    className="h-3 w-3 text-[7.5px] align-top leading-[7.5px] border-2 border-accent p-0"
                    onClick={() => {
                      onClick({ red, blue });
                    }}
                  >
                    ■
                  </button>
                ) : (
                  <button
                    key={x + y}
                    className="h-3 w-3 text-xs align-top leading-3 "
                    onClick={() => {
                      onClick({ red, blue });
                    }}
                  >
                    ■
                  </button>
                );
                return button;
              })}
            </span>
          );
        })}
      </div>
    </div>
  );
};

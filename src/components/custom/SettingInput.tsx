import Slider, { SliderProps } from 'rc-slider';
import { WHITE_BALANCE_SHIFT, whiteBalnceColorMap } from './fujiSettings';

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
        className="select select-bordered select-sm"
        onChange={({ target: { value } }) => {
          onChange(value);
        }}
        value={value}
      >
        <option disabled value="">
          {placeholder}
        </option>
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
}

export const CustomSlider = (props: ISliderProps) => {
  return (
    <article className="flex flex-col justify-center items-center gap-2 pb-3">
      <div className="flex items-center">
        <h1 className="text-lg font-medium">{props.label}</h1>
        <p>
          <span className="mr-1">:</span>
          {props.displayValue ?? props.value}
        </p>
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
}

export const Join = ({ items, onClickRadio, label, value }: IJoinProps) => {
  return (
    <article className="flex flex-col justify-center items-center gap-2 ">
      <div className="flex items-center">
        <h1 className="text-lg font-medium">{label}</h1>
        <p>
          <span className="mr-1">:</span>
          {value}
        </p>
      </div>

      <form className="join mx-auto">
        {items.map((item) => (
          <input
            key={item.value}
            className="join-item btn btn-sm"
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
  whiteBalance: { red: number; blue: number };
}

export const WhiteBalanceShiftSelector = ({
  onClick,
  whiteBalance,
}: IWhiteBalanceShiftSelectorProps) => {
  return (
    <div className="p-0 w-fit flex flex-col-reverse m-auto">
      <h1 className="text-lg font-medium">
        R:{whiteBalance.red} B: {whiteBalance.blue}
      </h1>
      {WHITE_BALANCE_SHIFT.map((row, index) => {
        const rowColor = whiteBalnceColorMap[index.toString()];
        const className = `relative bg-clip-text text-transparent bg-gradient-to-r inline-block h-4 ${rowColor} `;

        return (
          <span key={index} className={className}>
            {row.map(([x, y]) => {
              const red = x - 9;
              const blue = y - 9;
              const selected =
                whiteBalance.red === red && whiteBalance.blue === blue;

              const button = selected ? (
                <button
                  key={x + y}
                  className="h-4 w-4 text-[12px] align-top leading-[11px] border-2 border-accent p-0"
                  onClick={() => {
                    onClick({ red, blue });
                  }}
                >
                  ■
                </button>
              ) : (
                <button
                  key={x + y}
                  className="h-4 w-4 text-xs align-top leading-4 "
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
  );
};

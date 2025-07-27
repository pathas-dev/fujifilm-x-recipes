'use client';

import useToastStore from '@/stores/toast';
import dayjs from 'dayjs';
import { animate, inView, motion } from 'framer-motion';
import lzString from 'lz-string';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  SvgArrowUTurnLeft,
  SvgCalendarDaysMicro,
  SvgClipBoard,
  SvgPencilSquareSolid,
  SvgTrashMini,
} from '../icon/svgs';
import CustomEditCard, { ICustomEditCardProps } from './CustomEditCard';
import {
  CustomRecipe,
  ERROR_TYPES,
  WhiteBalance,
  initialSettings,
} from './customRecipe';
import { formatExposure, toStringWithSign } from './fujiSettings';

const CARD_MODES = ['READ', 'UPDATE'] as const;

const AUTO_DELETE_MILLISECONDS = 6000;

export const QUERY_KEY_ADD_RECIPE = 'add';

interface ICustomCardProps
  extends Omit<ICustomEditCardProps, 'onSuccess' | 'onError'> {
  customRecipe: CustomRecipe;
  onUpdateSuccess: (recipe: CustomRecipe) => void;
  onUpdateError: (errorType: (typeof ERROR_TYPES)[number]) => void;
  onDeleteSuccess: (customRecipe: CustomRecipe) => void;
}

const CustomCard = ({
  cameras,
  filters,
  onUpdateError,
  onUpdateSuccess,
  customRecipe,
  onDeleteSuccess,
}: ICustomCardProps) => {
  // Translation hooks
  const tSettings = useTranslations('Settings');
  const tCopyAndPasteMessages = useTranslations('CopyAndPasteMessages');

  // Create message objects from translations
  const settingMessages = {
    newTitle: tSettings('newTitle'),
    updateTitle: tSettings('updateTitle'),
    placeholders: {
      name: tSettings('placeholders.name'),
      camera: tSettings('placeholders.camera'),
      base: tSettings('placeholders.base'),
    },
    labels: {
      highlight: tSettings('labels.highlight'),
      tone: tSettings('labels.tone'),
      shadow: tSettings('labels.shadow'),
      grain: tSettings('labels.grain'),
      grainSize: tSettings('labels.grainSize'),
      grainRoughness: tSettings('labels.grainRoughness'),
      dynamicRange: tSettings('labels.dynamicRange'),
      colorChromeEffect: tSettings('labels.colorChromeEffect'),
      colorChromeFXBlue: tSettings('labels.colorChromeFXBlue'),
      sharpness: tSettings('labels.sharpness'),
      color: tSettings('labels.color'),
      clarity: tSettings('labels.clarity'),
      isoNoiseReduction: tSettings('labels.isoNoiseReduction'),
      exposure: tSettings('labels.exposure'),
      iso: tSettings('labels.iso'),
      whiteBalance: tSettings('labels.whiteBalance'),
      whiteBalanceK: tSettings('labels.whiteBalanceK'),
      whiteBalanceShift: tSettings('labels.whiteBalanceShift'),
      bwAdj: tSettings('labels.bwAdj'),
    },
    options: {
      effects: {
        off: tSettings('options.effects.off'),
        strong: tSettings('options.effects.strong'),
        weak: tSettings('options.effects.weak'),
      },
      sizes: {
        off: tSettings('options.sizes.off'),
        large: tSettings('options.sizes.large'),
        small: tSettings('options.sizes.small'),
      },
      whiteBalances: {
        autoWhitePriority: tSettings('options.whiteBalances.autoWhitePriority'),
        auto: tSettings('options.whiteBalances.auto'),
        autoAmbiencePriority: tSettings(
          'options.whiteBalances.autoAmbiencePriority'
        ),
        measure: tSettings('options.whiteBalances.measure'),
        k: tSettings('options.whiteBalances.k'),
        sunlight: tSettings('options.whiteBalances.sunlight'),
        shade: tSettings('options.whiteBalances.shade'),
        daylight: tSettings('options.whiteBalances.daylight'),
        warmWhite: tSettings('options.whiteBalances.warmWhite'),
        coolWhite: tSettings('options.whiteBalances.coolWhite'),
        incandescent: tSettings('options.whiteBalances.incandescent'),
        underwater: tSettings('options.whiteBalances.underwater'),
      },
    },
    errors: {
      noName: tSettings('errors.noName'),
      noCamera: tSettings('errors.noCamera'),
      noBase: tSettings('errors.noBase'),
    },
    successes: {
      create: tSettings('successes.create'),
      update: tSettings('successes.update'),
    },
  };

  const copyAndPasteMessages = {
    copy: {
      success: tCopyAndPasteMessages('copy.success'),
      fail: tCopyAndPasteMessages('copy.fail'),
    },
    paste: {
      success: tCopyAndPasteMessages('paste.success'),
      errors: {
        invalidURL: tCopyAndPasteMessages('paste.errors.invalidURL'),
        invalidScheme: tCopyAndPasteMessages('paste.errors.invalidScheme'),
      },
    },
  };

  const [mode, setMode] = useState<(typeof CARD_MODES)[number]>('READ');
  const [deleteTimer, setDeleteTimer] = useState<NodeJS.Timeout>();
  const setToastMessage = useToastStore((state) => state.setMessage);

  const customCardRefCallback = (ref: HTMLDivElement) => {
    if (!ref) return;

    inView(ref, (info) => {
      const animation = animate([info.target], {
        opacity: 1,
        translateX: '0%',
      });

      return () => animation.stop();
    });
  };

  const isReadMode = mode === 'READ';

  if (!isReadMode)
    return (
      <CustomEditCard
        cameras={cameras}
        customRecipe={customRecipe}
        filters={filters}
        onSuccess={(recipe) => {
          onUpdateSuccess(recipe);
          setMode('READ');
        }}
        onError={onUpdateError}
      />
    );

  if (!customRecipe) return null;

  const isColor = /color/i.test(customRecipe.colorType);
  const colorClassName = isColor
    ? 'from-red-500 via-green-500 to-blue-500'
    : 'from-black to-white';

  const getWhiteBalanceDisplayValue = ({
    whiteBalance,
  }: {
    whiteBalance: WhiteBalance;
  }) => {
    const label = settingMessages.options.whiteBalances[whiteBalance.type];

    if (whiteBalance.type === 'k') return `${whiteBalance.k}${label}`;

    return label;
  };

  const getWhiteBalanceShiftValue = (shift: { red: number; blue: number }) =>
    `${toStringWithSign(shift.red)} Red, ${toStringWithSign(shift.blue)} Blue`;

  const settingDisplayProps: ISettingDisplayProps[] = [
    {
      label: settingMessages.labels.highlight,
      value: customRecipe.settings.tone.highlight,
      defaultValue: initialSettings.tone.highlight,
    },
    {
      label: settingMessages.labels.shadow,
      value: customRecipe.settings.tone.shadow,
      defaultValue: initialSettings.tone.shadow,
    },
    {
      label: settingMessages.labels.grainRoughness,
      value: customRecipe.settings.grain.roughness,
      defaultValue: initialSettings.grain.roughness,
      displayValue:
        settingMessages.options.effects[customRecipe.settings.grain.roughness],
    },
    {
      label: settingMessages.labels.grainSize,
      value: customRecipe.settings.grain.size,
      defaultValue: initialSettings.grain.size,
      displayValue:
        settingMessages.options.sizes[customRecipe.settings.grain.size],
    },
    {
      label: settingMessages.labels.dynamicRange,
      value: customRecipe.settings.dRange,
      defaultValue: initialSettings.dRange,
    },
    {
      label: settingMessages.labels.colorChromeEffect,
      value: customRecipe.settings.colorChrome.effect,
      defaultValue: initialSettings.colorChrome.effect,
      displayValue:
        settingMessages.options.effects[
          customRecipe.settings.colorChrome.effect
        ],
    },
    {
      label: settingMessages.labels.colorChromeFXBlue,
      value: customRecipe.settings.colorChrome.fxBlue,
      defaultValue: initialSettings.colorChrome.fxBlue,
      displayValue:
        settingMessages.options.effects[
          customRecipe.settings.colorChrome.fxBlue
        ],
    },
    {
      label: settingMessages.labels.sharpness,
      value: customRecipe.settings.sharpness,
      defaultValue: initialSettings.sharpness,
    },
    {
      label: settingMessages.labels.color,
      value: customRecipe.settings.color,
      defaultValue: initialSettings.color,
    },
    {
      label: settingMessages.labels.clarity,
      value: customRecipe.settings.clarity,
      defaultValue: initialSettings.clarity,
    },
    {
      label: settingMessages.labels.isoNoiseReduction,
      value: customRecipe.settings.isoNoiseReduction,
      defaultValue: initialSettings.isoNoiseReduction,
    },
    {
      label: settingMessages.labels.exposure,
      value: customRecipe.settings.exposure,
      defaultValue: initialSettings.exposure,
      displayValue: formatExposure(customRecipe.settings.exposure),
    },
    {
      label: settingMessages.labels.iso,
      value: customRecipe.settings.iso.value,
      defaultValue: initialSettings.iso.value,
      displayValue: `${customRecipe.settings.iso.isAuto ? 'AUTO up to ' : ''}${
        customRecipe.settings.iso.value
      }`,
    },

    {
      label: settingMessages.labels.whiteBalance,
      value: customRecipe.settings.whiteBalance.type,
      defaultValue: initialSettings.whiteBalance.type,
      displayValue: getWhiteBalanceDisplayValue({
        whiteBalance: customRecipe.settings.whiteBalance,
      }),
    },
    {
      label: settingMessages.labels.whiteBalanceShift,
      value: getWhiteBalanceShiftValue(
        customRecipe.settings.whiteBalance.shift
      ),
      defaultValue: getWhiteBalanceShiftValue(
        initialSettings.whiteBalance.shift
      ),
    },
    {
      label: settingMessages.labels.bwAdj,
      value: customRecipe.settings.bwAdj,
      defaultValue: initialSettings.bwAdj,
    },
  ];

  const onDeleteButtonClick = () => {
    const timer = setTimeout(() => {
      onDeleteSuccess(customRecipe);
      setDeleteTimer(undefined);
    }, AUTO_DELETE_MILLISECONDS);
    setDeleteTimer(timer);
  };

  const onUndoDeleteButtonClick = () => {
    clearTimeout(deleteTimer);
    setDeleteTimer(undefined);
  };

  const onShareButtonClick = () => {
    const compressedRecipe = lzString.compressToEncodedURIComponent(
      JSON.stringify(customRecipe)
    );
    const url = `${window.location.href}?${QUERY_KEY_ADD_RECIPE}=${compressedRecipe}`;
    if (!!navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setToastMessage({ message: copyAndPasteMessages?.copy.success });
    } else {
      setToastMessage({
        type: 'Error',
        message: copyAndPasteMessages?.copy.fail,
      });
    }
  };

  return (
    <motion.div
      className="card card-compact bg-base-300 h-fit min-h-42 w-full shadow-xl"
      transition={{ duration: 0.4 }}
      initial={{ opacity: 0.3, translateX: '80%' }}
      ref={customCardRefCallback}
    >
      <div className="card-body">
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full flex-col">
            <div className="card-title flex w-full justify-between">
              <h2 className="overflow-hidden text-nowrap text-ellipsis">
                {customRecipe.name}
              </h2>
              <button
                className="btn btn-circle btn-ghost fill-warning btn-sm"
                onClick={() => setMode('UPDATE')}
              >
                <SvgPencilSquareSolid />
              </button>
            </div>
            <span className="text-xs leading-3 font-light">
              (from {customRecipe.base})
            </span>
          </div>
        </div>

        <details className="collapse-arrow bg-base-200 collapse">
          <summary className="collapse-title text-base-content">
            <div className="flex items-end">
              <div
                className={`transparent bg-clip mr-2 h-6 w-6 rounded bg-gradient-to-br ${colorClassName}`}
              />
              <h2 className="overflow-hidden text-lg font-medium text-nowrap text-ellipsis">
                {customRecipe.camera}
                <span className="text-sm">({customRecipe.sensor})</span>
              </h2>
            </div>
          </summary>
          <div className="collapse-content">
            {settingDisplayProps.map((props) => (
              <SettingDisplay {...props} key={props.label} />
            ))}
            <div className="mt-1 flex w-full justify-end">
              <button
                onClick={onShareButtonClick}
                className="btn btn-sm btn-ghost btn-circle fill-info"
              >
                <SvgClipBoard />
              </button>
            </div>
          </div>
        </details>
        <div className="card-actions flex items-center justify-between">
          {!deleteTimer ? (
            <button
              className="btn btn-ghost btn-circle btn-xs fill-error"
              onClick={onDeleteButtonClick}
            >
              <SvgTrashMini />
            </button>
          ) : (
            <div>
              <button
                className="btn btn-ghost btn-xs fill-error text-error flex"
                onClick={onUndoDeleteButtonClick}
              >
                <SvgArrowUTurnLeft />
                <CountDown milliseconds={AUTO_DELETE_MILLISECONDS - 1000} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-0.5">
            <SvgCalendarDaysMicro />
            {dayjs(customRecipe.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface ISettingDisplayProps {
  label: string;
  value: any;
  defaultValue: any;
  displayValue?: string;
}

const SettingDisplay = ({
  label,
  value,
  defaultValue,
  displayValue,
}: ISettingDisplayProps) => {
  const isSetted = value !== defaultValue;
  const className = isSetted ? 'flex gap-1 text-accent' : 'flex gap-1';
  const isNumber = typeof value === 'number';

  const formattedNumberValue = isNumber ? toStringWithSign(value) : value;

  return (
    <div className={className}>
      <span>{label}:</span>
      <span>{displayValue ?? formattedNumberValue}</span>
    </div>
  );
};

const CountDown = ({ milliseconds }: { milliseconds: number }) => {
  const [seconds, setSeconds] = useState(milliseconds / 1000);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [milliseconds]);
  return (
    <span className="countdown">
      {/* @ts-ignore */}
      <span style={{ '--value': seconds }}>{seconds}</span>
    </span>
  );
};

export default CustomCard;

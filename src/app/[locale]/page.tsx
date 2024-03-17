import { getCamerasWithFilters } from '@/app/api/data/localData';
import CustomList from '@/components/custom/CustomList';
import { localeIntl } from '@/navigation';
import { HeaderLabels, SettingMessages } from '@/types/language';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

export default async function CustomPage({
  params: { locale },
}: Readonly<{
  params: { locale: (typeof localeIntl)[keyof typeof localeIntl] };
}>) {
  unstable_setRequestLocale(locale);
  const { cameras, filters } = await getCamerasWithFilters();

  const tHeaders = await getTranslations('Headers');
  const tSettings = await getTranslations('Settings');

  const headerLabels: HeaderLabels = {
    bwOnly: tHeaders('bwOnly'),
    dateLabel: tHeaders('dateLabel'),
    nameLabel: tHeaders('nameLabel'),
    baseLabel: tHeaders('baseLabel'),
    cameraLabel: tHeaders('cameraLabel'),
    creatorLabel: tHeaders('creatorLabel'),
  };

  const settingLabels: SettingMessages = {
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

  return (
    <CustomList
      filters={filters}
      headerLabels={headerLabels}
      settingMessages={settingLabels}
      cameras={cameras}
    />
  );
}

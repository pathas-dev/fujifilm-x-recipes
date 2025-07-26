import { getCamerasWithFilters } from "@/app/api/data/localData";
import CustomList from "@/components/custom/CustomList";
import { localeIntl } from "@/i18n/navigation";
import {
  CopyAndPasteMessages,
  HeaderMessages,
  ImportFileMessages,
  SendEmailMessages,
  SettingMessages,
} from "@/types/language";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function CustomPage(
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) {
  const params = await props.params;

  const { locale } = params;

  setRequestLocale(locale);
  const { cameras, filters } = await getCamerasWithFilters();

  const tHeaders = await getTranslations("Headers");
  const tSettings = await getTranslations("Settings");
  const tSendEmail = await getTranslations("SendEmail");
  const tImportFile = await getTranslations("ImportFile");
  const tCopyAndPasteMessages = await getTranslations("CopyAndPasteMessages");

  const headerMessages: HeaderMessages = {
    bwOnly: tHeaders("bwOnly"),
    dateLabel: tHeaders("dateLabel"),
    nameLabel: tHeaders("nameLabel"),
    baseLabel: tHeaders("baseLabel"),
    cameraLabel: tHeaders("cameraLabel"),
    creatorLabel: tHeaders("creatorLabel"),
  };

  const settingMessages: SettingMessages = {
    newTitle: tSettings("newTitle"),
    updateTitle: tSettings("updateTitle"),
    placeholders: {
      name: tSettings("placeholders.name"),
      camera: tSettings("placeholders.camera"),
      base: tSettings("placeholders.base"),
    },
    labels: {
      highlight: tSettings("labels.highlight"),
      tone: tSettings("labels.tone"),
      shadow: tSettings("labels.shadow"),
      grain: tSettings("labels.grain"),
      grainSize: tSettings("labels.grainSize"),
      grainRoughness: tSettings("labels.grainRoughness"),
      dynamicRange: tSettings("labels.dynamicRange"),
      colorChromeEffect: tSettings("labels.colorChromeEffect"),
      colorChromeFXBlue: tSettings("labels.colorChromeFXBlue"),
      sharpness: tSettings("labels.sharpness"),
      color: tSettings("labels.color"),
      clarity: tSettings("labels.clarity"),
      isoNoiseReduction: tSettings("labels.isoNoiseReduction"),
      exposure: tSettings("labels.exposure"),
      iso: tSettings("labels.iso"),
      whiteBalance: tSettings("labels.whiteBalance"),
      whiteBalanceK: tSettings("labels.whiteBalanceK"),
      whiteBalanceShift: tSettings("labels.whiteBalanceShift"),
      bwAdj: tSettings("labels.bwAdj"),
    },
    options: {
      effects: {
        off: tSettings("options.effects.off"),
        strong: tSettings("options.effects.strong"),
        weak: tSettings("options.effects.weak"),
      },
      sizes: {
        off: tSettings("options.sizes.off"),
        large: tSettings("options.sizes.large"),
        small: tSettings("options.sizes.small"),
      },
      whiteBalances: {
        autoWhitePriority: tSettings("options.whiteBalances.autoWhitePriority"),
        auto: tSettings("options.whiteBalances.auto"),
        autoAmbiencePriority: tSettings(
          "options.whiteBalances.autoAmbiencePriority"
        ),
        measure: tSettings("options.whiteBalances.measure"),
        k: tSettings("options.whiteBalances.k"),
        sunlight: tSettings("options.whiteBalances.sunlight"),
        shade: tSettings("options.whiteBalances.shade"),
        daylight: tSettings("options.whiteBalances.daylight"),
        warmWhite: tSettings("options.whiteBalances.warmWhite"),
        coolWhite: tSettings("options.whiteBalances.coolWhite"),
        incandescent: tSettings("options.whiteBalances.incandescent"),
        underwater: tSettings("options.whiteBalances.underwater"),
      },
    },
    errors: {
      noName: tSettings("errors.noName"),
      noCamera: tSettings("errors.noCamera"),
      noBase: tSettings("errors.noBase"),
    },
    successes: {
      create: tSettings("successes.create"),
      update: tSettings("successes.update"),
    },
  };

  const sendEmailMessages: SendEmailMessages = {
    placeholder: tSendEmail("placeholder"),
    success: tSendEmail("success"),
    errors: {
      noEmail: tSendEmail("errors.noEmail"),
      noData: tSendEmail("errors.noData"),
    },
    tooltip: tSendEmail("tooltip"),
  };

  const importFileMessages: ImportFileMessages = {
    success: tImportFile("success"),
    errors: {
      noFile: tImportFile("errors.noFile"),
      noData: tImportFile("errors.noData"),
      notJson: tImportFile("errors.notJson"),
    },
    tooltip: tImportFile("tooltip"),
  };

  const copyAndPasteMessages: CopyAndPasteMessages = {
    copy: {
      success: tCopyAndPasteMessages("copy.success"),
      fail: tCopyAndPasteMessages("copy.fail"),
    },
    paste: {
      success: tCopyAndPasteMessages("paste.success"),
      errors: {
        invalidURL: tCopyAndPasteMessages("paste.errors.invalidURL"),
        invalidScheme: tCopyAndPasteMessages("paste.errors.invalidScheme"),
      },
    },
  };

  return (
    <CustomList
      filters={filters}
      headerMessages={headerMessages}
      settingMessages={settingMessages}
      sendEmailMessages={sendEmailMessages}
      importFileMessages={importFileMessages}
      cameras={cameras}
      copyAndPasteMessages={copyAndPasteMessages}
    />
  );
}

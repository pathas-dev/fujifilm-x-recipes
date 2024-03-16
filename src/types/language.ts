export type HeaderLabels = {
  bwOnly: string;
  dateLabel: string;
  nameLabel: string;
  baseLabel: string;
  cameraLabel: string;
  creatorLabel: string;
};

export type SettingI18NLabels = {
  highlight: string;
  tone: string;
  shadow: string;
  grain: string;
  grainSize: string;
  grainRoughness: string;
  dynamicRange: string;
  colorChromeEffect: string;
  colorChromeFXBlue: string;
  sharpness: string;
  color: string;
  clarity: string;
  isoNoiseReduction: string;
  exposure: string;
  iso: string;
  whiteBalance: string;
  whiteBalanceK: string;
  whiteBalanceShift: string;
  bwAdj: string;
};

export type SettingMessages = {
  newTitle: string;
  updateTitle: string;
  placeholders: {
    name: string;
    camera: string;
    base: string;
  };
  labels: SettingI18NLabels;
  options: {
    effects: {
      off: string;
      strong: string;
      weak: string;
    };
    sizes: {
      off: string;
      large: string;
      small: string;
    };
    whiteBalances: {
      autoWhitePriority: string;
      auto: string;
      autoAmbiencePriority: string;
      measure: string;
      k: string;
      sunlight: string;
      shade: string;
      daylight: string;
      warmWhite: string;
      coolWhite: string;
      incandescent: string;
      underwater: string;
    };
  };
  errors: {
    noName: string;
    noBase: string;
    noCamera: string;
  };
  successes: {
    create: string;
    update: string;
  };
};

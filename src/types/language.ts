export type HeaderMessages = {
  bwOnly: string;
  dateLabel: string;
  nameLabel: string;
  baseLabel: string;
  cameraLabel: string;
  creatorLabel: string;
};

export type SettingI18NMessages = {
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
  labels: SettingI18NMessages;
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

export type SendEmailMessages = {
  placeholder: string;
  success: string;
  errors: {
    noEmail: string;
    noData: string;
  };
  tooltip: string;
};

export type ImportFileMessages = {
  success: string;
  errors: {
    noFile: string;
    noData: string;
    notJson: string;
  };
  tooltip: string;
};

export type NavigationTitleMessages = {
  bookmarks: string;
  recipes: string;
  settings: string;
  cameras: string;
  custom: string;
};

export type SettingsPageMessages = {
  title: string;
  originsPage: string;
  guidePage: string;
  notePage: string;
  hideCardImage: string;
};

export type CopyAndPasteMessages = {
  copy: {
    success: string;
    fail: string;
  };
  paste: {
    success: string;
    errors: {
      invalidURL: string;
      invalidScheme: string;
    };
  };
};

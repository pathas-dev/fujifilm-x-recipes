export type Recipe = {
  _id: string;
  creator: string;
  name: string;
  colorType: string;
  camera: string;
  sensor: string;
  base: string;
  settings: string;
  published: string;
  url: string;
};

export type Origin = {
  _id: string;
  name: string;
  siteOrProfile: string;
  url: string;
  count: string;
  firstPublication: string;
  lastPublication: string;
};

export type Camera = {
  _id: string;
  cameraType: string;
  announced: string;
  sensor: string;
  simulations: string;
  otherSpecifications: string;
};

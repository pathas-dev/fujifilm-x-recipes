export type OpenGraph = {
  title: string;
  type: string;
  url: string;
  image: {
    height: string;
    type: string;
    url: string;
    width: string;
    alt: string;
  };
  description?: string;
  site_name?: string;
  locale?: string;
};

const initialOpenGraph: OpenGraph = {
  title: "",
  type: "",
  url: "",
  description: "",
  site_name: "",
  locale: "",
  image: {
    height: "",
    width: "",
    url: "",
    alt: "",
    type: "",
  },
};

// Pixel GIF code adapted from https://stackoverflow.com/a/33919020/266535
const keyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

const triplet = (e1: number, e2: number, e3: number) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63);

const rgbDataURL = (r: number, g: number, b: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${
    triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;

export const getInitialOpenGraph = (): OpenGraph => {
  const random = () => Math.ceil(Math.random() * 255);
  const newInitialOpenGraph = { ...initialOpenGraph };
  newInitialOpenGraph.image.url = rgbDataURL(random(), random(), random());
  return newInitialOpenGraph;
};

const ogProperties = [
  "type",
  "title",
  "url",
  "image",
  "image:width",
  "image:height",
  "image:alt",
  "description",
  "site_name",
  "locale",
];

export const getOpenGraph = (urlHtml: string): OpenGraph => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(urlHtml, "text/html");

  return ogProperties.reduce<OpenGraph>((acc, property) => {
    const content =
      doc
        .querySelector(`meta[property="og:${property}"]`)
        ?.getAttribute("content") ?? "";

    if (property.indexOf("image") < 0) return { ...acc, [property]: content };

    const DELIMETER = ":";

    const [, imageProperty] = property.split(DELIMETER);

    const isUrl = !imageProperty;

    if (isUrl) return { ...acc, image: { ...acc.image, url: content } };

    return { ...acc, image: { ...acc.image, [imageProperty]: content } };
  }, getInitialOpenGraph());
};

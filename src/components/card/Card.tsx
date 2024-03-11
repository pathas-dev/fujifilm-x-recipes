'use client';

import { Recipe } from '@/types/api';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SvgArrow, SvgLink } from '../icon/svgs';
import { Link } from '@/navigation';

interface ICardProps {
  recipe: Recipe;
}
const Card = ({ recipe }: ICardProps) => {
  const [intersected, setIntersected] = useState(false);
  const [openGraph, setOpenGraph] = useState<undefined | OpenGraph>(undefined);
  const [skeletonElement, setSkeletonElement] = useState<
    HTMLDivElement | undefined
  >(undefined);
  const [cardElement, setCardElement] = useState<HTMLDivElement | undefined>(
    undefined
  );

  useEffect(() => {
    if (!skeletonElement || !recipe.url) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.intersectionRatio > 0) {
          try {
            const response = await fetch('/api/recipes/url', {
              method: 'POST',
              body: JSON.stringify({ url: recipe.url }),
            });
            const data = await response.json();
            if (!data?.urlHtml) return;

            const parsedOpenGraph = getOpenGraph(data.urlHtml);
            if (!parsedOpenGraph.image.url) throw new Error('no image');

            if (skeletonElement) io.unobserve(skeletonElement);
            setOpenGraph(parsedOpenGraph);
            setIntersected(true);
          } catch (error) {
            setOpenGraph(getInitialOpenGraph());
          } finally {
            setSkeletonElement(undefined);
          }
        }
      });
    });

    io.observe(skeletonElement);

    return () => {
      if (!skeletonElement || !io) return;
      io.unobserve(skeletonElement);
      setSkeletonElement(undefined);
    };
  }, [recipe.url, skeletonElement]);

  useEffect(() => {
    if (!cardElement) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        setIntersected(entry.intersectionRatio > 0);
      });
    });

    io.observe(cardElement);

    return () => {
      if (!cardElement || !io) return;
      io.unobserve(cardElement);
      setCardElement(undefined);
    };
  }, [cardElement]);

  const isColor = /color/i.test(recipe.colorType);
  const colorClassName = isColor
    ? 'from-red-500 via-green-500 to-blue-500'
    : 'from-black to-white';
  const cardInner = useMemo(
    () => (
      <>
        <figure className="relative">
          <Image
            src={openGraph?.image?.url ?? getImagePlaceholder()}
            alt={openGraph?.image?.alt ?? ''}
            fill
            quality={30}
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </figure>
        <div className="card-body">
          <Bookmark id={recipe._id} />
          <div className="w-full flex items-end">
            <h2 className="card-title gap-0 items-end">
              <span className="">
                {recipe.name}
                <span className="text-xs font-light leading-5">
                  (from {recipe.base})
                </span>
              </span>
              <Link href={recipe.url} target="_blank">
                <SvgArrow />
              </Link>
            </h2>
          </div>

          <details className="collapse collapse-arrow bg-base-100">
            <summary className="collapse-title">
              <div className="flex items-end">
                <div
                  className={`mr-2 w-6 h-6 rounded transparent bg-clip bg-gradient-to-br ${colorClassName}`}
                />
                <h2 className={`text-lg font-medium text-base-content`}>
                  {recipe.camera}
                  <span className="text-sm">({recipe.sensor})</span>
                </h2>
              </div>
            </summary>
            <div className="collapse-content">
              <p className="whitespace-pre-line text-sm text-base-content">
                {recipe.settings}
              </p>
            </div>
          </details>
          <div className="card-actions self-end flex items-center gap-0">
            <Link
              href={`/origins#${recipe.creator}`}
              className="card-actions self-end flex items-center gap-0 link link-hover"
            >
              <SvgLink />
              {recipe.creator}, {dayjs(recipe.published).format('YYYY-MM-DD')}
            </Link>
          </div>
        </div>
      </>
    ),
    [
      colorClassName,
      openGraph?.image?.alt,
      openGraph?.image?.url,
      recipe._id,
      recipe.base,
      recipe.camera,
      recipe.creator,
      recipe.name,
      recipe.published,
      recipe.sensor,
      recipe.settings,
      recipe.url,
    ]
  );

  if (!openGraph)
    return (
      <div
        className="skeleton w-full h-40"
        ref={(ref) => setSkeletonElement(ref ?? undefined)}
      />
    );

  return (
    <div
      ref={(ref) => setCardElement(ref ?? undefined)}
      className="card card-compact w-full min-h-40 bg-base-100 shadow-xl image-full overflow-hidden"
    >
      {intersected ? cardInner : null}
    </div>
  );
};

interface BookmarkProps {
  id: string;
}

export const STORAGE_BOOKMARK_KEY = 'bookmark';

const Bookmark = ({ id }: BookmarkProps) => {
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    const bookmarkedIds = JSON.parse(
      localStorage.getItem(STORAGE_BOOKMARK_KEY) ?? '[]'
    ) as string[];

    setMarked(bookmarkedIds.includes(id));
  }, [id]);

  const handleBookmarkClick = useCallback(() => {
    const bookmarkedIds = JSON.parse(
      localStorage.getItem(STORAGE_BOOKMARK_KEY) ?? '[]'
    ) as string[];
    if (!marked) {
      bookmarkedIds.push(id);
      localStorage.setItem(STORAGE_BOOKMARK_KEY, JSON.stringify(bookmarkedIds));
    } else {
      const removedIds = bookmarkedIds.filter(
        (bookmarkedId) => bookmarkedId !== id
      );
      localStorage.setItem(STORAGE_BOOKMARK_KEY, JSON.stringify(removedIds));
    }
    setMarked((prev) => !prev);
  }, [marked, id]);

  return (
    <div className="absolute top-2 right-2">
      <label className="swap">
        {/* this hidden checkbox controls the state */}
        <input
          type="checkbox"
          onChange={handleBookmarkClick}
          checked={marked}
        />

        {/* volume on icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7 swap-on fill-green-400"
        >
          <path
            fillRule="evenodd"
            d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
            clipRule="evenodd"
          />
        </svg>

        {/* volume off icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          fill="none"
          stroke="currentColor"
          className="w-7 h-7 swap-off"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
          />
        </svg>
      </label>
    </div>
  );
};

// Pixel GIF code adapted from https://stackoverflow.com/a/33919020/266535
const keyStr =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

const triplet = (e1: number, e2: number, e3: number) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63);

const rgbDataURL = (r: number, g: number, b: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${
    triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;

const ogProperties = [
  'type',
  'title',
  'url',
  'image',
  'image:width',
  'image:height',
  'image:alt',
  'description',
  'site_name',
  'locale',
];

type OpenGraph = {
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
  title: '',
  type: '',
  url: '',
  description: '',
  site_name: '',
  locale: '',
  image: {
    height: '',
    width: '',
    url: '',
    alt: '',
    type: '',
  },
};

const getImagePlaceholder = () => {
  const random = () => Math.ceil(Math.random() * 255);
  return rgbDataURL(random(), random(), random());
};

const getInitialOpenGraph = (): OpenGraph => {
  const random = () => Math.ceil(Math.random() * 255);
  const newInitialOpenGraph = { ...initialOpenGraph };
  newInitialOpenGraph.image.url = rgbDataURL(random(), random(), random());
  return newInitialOpenGraph;
};

const getOpenGraph = (urlHtml: string): OpenGraph => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(urlHtml, 'text/html');

  return ogProperties.reduce<OpenGraph>((acc, property) => {
    const content =
      doc
        .querySelector(`meta[property="og:${property}"]`)
        ?.getAttribute('content') ?? '';

    if (property.indexOf('image') < 0) return { ...acc, [property]: content };

    const DELIMETER = ':';

    const [, imageProperty] = property.split(DELIMETER);

    const isUrl = !imageProperty;

    if (isUrl) return { ...acc, image: { ...acc.image, url: content } };

    return { ...acc, image: { ...acc.image, [imageProperty]: content } };
  }, getInitialOpenGraph());
};

export default Card;

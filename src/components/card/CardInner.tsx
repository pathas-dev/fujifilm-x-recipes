'use client';

import { Recipe } from '@/types/api';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { LegacyRef, useEffect, useRef, useState } from 'react';

interface ICardInnerProps {
  urlHtml: string;
  recipe: Recipe;
}

const CardInner = ({ urlHtml, recipe }: ICardInnerProps) => {
  const [openGraph, setOpenGraph] = useState(initialOpenGraph);
  const [imageSrc, setImageSrc] = useState(initialOpenGraph.image.url);
  const refCard = useRef<HTMLImageElement>();

  useEffect(() => {
    const parsedOpenGraph = getOpenGraph(urlHtml);
    setOpenGraph(parsedOpenGraph);
  }, [urlHtml]);

  useEffect(() => {
    if (!refCard.current) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          setImageSrc(openGraph.image.url);
        }
      });
    });

    io.observe(refCard.current);

    return () => {
      if (!refCard.current || !io) return;
      io.unobserve(refCard.current);
    };
  }, [openGraph]);

  const isColor = /color/i.test(recipe.colorType);
  const colorClassName = isColor
    ? 'from-red-500 via-green-500 to-blue-500'
    : 'from-black to-white';

  return (
    <div className="card w-full h-fit bg-base-100 shadow-xl image-full overflow-hidden">
      <figure className="relative">
        <Image
          src={imageSrc}
          alt={openGraph.image.alt}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          ref={(ref) => (refCard.current = ref ?? undefined)}
        />
      </figure>
      <div className="card-body">
        <div className="w-full flex items-end">
          <h2 className="card-title">{recipe.name}</h2>
          <span className="text-xs leading-5">(from {recipe.base})</span>
          <Link href={recipe.url} target="_blank">
            <SvgArrow />
          </Link>
        </div>

        <details className="collapse collapse-arrow bg-base-100">
          <summary className="collapse-title">
            <h2
              className={`text-lg font-medium inline-block text-transparent bg-clip-text bg-gradient-to-br ${colorClassName}`}
            >
              {recipe.camera}
              <span className="text-sm">({recipe.sensor})</span>
            </h2>
          </summary>
          <div className="collapse-content">
            <p className="whitespace-pre-line text-sm text-base-content">
              {recipe.settings}
            </p>
          </div>
        </details>
        <div className="card-actions self-end flex items-center gap-0">
          <Link href={recipe.url} target="_blank">
            <SvgLink />
          </Link>
          {recipe.creator}, {dayjs(recipe.published).format('YYYY-MM-DD')}
        </div>
      </div>
    </div>
  );
};

const SvgArrow = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
};
const SvgLink = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 25 25"
      strokeWidth={2}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
      />
    </svg>
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
    url: rgbDataURL(255, 255, 255),
    alt: '',
    type: '',
  },
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
  }, initialOpenGraph);
};

export default CardInner;

'use client';

import { Link } from '@/i18n/navigation';
import { Recipe } from '@/types/api';
import {
  getInitialOpenGraph,
  getOpenGraph,
  OpenGraph,
} from '@/utils/getOpenGraph';
import dayjs from 'dayjs';
import { animate, motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SvgArrow, SvgLink } from '../icon/svgs';
import { STORAGE_HIDE_CARD_IMAGE_KEY } from '../settings/HideCardImageToggle';

interface IRecipeCardProps {
  recipe: Recipe;
}
const RecipeCard = ({ recipe }: IRecipeCardProps) => {
  const [openGraph, setOpenGraph] = useState<undefined | OpenGraph>(undefined);
  const refCard = useRef<HTMLDivElement>(null);
  const refCardIsInView = useInView(refCard);
  const refSkeleton = useRef<HTMLDivElement>(null);
  const refSkeletonIsInView = useInView(refSkeleton, { once: true });

  const fetchOpenGraphImage = useCallback(async () => {
    try {
      const response = (await Promise.race([
        fetch('/api/recipes/url', {
          method: 'POST',
          body: JSON.stringify({ url: recipe.url }),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 5000)
        ),
      ])) as Response;

      const data = await response.json();
      if (!data?.urlHtml) return;

      const parsedOpenGraph = getOpenGraph(data.urlHtml);
      if (!parsedOpenGraph.image.url) throw new Error('no image');

      setOpenGraph(parsedOpenGraph);
    } catch (error) {
      console.log(error);
      setOpenGraph(getInitialOpenGraph());
    }
  }, [recipe.url]);

  useEffect(() => {
    if (!refSkeletonIsInView) return;

    const animation = animate([refCard.current], {
      opacity: 1,
      translateX: '0%',
    });

    const hideImage = JSON.parse(
      localStorage.getItem(STORAGE_HIDE_CARD_IMAGE_KEY) || 'false'
    );

    if (hideImage) setOpenGraph(getInitialOpenGraph());
    else fetchOpenGraphImage();

    return () => animation.stop();
  }, [refSkeletonIsInView, fetchOpenGraphImage]);

  const isColor = /color/i.test(recipe.colorType);
  const colorClassName = isColor
    ? 'from-red-500 via-green-500 to-blue-500'
    : 'from-black to-white';

  const cardInner = useMemo(
    () => (
      <>
        <figure className="relative">
          {openGraph?.image?.url && (
            <Image
              src={openGraph?.image?.url ?? ''}
              alt={openGraph?.image?.alt ?? ''}
              fill
              quality={30}
              style={{
                objectFit: 'cover',
                transition: 'all',
                position: 'absolute',
              }}
              sizes="33vw"
            />
          )}
        </figure>

        <Bookmark id={recipe._id} />
        <div className="card-body">
          <div className="flex w-full flex-col">
            <div className="card-title w-9/12 items-start gap-1">
              <h2>{recipe.name}</h2>
              <Link
                href={recipe.url}
                target="_blank"
                className="link-hover flex pt-1 leading-3"
              >
                <SvgArrow />
              </Link>
            </div>
            <span className="text-xs leading-3 font-light">
              (from {recipe.base})
            </span>
          </div>

          <details className="collapse-arrow bg-base-100 collapse">
            <summary className="collapse-title text-base-content">
              <div className="flex items-end">
                <div
                  className={`transparent bg-clip mr-2 h-6 w-6 rounded bg-gradient-to-br ${colorClassName}`}
                />
                <h2 className="overflow-hidden text-lg font-medium text-nowrap text-ellipsis">
                  {recipe.camera}
                  <span className="text-sm">({recipe.sensor})</span>
                </h2>
              </div>
            </summary>
            <div className="collapse-content">
              <p className="text-base-content text-sm whitespace-pre-line">
                {recipe.settings}
              </p>
            </div>
          </details>
          <div className="card-actions flex items-center gap-0 self-end">
            <Link
              href={`/origins#${recipe.creator}`}
              className="card-actions link link-hover flex items-center gap-0 self-end"
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

  return (
    <motion.div
      ref={refCard}
      className="card card-compact bg-base-100 image-full h-fit min-h-44 w-full overflow-hidden shadow-xl"
      transition={{ duration: 0.4 }}
      initial={{ opacity: 0.3, translateX: '80%' }}
    >
      {!openGraph && (
        <div
          className="skeleton absolute top-0 right-0 bottom-0 left-0 z-10 overflow-hidden"
          ref={refSkeleton}
        />
      )}
      {refCardIsInView ? cardInner : null}
    </motion.div>
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
    <div className="absolute top-2 right-2 z-30">
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
          className="swap-on h-7 w-7 fill-green-400"
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
          className="swap-off h-7 w-7"
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

export default RecipeCard;

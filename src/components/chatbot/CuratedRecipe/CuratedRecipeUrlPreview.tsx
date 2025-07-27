'use client';

import { getOpenGraph, OpenGraph } from '@/utils/getOpenGraph';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import z from 'zod';

interface RecipeUrlPreviewProps {
  url: string;
}

const RecipeUrlPreview = ({ url }: RecipeUrlPreviewProps) => {
  const t = useTranslations('Chatbot');
  const [openGraph, setOpenGraph] = useState<null | OpenGraph>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!url) return;

    const fetchOpenGraphImage = async () => {
      const isValidURL = z.url().safeParse(url).success;
      if (!isValidURL) return;

      setIsLoading(true);
      try {
        const response = (await Promise.race([
          fetch('/api/recipes/url', {
            method: 'POST',
            body: JSON.stringify({ url }),
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          ),
        ])) as Response;

        if (!response.ok) return;

        const data = await response.json();
        if (!data?.urlHtml) return;

        const parsedOpenGraph = getOpenGraph(data.urlHtml);
        if (!parsedOpenGraph.image.url) return;

        setOpenGraph(parsedOpenGraph);
      } catch (error) {
        console.log('Failed to fetch OpenGraph data:', error);
        setOpenGraph(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpenGraphImage();
  }, [url]);

  if (!url) return null;

  return (
    <div className="mb-6">
      <div className="text-base-content/80 mb-3 text-sm font-medium">
        {t('curatedRecipeUrlPreview.title')}
      </div>
      {isLoading ? (
        <div className="bg-base-200 border-base-300 rounded-lg border">
          <div className="bg-base-300 h-48 w-full animate-pulse rounded-t-lg"></div>
          <div className="p-4">
            <div className="flex items-center justify-center py-2">
              <span className="loading loading-spinner loading-md"></span>
              <span className="text-base-content/70 ml-2 text-sm">
                {t('curatedRecipeUrlPreview.loading')}
              </span>
            </div>
          </div>
        </div>
      ) : openGraph?.image?.url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="border-base-300 bg-base-100 block overflow-hidden rounded-lg border shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
        >
          <div className="bg-base-300 relative h-48 w-full">
            <Image
              src={openGraph?.image?.url ?? ''}
              alt={openGraph?.image?.alt ?? ''}
              quality={30}
              width={400}
              height={200}
              className="h-full w-full object-cover"
              style={{
                aspectRatio: '2/1',
              }}
            />
          </div>
          {(openGraph?.title || openGraph?.description) && (
            <div className="p-4">
              {openGraph?.title && (
                <h4 className="text-base-content mb-2 line-clamp-2 text-sm leading-tight font-semibold">
                  {openGraph.title}
                </h4>
              )}
              {openGraph?.description && (
                <p className="text-base-content/70 line-clamp-3 text-xs leading-relaxed">
                  {openGraph.description}
                </p>
              )}
              <div className="text-primary mt-3 flex items-center text-xs">
                <span>{t('curatedRecipeUrlPreview.link')}</span>
                <svg
                  className="ml-1 h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </div>
          )}
        </a>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-base-200 border-base-300 hover:bg-base-300 block rounded-lg border p-4 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base-content text-sm font-medium">
                {t('curatedRecipeUrlPreview.link')}
              </div>
              <div className="text-base-content/70 text-xs break-all">
                {url}
              </div>
            </div>
            <svg
              className="text-primary ml-2 h-4 w-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
        </a>
      )}
    </div>
  );
};

export default RecipeUrlPreview;

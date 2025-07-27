'use client';

import { getOpenGraph, OpenGraph } from '@/utils/getOpenGraph';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import z from 'zod';

interface CuratedRecipeMarkdownLinkProps {
  href?: string;
  children?: React.ReactNode;
}

const CuratedRecipeMarkdownLink = ({
  href,
  children,
}: CuratedRecipeMarkdownLinkProps) => {
  const [openGraph, setOpenGraph] = useState<null | OpenGraph>(null);

  useEffect(() => {
    if (!href) return;

    const fetchOpenGraphImage = async () => {
      if (openGraph) return;

      const isValidURL = z.url().safeParse(href).success;
      if (!isValidURL) return;

      try {
        const response = (await Promise.race([
          fetch('/api/recipes/url', {
            method: 'POST',
            body: JSON.stringify({ url: href }),
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          ),
        ])) as Response;

        const data = await response.json();
        if (!data?.urlHtml) return;

        const parsedOpenGraph = getOpenGraph(data.urlHtml);
        if (!parsedOpenGraph.image.url) return;

        setOpenGraph(parsedOpenGraph);
      } catch (error) {
        console.log(error);
        setOpenGraph(null);
      }
    };

    fetchOpenGraphImage();
  }, [href, openGraph]);

  if (!href) return <>{children}</>;

  return openGraph?.image?.url ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="border-base-300 bg-base-100 mt-3 mb-2 block max-w-[300px] overflow-hidden rounded-lg border shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
    >
      <div className="relative">
        <Image
          src={openGraph?.image?.url ?? ''}
          alt={openGraph?.image?.alt ?? ''}
          quality={30}
          width={300}
          height={160}
          className="h-40 w-full object-cover"
          style={{
            aspectRatio: '15/8',
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
        </div>
      )}
    </a>
  ) : (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:text-primary-focus break-all underline transition-colors duration-200"
    >
      {children}
    </a>
  );
};

export default CuratedRecipeMarkdownLink;

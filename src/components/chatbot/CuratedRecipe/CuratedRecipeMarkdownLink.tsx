"use client";

import { getOpenGraph, OpenGraph } from "@/utils/getOpenGraph";
import Image from "next/image";
import { useEffect, useState } from "react";
import z from "zod";

interface CuratedRecipeMarkdownLinkProps {
  href?: string;
  children?: React.ReactNode;
}

const CuratedRecipeMarkdownLink = ({ href, children }: CuratedRecipeMarkdownLinkProps) => {
  const [openGraph, setOpenGraph] = useState<null | OpenGraph>(null);

  useEffect(() => {
    if (!href) return;

    const fetchOpenGraphImage = async () => {
      if (openGraph) return;

      const isValidURL = z.url().safeParse(href).success;
      if (!isValidURL) return;

      try {
        const response = (await Promise.race([
          fetch("/api/recipes/url", {
            method: "POST",
            body: JSON.stringify({ url: href }),
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 5000)
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
      className="block mt-3 mb-2 max-w-[300px] rounded-lg overflow-hidden border border-base-300 bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="relative">
        <Image
          src={openGraph?.image?.url ?? ""}
          alt={openGraph?.image?.alt ?? ""}
          quality={30}
          width={300}
          height={160}
          className="w-full h-40 object-cover"
          style={{
            aspectRatio: "15/8",
          }}
        />
      </div>
      {(openGraph?.title || openGraph?.description) && (
        <div className="p-4">
          {openGraph?.title && (
            <h4 className="text-sm font-semibold text-base-content line-clamp-2 mb-2 leading-tight">
              {openGraph.title}
            </h4>
          )}
          {openGraph?.description && (
            <p className="text-xs text-base-content/70 line-clamp-3 leading-relaxed">
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
      className="text-primary hover:text-primary-focus underline break-all transition-colors duration-200"
    >
      {children}
    </a>
  );
};

export default CuratedRecipeMarkdownLink;

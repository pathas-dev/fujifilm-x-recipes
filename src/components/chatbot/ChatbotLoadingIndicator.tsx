'use client';

import { useChatStore } from '@/stores/chat';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { memo, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

const filmImages = [
  '/films/acros-film-simulation.webp',
  '/films/astia-film-simulation.jpg',
  '/films/classic-chrome-film-simulation.webp',
  '/films/classic-negative-film-simulation.webp',
  '/films/eterna-bleach-bypass-film-simulation.webp',
  '/films/eterna-film-simulation.webp',
  '/films/monochrome-standard-film-simulation.webp',
  '/films/nostalgic-neg-film-simulation.webp',
  '/films/pro-neg-high-film-simulation.webp',
  '/films/pro-neg-standard-film-simulation.webp',
  '/films/provia-film-simulation.webp',
  '/films/reala-ace-film-simulation.webp',
  '/films/velvia-film-simulation.webp',
];

// 개별 필름 프레임 컴포넌트
interface FilmFrameProps {
  src: string;
  index: number;
}

const FilmFrame = ({ src, index }: FilmFrameProps) => {
  return (
    <div className="relative h-full w-20 flex-shrink-0 border-t-2 border-r-4 border-b-2 border-stone-800 bg-stone-700 shadow-sm dark:border-stone-600 dark:bg-stone-400">
      {/* 필름 프레임 - 정사각형 */}
      <div className="absolute top-1/2 left-3 h-14 w-14 -translate-y-1/2 transform border border-stone-800 bg-stone-100 shadow-lg dark:border-stone-600 dark:bg-stone-200">
        <Image
          src={src}
          alt=""
          fill
          className="object-cover brightness-90 contrast-115 grayscale-[0.8] sepia-[0.2]"
          priority={index < 3}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      </div>
      {/* 필름 구멍들 - 위쪽 4개, 아래쪽 4개 일정한 간격으로 배치 */}
      {/* 위쪽 구멍들 */}
      <div className="absolute top-[1px] left-1/12 h-1 w-2 bg-black dark:bg-stone-900"></div>
      <div className="absolute top-[1px] left-4/12 h-1 w-2 bg-black dark:bg-stone-900"></div>
      <div className="absolute top-[1px] right-4/12 h-1 w-2 bg-black dark:bg-stone-900"></div>
      <div className="absolute top-[1px] right-1/12 h-1 w-2 bg-black dark:bg-stone-900"></div>
      {/* 아래쪽 구멍들 */}
      <div className="absolute bottom-[1px] left-1/12 h-1 w-2 bg-black dark:bg-stone-900"></div>
      <div className="absolute bottom-[1px] left-4/12 h-1 w-2 bg-black dark:bg-stone-900"></div>
      <div className="absolute right-4/12 bottom-[1px] h-1 w-2 bg-black dark:bg-stone-900"></div>
      <div className="absolute right-1/12 bottom-[1px] h-1 w-2 bg-black dark:bg-stone-900"></div>
      {/* 필름 텍스처 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stone-600/20 to-stone-700/30 dark:from-stone-300/20 dark:to-stone-400/30"></div>
    </div>
  );
};

// 필름 스트립 컴포넌트
interface FilmStripProps {
  images: string[];
}

const FilmStrip = ({ images }: FilmStripProps) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // 이미지 프리로딩
    const preloadImages = async () => {
      const imagePromises = filmImages.map(
        (src) =>
          new Promise<void>((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = src;
          })
      );

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.warn('Some film images failed to preload:', error);
        // 일부 이미지가 실패해도 애니메이션은 시작
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, []);

  {
    /* 이미지 프리로드 링크 */
  }

  return (
    <>
      <div
        className={`pointer-events-none absolute inset-0 opacity-15 transition-opacity duration-500 ${
          imagesLoaded ? 'opacity-15' : 'opacity-0'
        }`}
      >
        <div
          className={`flex h-full ${imagesLoaded ? 'film-strip' : ''}`}
          style={{
            width: `${images.length * 2 * 64}px`,
          }}
        >
          {/* 첫 번째 세트 */}
          {images.map((src, index) => (
            <FilmFrame key={`first-${index}`} src={src} index={index} />
          ))}
          {/* 두 번째 세트 (무한 루프를 위한 복제) */}
          {images.map((src, index) => (
            <FilmFrame key={`second-${index}`} src={src} index={index} />
          ))}
        </div>
      </div>
    </>
  );
};

const ChatbotLoadingIndicator = memo(function LoadingIndicator() {
  const { loadingMessage, isLoading } = useChatStore(
    useShallow((state) => ({
      loadingMessage: state.loadingMessage,
      isLoading: state.isLoading,
    }))
  );

  if (!isLoading) return null;

  return (
    <div className="animate-in slide-in-from-bottom-2 flex justify-start duration-300">
      <div className="bg-base-200 text-base-content border-base-300 message-glow bot-message-glow relative overflow-hidden rounded-2xl rounded-bl-md border px-5 py-4 shadow-sm">
        <FilmStrip images={filmImages} />

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="relative">
            <span className="loading loading-dots loading-sm text-primary"></span>
            <div className="bg-primary absolute -top-1 -right-1 h-2 w-2 animate-ping rounded-full"></div>
          </div>
        </div>
        <ElapsedTimer loadingMessage={loadingMessage} />
      </div>
    </div>
  );
});

const ElapsedTimer = ({
  loadingMessage,
}: {
  loadingMessage: string | null;
}) => {
  const t = useTranslations('Chatbot');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const startTime = Date.now();

    // 시간 업데이트 (0.1초 단위)
    const timeInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedTime(elapsed);
    }, 100);

    // 점 애니메이션 (0.5초 단위)
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="flex flex-col">
      <span className="text-base-content/80 text-sm font-medium">
        {loadingMessage}
        {dots}
      </span>
      <span className="text-base-content/60 mt-1 text-xs">
        {elapsedTime.toFixed(1)}
        {t('loadings.seconds')}
      </span>
    </div>
  );
};

export default ChatbotLoadingIndicator;

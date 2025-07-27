'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

const CuratedImageComparisonSlider = ({
  beforeImage,
  afterImage,
}: ImageComparisonSliderProps) => {
  const t = useTranslations('Chatbot');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging]);

  return (
    <div className="mb-6">
      <div className="text-base-content/80 mb-3 text-sm font-medium">
        {t('imageComparisonSlider.title')}
      </div>
      <div
        ref={containerRef}
        className="border-base-300 relative h-64 w-full cursor-col-resize overflow-hidden rounded-lg border select-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Full) */}
        <Image
          src={afterImage}
          alt={t('imageComparisonSlider.retouched')}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
          unoptimized
          width={600}
          height={450}
        />

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src={beforeImage}
            alt={t('imageComparisonSlider.source')}
            className="h-full w-full object-cover"
            draggable={false}
            unoptimized
            width={600}
            height={450}
          />
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 z-10 w-0.5 bg-white shadow-lg"
          style={{ left: `${sliderPosition}%` }}
        />

        {/* Slider Handle */}
        <div
          className="absolute top-1/2 z-20 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform cursor-col-resize items-center justify-center rounded-full border-2 border-gray-300 bg-white shadow-lg transition-transform hover:scale-110"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
        >
          <div className="flex space-x-0.5">
            <div className="h-4 w-0.5 rounded bg-gray-400"></div>
            <div className="h-4 w-0.5 rounded bg-gray-400"></div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          {t('imageComparisonSlider.source')}
        </div>
        <div className="absolute top-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          {t('imageComparisonSlider.retouched')}
        </div>
      </div>
    </div>
  );
};

export default CuratedImageComparisonSlider;

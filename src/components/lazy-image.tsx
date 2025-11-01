'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  fill,
  className = '',
  priority = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  const entry = useIntersectionObserver(imgRef, {
    threshold: 0.01,
    rootMargin: '50px',
  });

  useEffect(() => {
    if (entry?.isIntersecting && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [entry, shouldLoad]);

  // Priority images yüklensin
  if (priority && !shouldLoad) {
    setShouldLoad(true);
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={!fill ? { width, height } : undefined}
    >
      {shouldLoad ? (
        <>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onLoad={() => setIsLoaded(true)}
            priority={priority}
            sizes={sizes}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
          />
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg
            className="w-12 h-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

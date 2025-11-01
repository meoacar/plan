'use client';

import { ReactNode, Suspense } from 'react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

/**
 * Lazy Load Component
 * Viewport'a girdiğinde içeriği yükler
 */
export function LazyLoad({
  children,
  fallback = <div className="animate-pulse bg-gray-200 rounded h-32" />,
  threshold = 0.1,
  rootMargin = '50px',
  className,
}: LazyLoadProps) {
  const [ref, isIntersecting] = useIntersectionObserver<HTMLDivElement>({
    threshold,
    rootMargin,
    freezeOnceVisible: true,
  });

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? (
        <Suspense fallback={fallback}>{children}</Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}

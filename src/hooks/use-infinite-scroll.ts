import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

/**
 * Infinite scroll hook
 * Sayfa sonuna gelindiğinde otomatik olarak daha fazla veri yükler
 * 
 * @param onLoadMore - Daha fazla veri yüklemek için çağrılacak fonksiyon
 * @param options - Seçenekler
 * @returns Scroll container için ref
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>(
  onLoadMore: () => void | Promise<void>,
  options: UseInfiniteScrollOptions = {}
): React.RefObject<T> {
  const { threshold = 0.8, rootMargin = '0px', enabled = true } = options;
  const containerRef = useRef<T>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && enabled) {
        onLoadMore();
      }
    },
    [onLoadMore, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Sentinel element oluştur
    if (!sentinelRef.current) {
      sentinelRef.current = document.createElement('div');
      sentinelRef.current.style.height = '1px';
      container.appendChild(sentinelRef.current);
    }

    // Observer oluştur
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: container,
      rootMargin,
      threshold,
    });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (sentinelRef.current && container.contains(sentinelRef.current)) {
        container.removeChild(sentinelRef.current);
      }
    };
  }, [handleIntersection, threshold, rootMargin, enabled]);

  return containerRef;
}

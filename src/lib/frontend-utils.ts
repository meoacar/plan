/**
 * Frontend Optimizasyon Utility Fonksiyonları
 */

/**
 * Debounce fonksiyonu
 * Bir fonksiyonun çağrılmasını belirli bir süre geciktir
 * 
 * @param func - Debounce edilecek fonksiyon
 * @param wait - Bekleme süresi (ms)
 * @returns Debounce edilmiş fonksiyon
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle fonksiyonu
 * Bir fonksiyonun belirli bir süre içinde en fazla bir kez çağrılmasını sağlar
 * 
 * @param func - Throttle edilecek fonksiyon
 * @param limit - Limit süresi (ms)
 * @returns Throttle edilmiş fonksiyon
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Lazy load için intersection observer hook
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Image lazy loading için placeholder
 */
export function getImagePlaceholder(width: number, height: number): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='%23f3f4f6' width='${width}' height='${height}'/%3E%3C/svg%3E`;
}

/**
 * Optimistic update helper
 * Veriyi hemen güncelle, API çağrısı başarısız olursa geri al
 */
export async function optimisticUpdate<T, R>(
  currentData: T,
  optimisticData: T,
  updateFn: (data: T) => void,
  apiCall: () => Promise<R>,
  onError?: (error: Error) => void
): Promise<R | null> {
  // Optimistic update
  updateFn(optimisticData);

  try {
    // API çağrısı
    const result = await apiCall();
    return result;
  } catch (error) {
    // Hata durumunda geri al
    updateFn(currentData);
    
    if (onError) {
      onError(error as Error);
    }
    
    return null;
  }
}

/**
 * Retry logic
 * Başarısız olan API çağrılarını belirli sayıda tekrar dene
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}

/**
 * Batch updates
 * Birden fazla güncellemeyi toplu olarak yap
 */
export class BatchUpdater<T> {
  private queue: T[] = [];
  private timeout: NodeJS.Timeout | null = null;
  private batchSize: number;
  private batchDelay: number;
  private processFn: (items: T[]) => Promise<void>;

  constructor(
    processFn: (items: T[]) => Promise<void>,
    batchSize: number = 10,
    batchDelay: number = 1000
  ) {
    this.processFn = processFn;
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
  }

  add(item: T): void {
    this.queue.push(item);

    // Batch size'a ulaştıysak hemen işle
    if (this.queue.length >= this.batchSize) {
      this.flush();
      return;
    }

    // Timeout varsa temizle ve yeniden başlat
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.flush();
    }, this.batchDelay);
  }

  async flush(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const items = [...this.queue];
    this.queue = [];

    try {
      await this.processFn(items);
    } catch (error) {
      console.error('Batch processing error:', error);
      // Hata durumunda queue'ya geri ekle
      this.queue.unshift(...items);
    }
  }
}

/**
 * Virtual scroll helper
 * Büyük listeleri performanslı render etmek için
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(totalItems, start + visibleCount + overscan * 2);

  return { start, end };
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Preload image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map(src => preloadImage(src)));
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 */
export function scrollToElement(
  element: HTMLElement,
  options?: ScrollIntoViewOptions
): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    ...options,
  });
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

/**
 * Download file
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Local storage helper with expiry
 */
export const storage = {
  set(key: string, value: any, expiryMinutes?: number): void {
    const item = {
      value,
      expiry: expiryMinutes ? Date.now() + expiryMinutes * 60 * 1000 : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      
      // Check expiry
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value as T;
    } catch {
      return null;
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  },
};

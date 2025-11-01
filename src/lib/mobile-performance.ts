/**
 * Mobile Performance Utilities
 * Mobil cihazlarda performans optimizasyonu için yardımcı fonksiyonlar
 */

// Cihaz tipi tespiti
export function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Bağlantı hızı tespiti
export function getConnectionSpeed(): 'slow' | 'medium' | 'fast' {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'medium';
  }

  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType;

  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow';
  }
  if (effectiveType === '3g') {
    return 'medium';
  }
  return 'fast';
}

// Görüntü kalitesi ayarı
export function getOptimalImageQuality(): number {
  const speed = getConnectionSpeed();
  const deviceType = getDeviceType();

  if (speed === 'slow') return 50;
  if (speed === 'medium') return 70;
  if (deviceType === 'mobile') return 75;
  return 85;
}

// Lazy loading threshold
export function getLazyLoadThreshold(): string {
  const speed = getConnectionSpeed();
  
  if (speed === 'slow') return '200px';
  if (speed === 'medium') return '100px';
  return '50px';
}

// Animasyon devre dışı bırakma
export function shouldReduceAnimations(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

// Batarya durumu kontrolü
export async function getBatteryLevel(): Promise<number | null> {
  if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
    return null;
  }

  try {
    const battery = await (navigator as any).getBattery();
    return battery.level;
  } catch {
    return null;
  }
}

// Düşük güç modunda mı?
export async function isLowPowerMode(): Promise<boolean> {
  const batteryLevel = await getBatteryLevel();
  if (batteryLevel === null) return false;
  
  return batteryLevel < 0.2; // %20'nin altında
}

// Performans metrikleri
export function measurePerformance(metricName: string) {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  const startMark = `${metricName}-start`;
  const endMark = `${metricName}-end`;
  
  return {
    start: () => {
      performance.mark(startMark);
    },
    end: () => {
      performance.mark(endMark);
      performance.measure(metricName, startMark, endMark);
      
      const measure = performance.getEntriesByName(metricName)[0];
      console.log(`${metricName}: ${measure.duration.toFixed(2)}ms`);
      
      // Cleanup
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(metricName);
      
      return measure.duration;
    },
  };
}

// Throttle fonksiyonu (scroll, resize için)
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Debounce fonksiyonu (input, search için)
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Request Idle Callback wrapper
export function requestIdleCallback(callback: () => void, timeout = 2000) {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

// Prefetch stratejisi
export function prefetchOnIdle(urls: string[]) {
  requestIdleCallback(() => {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  });
}

// Memory kullanımı
export function getMemoryUsage(): number | null {
  if (typeof window === 'undefined' || !('performance' in window)) return null;
  
  const memory = (performance as any).memory;
  if (!memory) return null;
  
  return Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
}

// Optimal chunk size hesaplama
export function getOptimalChunkSize(): number {
  const deviceType = getDeviceType();
  const speed = getConnectionSpeed();
  
  if (deviceType === 'mobile' && speed === 'slow') return 10;
  if (deviceType === 'mobile' && speed === 'medium') return 20;
  if (deviceType === 'mobile') return 30;
  return 50;
}

// Viewport boyutları
export function getViewportSize() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

// Touch device kontrolü
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

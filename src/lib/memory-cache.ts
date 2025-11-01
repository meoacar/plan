/**
 * In-Memory Cache Helper
 * 
 * Redis olmadan basit cache implementasyonu.
 * Production'da Redis/Vercel KV kullanılması önerilir.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Her 5 dakikada bir expired cache'leri temizle
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Cache'e veri ekle
   */
  set<T>(key: string, data: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Cache'den veri al
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Expired kontrolü
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Cache'den veri sil
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Pattern'e göre cache'leri sil
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Tüm cache'i temizle
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Expired cache'leri temizle
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Cache istatistikleri
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Cleanup interval'i durdur
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
const memoryCache = new MemoryCache();

/**
 * Cache helper fonksiyonu
 * Veriyi cache'den al, yoksa fetch et ve cache'e ekle
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  // Cache'den kontrol et
  const cached = memoryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch et
  const data = await fetcher();

  // Cache'e ekle
  memoryCache.set(key, data, ttlSeconds);

  return data;
}

/**
 * Cache'den veri al
 */
export function getFromCache<T>(key: string): T | null {
  return memoryCache.get<T>(key);
}

/**
 * Cache'e veri ekle
 */
export function setToCache<T>(key: string, data: T, ttlSeconds: number): void {
  memoryCache.set(key, data, ttlSeconds);
}

/**
 * Cache'den veri sil
 */
export function deleteFromCache(key: string): void {
  memoryCache.delete(key);
}

/**
 * Pattern'e göre cache'leri sil
 */
export function deleteCachePattern(pattern: string): void {
  memoryCache.deletePattern(pattern);
}

/**
 * Tüm cache'i temizle
 */
export function clearAllCache(): void {
  memoryCache.clear();
}

/**
 * Cache istatistikleri
 */
export function getCacheStats() {
  return memoryCache.getStats();
}

export default memoryCache;

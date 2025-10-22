/**
 * Cache Stratejileri ve Revalidation Ayarları
 * 
 * Bu dosya, uygulamanın farklı bölümleri için cache sürelerini tanımlar.
 */

// Cache süreleri (saniye cinsinden)
export const CACHE_TIMES = {
  // Statik içerik - 1 saat
  STATIC: 3600,
  
  // Site ayarları - 1 saat
  SETTINGS: 3600,
  
  // Kategoriler ve etiketler - 30 dakika
  CATEGORIES: 1800,
  TAGS: 1800,
  
  // Analitik veriler - 5 dakika
  ANALYTICS: 300,
  
  // Planlar listesi - 5 dakika
  PLANS_LIST: 300,
  
  // Tek plan detayı - 10 dakika
  PLAN_DETAIL: 600,
  
  // Kullanıcı profili - 5 dakika
  USER_PROFILE: 300,
  
  // Yorumlar - 2 dakika
  COMMENTS: 120,
  
  // Activity log - cache yok (real-time)
  ACTIVITY_LOG: 0,
  
  // Email kampanyaları - cache yok
  EMAIL_CAMPAIGNS: 0,
} as const;

// Revalidation tag'leri
export const CACHE_TAGS = {
  PLANS: 'plans',
  PLAN: (id: string) => `plan-${id}`,
  CATEGORIES: 'categories',
  TAGS: 'tags',
  SETTINGS: 'settings',
  USERS: 'users',
  USER: (id: string) => `user-${id}`,
  COMMENTS: 'comments',
  ANALYTICS: 'analytics',
} as const;

/**
 * Cache'i temizleme fonksiyonları
 */
import { revalidateTag, revalidatePath } from 'next/cache';

export async function invalidatePlansCache() {
  revalidateTag(CACHE_TAGS.PLANS);
  revalidatePath('/');
  revalidatePath('/plans');
}

export async function invalidatePlanCache(planId: string) {
  revalidateTag(CACHE_TAGS.PLAN(planId));
  revalidateTag(CACHE_TAGS.PLANS);
  revalidatePath('/');
}

export async function invalidateCategoriesCache() {
  revalidateTag(CACHE_TAGS.CATEGORIES);
  revalidatePath('/');
}

export async function invalidateTagsCache() {
  revalidateTag(CACHE_TAGS.TAGS);
}

export async function invalidateSettingsCache() {
  revalidateTag(CACHE_TAGS.SETTINGS);
  revalidatePath('/');
}

export async function invalidateUserCache(userId: string) {
  revalidateTag(CACHE_TAGS.USER(userId));
  revalidateTag(CACHE_TAGS.USERS);
}

export async function invalidateCommentsCache() {
  revalidateTag(CACHE_TAGS.COMMENTS);
}

export async function invalidateAnalyticsCache() {
  revalidateTag(CACHE_TAGS.ANALYTICS);
}

/**
 * Tüm cache'i temizle
 */
export async function invalidateAllCache() {
  revalidatePath('/', 'layout');
}

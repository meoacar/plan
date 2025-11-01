/**
 * Grup Özellikleri için Validation Şemaları
 * 
 * Bu dosya, tüm grup API'leri için Zod validation şemalarını içerir.
 */

import { z } from 'zod';

// ============================================
// Enum Validations
// ============================================

export const GroupPostTypeSchema = z.enum([
  'UPDATE',
  'ACHIEVEMENT',
  'MOTIVATION',
  'PROGRESS',
  'PHOTO',
]);

export const GroupMessageTypeSchema = z.enum([
  'TEXT',
  'EMOJI',
  'GIF',
  'SYSTEM',
]);

export const GroupEventTypeSchema = z.enum([
  'MEETUP',
  'WEBINAR',
  'WORKSHOP',
  'CHALLENGE',
  'OTHER',
]);

export const ParticipantStatusSchema = z.enum([
  'GOING',
  'MAYBE',
  'NOT_GOING',
]);

export const LeaderboardPeriodSchema = z.enum([
  'WEEKLY',
  'MONTHLY',
  'ALL_TIME',
]);

export const GroupResourceTypeSchema = z.enum([
  'VIDEO',
  'RECIPE',
  'EXERCISE',
  'PDF',
  'ARTICLE',
  'LINK',
]);

export const GroupMemberRoleSchema = z.enum([
  'ADMIN',
  'MODERATOR',
  'MEMBER',
]);

// ============================================
// Grup Akışı ve Paylaşım Validations
// ============================================

export const createGroupPostSchema = z.object({
  content: z
    .string()
    .min(1, 'İçerik boş olamaz')
    .max(5000, 'İçerik en fazla 5000 karakter olabilir'),
  imageUrl: z.string().url('Geçerli bir URL girin').optional(),
  postType: GroupPostTypeSchema.default('UPDATE'),
  metadata: z.record(z.any()).optional(),
});

export const createGroupCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Yorum boş olamaz')
    .max(1000, 'Yorum en fazla 1000 karakter olabilir'),
});

export const groupPostQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

// ============================================
// Mesajlaşma Validations
// ============================================

export const createGroupMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Mesaj boş olamaz')
    .max(1000, 'Mesaj en fazla 1000 karakter olabilir'),
  messageType: GroupMessageTypeSchema.default('TEXT'),
  metadata: z.record(z.any()).optional(),
});

export const groupMessageQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// ============================================
// Üye Yönetimi Validations
// ============================================

export const updateMemberRoleSchema = z.object({
  role: GroupMemberRoleSchema,
});

export const groupMemberQuerySchema = z.object({
  role: GroupMemberRoleSchema.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ============================================
// Etkinlik Validations
// ============================================

export const createGroupEventSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Başlık en az 3 karakter olmalı')
      .max(100, 'Başlık en fazla 100 karakter olabilir'),
    description: z
      .string()
      .max(2000, 'Açıklama en fazla 2000 karakter olabilir')
      .optional(),
    eventType: GroupEventTypeSchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z
      .string()
      .max(500, 'Konum en fazla 500 karakter olabilir')
      .optional(),
    maxParticipants: z.coerce.number().min(1).max(1000).optional(),
  })
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: 'Bitiş tarihi başlangıç tarihinden sonra olmalı',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      return data.startDate > new Date();
    },
    {
      message: 'Başlangıç tarihi gelecekte olmalı',
      path: ['startDate'],
    }
  );

export const updateGroupEventSchema = createGroupEventSchema.partial();

export const updateEventParticipantStatusSchema = z.object({
  status: ParticipantStatusSchema,
});

export const groupEventQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  eventType: GroupEventTypeSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ============================================
// Liderlik Tablosu Validations
// ============================================

export const leaderboardQuerySchema = z.object({
  period: LeaderboardPeriodSchema.default('WEEKLY'),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ============================================
// İstatistik Validations
// ============================================

export const groupStatsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// ============================================
// Kaynak Kütüphanesi Validations
// ============================================

export const createGroupResourceSchema = z.object({
  title: z
    .string()
    .min(3, 'Başlık en az 3 karakter olmalı')
    .max(200, 'Başlık en fazla 200 karakter olabilir'),
  description: z
    .string()
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .optional(),
  resourceType: GroupResourceTypeSchema,
  url: z.string().url('Geçerli bir URL girin').optional(),
  fileUrl: z.string().url('Geçerli bir URL girin').optional(),
  content: z.string().max(10000, 'İçerik en fazla 10000 karakter olabilir').optional(),
  category: z
    .string()
    .min(2, 'Kategori en az 2 karakter olmalı')
    .max(50, 'Kategori en fazla 50 karakter olabilir'),
  tags: z.array(z.string().max(30)).max(10, 'En fazla 10 etiket eklenebilir').optional(),
}).refine(
  (data) => {
    // En az bir içerik türü olmalı
    return data.url || data.fileUrl || data.content;
  },
  {
    message: 'URL, dosya veya içerik alanlarından en az biri dolu olmalı',
    path: ['url'],
  }
);

export const groupResourceQuerySchema = z.object({
  category: z.string().optional(),
  resourceType: GroupResourceTypeSchema.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ============================================
// Haftalık Hedef Validations
// ============================================

export const createWeeklyGoalSchema = z.object({
  title: z
    .string()
    .min(3, 'Başlık en az 3 karakter olmalı')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),
  description: z
    .string()
    .max(500, 'Açıklama en fazla 500 karakter olabilir')
    .optional(),
  targetType: z
    .string()
    .min(2, 'Hedef türü en az 2 karakter olmalı')
    .max(50, 'Hedef türü en fazla 50 karakter olabilir'),
  targetValue: z.coerce.number().min(0, 'Hedef değer 0 veya daha büyük olmalı'),
  weekStart: z.coerce.date(),
  weekEnd: z.coerce.date(),
}).refine(
  (data) => {
    return data.weekEnd > data.weekStart;
  },
  {
    message: 'Bitiş tarihi başlangıç tarihinden sonra olmalı',
    path: ['weekEnd'],
  }
);

export const updateGoalProgressSchema = z.object({
  value: z.coerce.number().min(0, 'İlerleme değeri 0 veya daha büyük olmalı'),
});

// ============================================
// Grup Arama ve Filtreleme Validations
// ============================================

export const groupSearchQuerySchema = z.object({
  q: z.string().optional(),
  goalType: z.string().optional(),
  minMembers: z.coerce.number().min(0).optional(),
  maxMembers: z.coerce.number().min(0).optional(),
  activityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  city: z.string().optional(),
  category: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'MIXED']).optional(),
  ageGroup: z.enum(['18-25', '26-35', '36-45', '46+']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

// ============================================
// Grup Önizleme Validations
// ============================================

export const groupPreviewQuerySchema = z.object({
  includeActivities: z.coerce.boolean().default(true),
  includePosts: z.coerce.boolean().default(true),
  includeTestimonials: z.coerce.boolean().default(true),
  includeStats: z.coerce.boolean().default(true),
});

// ============================================
// Content Sanitization
// ============================================

/**
 * HTML içeriğini temizler (XSS prevention)
 * DOMPurify kullanımı önerilir
 */
export function sanitizeContent(content: string): string {
  // Basit sanitization - production'da DOMPurify kullanılmalı
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * URL'yi doğrular ve temizler
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Sadece http ve https protokollerine izin ver
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    throw new Error('Geçersiz URL');
  }
}

/**
 * Dosya adını temizler
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

/**
 * Etiketleri temizler ve normalize eder
 */
export function sanitizeTags(tags: string[]): string[] {
  return tags
    .map((tag) =>
      tag
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '')
    )
    .filter((tag) => tag.length >= 2 && tag.length <= 30)
    .slice(0, 10);
}

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Zod şemasını kullanarak veriyi doğrular
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Zod hatalarını kullanıcı dostu mesajlara çevirir
 */
export function formatValidationErrors(errors: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  errors.errors.forEach((error) => {
    const path = error.path.join('.');
    formatted[path] = error.message;
  });
  
  return formatted;
}

/**
 * API yanıtı için validation hatası oluşturur
 */
export function createValidationErrorResponse(errors: z.ZodError): Response {
  return new Response(
    JSON.stringify({
      error: {
        message: 'Validation hatası',
        code: 'VALIDATION_ERROR',
        details: formatValidationErrors(errors),
      },
    }),
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

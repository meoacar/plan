/**
 * Content Sanitization Utilities
 * 
 * XSS saldırılarını önlemek için içerik temizleme fonksiyonları
 * 
 * Production için DOMPurify kullanımı önerilir:
 * npm install isomorphic-dompurify
 */

// ============================================
// Basit Sanitization (DOMPurify olmadan)
// ============================================

/**
 * HTML içeriğini temizler
 * Tehlikeli HTML etiketlerini ve script'leri kaldırır
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  return html
    // Script etiketlerini kaldır
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Iframe etiketlerini kaldır
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Object etiketlerini kaldır
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    // Embed etiketlerini kaldır
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    // Event handler'ları kaldır (onclick, onload, vb.)
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    // Javascript: protokolünü kaldır
    .replace(/javascript:/gi, '')
    // Data: protokolünü kaldır (base64 image hariç)
    .replace(/data:(?!image\/)/gi, '')
    // Style etiketlerini kaldır
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .trim();
}

/**
 * Metin içeriğini temizler
 * HTML etiketlerini tamamen kaldırır
 */
export function sanitizeText(text: string): string {
  if (!text) return '';

  return text
    .replace(/<[^>]*>/g, '') // Tüm HTML etiketlerini kaldır
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

/**
 * URL'yi doğrular ve temizler
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    
    // Sadece güvenli protokollere izin ver
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }

    // Javascript: ve data: protokollerini engelle
    if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
      throw new Error('Dangerous protocol');
    }

    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Markdown içeriğini temizler
 * Tehlikeli HTML'i kaldırır ama güvenli markdown'a izin verir
 */
export function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return '';

  // Önce HTML'i temizle
  let cleaned = sanitizeHtml(markdown);

  // Tehlikeli markdown linklerini temizle
  cleaned = cleaned.replace(/\[([^\]]+)\]\(javascript:[^\)]*\)/gi, '[$1](#)');
  cleaned = cleaned.replace(/\[([^\]]+)\]\(data:[^\)]*\)/gi, '[$1](#)');

  return cleaned.trim();
}

/**
 * Dosya adını temizler
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Özel karakterleri _ ile değiştir
    .replace(/_{2,}/g, '_') // Ardışık _ karakterlerini tek _ yap
    .replace(/^[._-]+/, '') // Başındaki özel karakterleri kaldır
    .replace(/[._-]+$/, '') // Sonundaki özel karakterleri kaldır
    .substring(0, 255); // Maksimum 255 karakter
}

/**
 * Email adresini doğrular ve temizler
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  const cleaned = email.toLowerCase().trim();
  
  // Basit email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(cleaned)) {
    throw new Error('Geçersiz email adresi');
  }

  return cleaned;
}

/**
 * Telefon numarasını temizler
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';

  // Sadece rakamları ve + işaretini tut
  return phone.replace(/[^0-9+]/g, '');
}

/**
 * Etiketleri temizler ve normalize eder
 */
export function sanitizeTags(tags: string[]): string[] {
  if (!tags || !Array.isArray(tags)) return [];

  return tags
    .map((tag) =>
      tag
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '') // Sadece harf, rakam ve tire
        .replace(/-{2,}/g, '-') // Ardışık tireleri tek tire yap
    )
    .filter((tag) => tag.length >= 2 && tag.length <= 30) // 2-30 karakter arası
    .filter((tag, index, self) => self.indexOf(tag) === index) // Tekrarları kaldır
    .slice(0, 10); // Maksimum 10 etiket
}

/**
 * JSON içeriğini temizler
 */
export function sanitizeJson(json: any): any {
  if (typeof json === 'string') {
    return sanitizeText(json);
  }

  if (Array.isArray(json)) {
    return json.map(sanitizeJson);
  }

  if (typeof json === 'object' && json !== null) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(json)) {
      cleaned[sanitizeText(key)] = sanitizeJson(value);
    }
    return cleaned;
  }

  return json;
}

/**
 * SQL injection'a karşı string temizler
 */
export function sanitizeSql(input: string): string {
  if (!input) return '';

  return input
    .replace(/['";\\]/g, '') // Tehlikeli karakterleri kaldır
    .replace(/--/g, '') // SQL yorumlarını kaldır
    .replace(/\/\*/g, '') // Çok satırlı yorumları kaldır
    .replace(/\*\//g, '')
    .trim();
}

// ============================================
// DOMPurify Integration (Production için)
// ============================================

/*
// Production'da bu kodu kullanın:

import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtmlWithDOMPurify(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

export function sanitizeMarkdownWithDOMPurify(markdown: string): string {
  // Markdown'ı HTML'e çevir (örn: marked kütüphanesi ile)
  // Sonra DOMPurify ile temizle
  return DOMPurify.sanitize(markdown, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt'],
    ALLOW_DATA_ATTR: false,
  });
}
*/

// ============================================
// Validation Helpers
// ============================================

/**
 * İçeriğin güvenli olup olmadığını kontrol eder
 */
export function isContentSafe(content: string): boolean {
  if (!content) return true;

  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(content));
}

/**
 * URL'in güvenli olup olmadığını kontrol eder
 */
export function isUrlSafe(url: string): boolean {
  if (!url) return true;

  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Dosya uzantısının güvenli olup olmadığını kontrol eder
 */
export function isFileExtensionSafe(filename: string): boolean {
  if (!filename) return false;

  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
    '.jar', '.msi', '.app', '.deb', '.rpm', '.dmg', '.pkg'
  ];

  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return !dangerousExtensions.includes(ext);
}

/**
 * MIME type'ın güvenli olup olmadığını kontrol eder
 */
export function isMimeTypeSafe(mimeType: string): boolean {
  if (!mimeType) return false;

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'text/markdown',
    'video/mp4',
    'video/webm',
  ];

  return allowedMimeTypes.includes(mimeType.toLowerCase());
}

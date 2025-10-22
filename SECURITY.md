# Security Audit & Best Practices

Bu doküman, Zayıflama Planım uygulamasının güvenlik kontrollerini ve best practice'lerini içerir.

## 1. Authentication & Authorization

### ✅ Mevcut Güvenlik Önlemleri

#### NextAuth v5 Kullanımı

```typescript
// auth.config.ts
export const authConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        // Şifre hash kontrolü
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;
        return user;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
};
```

#### Admin Middleware

```typescript
// lib/admin-auth.ts
export async function requireAdmin() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden - Admin access required");
  }

  return session;
}
```

#### API Route Protection

```typescript
// app/api/admin/*/route.ts
export async function GET(request: Request) {
  try {
    await requireAdmin();
    // Admin işlemleri
  } catch (error) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

### 🔒 Güvenlik Kontrolleri

- [x] Şifreler bcrypt ile hash'leniyor
- [x] JWT token kullanılıyor
- [x] Session süresi sınırlı (30 gün)
- [x] Admin route'ları korunuyor
- [x] Role-based access control (RBAC) var
- [ ] Two-factor authentication (2FA) - Gelecek özellik
- [ ] Password reset token expiry - Kontrol edilmeli
- [ ] Account lockout after failed attempts - Eklenebilir

## 2. Input Validation

### ✅ Mevcut Validasyon

#### Zod Schema Validation

```typescript
// lib/validations.ts
export const categorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const emailCampaignSchema = z.object({
  subject: z.string().min(5).max(200),
  content: z.string().min(10),
  recipients: z.enum(["ALL", "ADMIN", "USER"]),
});

export const bannedWordSchema = z.object({
  word: z.string().min(2).max(50).toLowerCase(),
});
```

#### API Route Validation

```typescript
// app/api/admin/categories/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // Validate input
  const validatedData = categorySchema.parse(body);

  // Proceed with validated data
  const category = await prisma.category.create({
    data: validatedData,
  });

  return Response.json(category);
}
```

### 🔒 Güvenlik Kontrolleri

- [x] Tüm form input'ları validate ediliyor
- [x] API route'larında server-side validation var
- [x] SQL injection koruması (Prisma ORM)
- [x] XSS koruması (React otomatik escape)
- [x] CSRF koruması (NextAuth)
- [ ] File upload validation - Kontrol edilmeli
- [ ] Max request size limit - Eklenebilir
- [ ] Content-Type validation - Eklenebilir

## 3. Rate Limiting

### ⚠️ Eksik - Uygulanmalı

#### Önerilen Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Genel API rate limit
export const apiRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 request/dakika
  analytics: true,
});

// Auth rate limit (daha sıkı)
export const authRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 deneme/15 dakika
  analytics: true,
});

// Email rate limit
export const emailRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 email/saat
  analytics: true,
});

// Backup rate limit
export const backupRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 backup/saat
  analytics: true,
});
```

#### Middleware Kullanımı

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiRateLimit } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  // Rate limiting
  if (request.nextUrl.pathname.startsWith("/api")) {
    const ip = request.ip ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await apiRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
```

### 🔒 Rate Limiting Kontrolleri

- [ ] Genel API rate limiting - **Uygulanmalı**
- [ ] Auth endpoint rate limiting - **Uygulanmalı**
- [ ] Email gönderim rate limiting - **Uygulanmalı**
- [ ] Backup oluşturma rate limiting - **Uygulanmalı**
- [ ] IP-based rate limiting - **Uygulanmalı**
- [ ] User-based rate limiting - **Uygulanmalı**

## 4. Data Protection

### ✅ Mevcut Korumalar

#### Environment Variables

```env
# Hassas bilgiler .env dosyasında
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_SECRET="..."
RESEND_API_KEY="..."
```

#### .gitignore

```gitignore
# Hassas dosyalar git'e commit edilmiyor
.env
.env.local
.env*.local
```

#### Password Hashing

```typescript
// Şifreler hash'leniyor
import bcrypt from "bcryptjs";

const hashedPassword = await bcrypt.hash(password, 10);
```

### 🔒 Güvenlik Kontrolleri

- [x] Environment variables güvenli
- [x] .env dosyası .gitignore'da
- [x] Şifreler hash'li
- [x] Database connection encrypted (SSL)
- [ ] Sensitive data encryption at rest - Kontrol edilmeli
- [ ] PII data masking in logs - Eklenebilir
- [ ] Backup encryption - Eklenebilir

## 5. Cron Job Security

### ✅ Mevcut Koruma

#### CRON_SECRET Kontrolü

```typescript
// app/api/cron/email-queue/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cron job işlemleri
}
```

### 🔒 Güvenlik Kontrolleri

- [x] Cron endpoint'leri CRON_SECRET ile korunuyor
- [x] Authorization header kontrolü var
- [ ] IP whitelist (Vercel IP'leri) - Eklenebilir
- [ ] Request signature verification - Eklenebilir

## 6. Content Security

### ✅ Mevcut Korumalar

#### Content Moderation

```typescript
// lib/moderation.ts
export async function checkContent(text: string) {
  const bannedWords = await prisma.bannedWord.findMany();

  const found = bannedWords.filter((w) =>
    text.toLowerCase().includes(w.word.toLowerCase())
  );

  return {
    isClean: found.length === 0,
    bannedWords: found.map((w) => w.word),
  };
}
```

#### XSS Protection

```typescript
// React otomatik escape ediyor
<div>{userInput}</div> // Güvenli

// HTML render ederken dikkat
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} /> // Sanitize edilmeli
```

### 🔒 Güvenlik Kontrolleri

- [x] Banned words sistemi var
- [x] React XSS koruması aktif
- [ ] HTML sanitization (rich text editor) - **Kontrol edilmeli**
- [ ] File upload validation - **Eklenebilir**
- [ ] Image upload virus scan - Gelecek özellik
- [ ] URL validation - Eklenebilir

## 7. API Security

### ✅ Mevcut Korumalar

#### Error Handling

```typescript
// Detaylı hata mesajları production'da gizleniyor
export async function GET(request: Request) {
  try {
    // İşlemler
  } catch (error) {
    console.error(error); // Log'a yaz
    return Response.json(
      { error: "Internal server error" }, // Generic mesaj
      { status: 500 }
    );
  }
}
```

#### CORS

```typescript
// Next.js otomatik CORS koruması
// Sadece same-origin isteklere izin verir
```

### 🔒 Güvenlik Kontrolleri

- [x] Error handling var
- [x] Generic error messages (production)
- [x] CORS koruması aktif
- [ ] Request size limit - **Eklenebilir**
- [ ] Request timeout - **Eklenebilir**
- [ ] API versioning - Gelecek özellik

## 8. Database Security

### ✅ Mevcut Korumalar

#### Prisma ORM

```typescript
// SQL injection koruması
const user = await prisma.user.findUnique({
  where: { email: userInput }, // Güvenli - parameterized query
});

// ❌ Asla raw SQL kullanma
// await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`
```

#### Connection Security

```env
# SSL connection
DATABASE_URL="postgresql://...?sslmode=require"
```

### 🔒 Güvenlik Kontrolleri

- [x] Prisma ORM kullanılıyor (SQL injection koruması)
- [x] Database connection SSL ile
- [x] Connection pooling var
- [ ] Database user permissions - Kontrol edilmeli
- [ ] Read-only replicas - Gelecek özellik
- [ ] Database backup encryption - Eklenebilir

## 9. Session Security

### ✅ Mevcut Korumalar

#### JWT Configuration

```typescript
// auth.config.ts
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 gün
  updateAge: 24 * 60 * 60, // 24 saatte bir güncelle
}
```

#### Cookie Security

```typescript
cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true // HTTPS'de
    }
  }
}
```

### 🔒 Güvenlik Kontrolleri

- [x] JWT kullanılıyor
- [x] Session expiry var
- [x] HttpOnly cookies
- [x] Secure flag (HTTPS)
- [x] SameSite protection
- [ ] Session invalidation on logout - Kontrol edilmeli
- [ ] Concurrent session limit - Eklenebilir

## 10. Logging & Monitoring

### ✅ Mevcut Sistem

#### Activity Log

```typescript
// lib/activity-logger.ts
export async function logActivity({
  userId,
  type,
  description,
  metadata,
  request,
}) {
  await prisma.activityLog.create({
    data: {
      userId,
      type,
      description,
      metadata,
      ipAddress: request?.headers.get("x-forwarded-for"),
      userAgent: request?.headers.get("user-agent"),
    },
  });
}
```

### 🔒 Güvenlik Kontrolleri

- [x] Activity logging var
- [x] IP adresi kaydediliyor
- [x] User agent kaydediliyor
- [ ] Failed login attempts logging - **Eklenebilir**
- [ ] Suspicious activity alerts - Gelecek özellik
- [ ] Security event monitoring - Gelecek özellik

## Security Checklist

### Kritik (Hemen Yapılmalı)

- [ ] **Rate limiting uygula** (auth, API, email)
- [ ] **HTML sanitization** kontrol et (rich text editor)
- [ ] **File upload validation** ekle
- [ ] **Request size limit** ekle
- [ ] **Failed login attempt tracking** ekle

### Önemli (Yakında Yapılmalı)

- [ ] Password reset token expiry kontrol et
- [ ] Account lockout mechanism ekle
- [ ] IP whitelist for cron jobs
- [ ] Database backup encryption
- [ ] PII data masking in logs

### İyileştirme (Gelecek)

- [ ] Two-factor authentication (2FA)
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] Penetration testing
- [ ] Security audit (third-party)
- [ ] Bug bounty program

## Security Headers

### Önerilen Headers

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

## Incident Response Plan

### 1. Security Breach Detected

1. **Immediate Actions**
   - Maintenance mode'u aktif et
   - Tüm session'ları invalidate et
   - Şüpheli IP'leri engelle

2. **Investigation**
   - Activity log'u incele
   - Database'i kontrol et
   - Affected users'ı belirle

3. **Remediation**
   - Güvenlik açığını kapat
   - Şifreleri reset et
   - Kullanıcıları bilgilendir

4. **Post-Mortem**
   - Incident report yaz
   - Önleyici tedbirler al
   - Security audit yap

### 2. Data Breach

1. **Containment**
   - Breach'i durdur
   - Backup'tan restore et
   - Affected data'yı belirle

2. **Notification**
   - Kullanıcıları bilgilendir
   - Yasal gereklilikleri yerine getir
   - Public statement hazırla

3. **Recovery**
   - Sistemleri restore et
   - Security measures güçlendir
   - Monitoring artır

## Regular Security Tasks

### Günlük

- [ ] Activity log'u kontrol et
- [ ] Failed login attempts'i incele
- [ ] Error logs'u kontrol et

### Haftalık

- [ ] Security alerts'i incele
- [ ] Backup'ları test et
- [ ] Rate limit metrics'i kontrol et

### Aylık

- [ ] Dependency updates (npm audit)
- [ ] Security patch'leri uygula
- [ ] Access control review
- [ ] Password policy review

### Yıllık

- [ ] Full security audit
- [ ] Penetration testing
- [ ] Disaster recovery drill
- [ ] Security training

## Contact

Security issues için:
- Email: security@zayiflamaplanim.com
- Response time: 24 saat içinde

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [Vercel Security](https://vercel.com/docs/security)

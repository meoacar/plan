# Monitoring ve Logging Kurulumu

Bu doküman, grup sistemi için monitoring ve logging altyapısının kurulumunu açıklar.

## 📊 Mevcut Özellikler

### 1. API Logging
- Tüm API istekleri otomatik olarak loglanır
- İstek süresi, durum kodu ve hata bilgileri kaydedilir
- Development'ta console'da renkli loglar
- Production'da yapılandırılmış JSON logları

**Kullanım:**
```typescript
import { withApiLogger } from '@/lib/api-logger';

export const GET = withApiLogger(async (request: Request) => {
  // Your handler code
});
```

### 2. Performance Monitoring
- Kritik operasyonların performansı izlenir
- Yavaş operasyonlar otomatik olarak uyarı verir (>1000ms)
- P50, P95, P99 metrikleri

**Kullanım:**
```typescript
import { measurePerformance } from '@/lib/api-logger';

const result = await measurePerformance('group-stats-calculation', async () => {
  return await calculateGroupStats(groupId);
});
```

### 3. Error Tracking
- Merkezi hata yönetimi
- Hata istatistikleri ve raporlama
- Sentry entegrasyonu için hazır

**Kullanım:**
```typescript
import { errorTracker, AppError } from '@/lib/error-tracking';

try {
  // Your code
} catch (error) {
  errorTracker.track(error, {
    userId: session.user.id,
    groupId: groupId,
    action: 'create-post',
  });
  throw error;
}
```

### 4. Cache Monitoring
- Redis/Memory cache kullanımı
- Cache hit/miss oranları
- Otomatik fallback

### 5. Admin Monitoring Dashboard
- `/api/admin/monitoring` endpoint'i
- Sistem sağlığı ve performans metrikleri
- Sadece admin kullanıcılar erişebilir

## 🚀 Kurulum

### Temel Kurulum (Ücretsiz)

Mevcut sistem ek kurulum gerektirmez. Tüm loglar Vercel'in built-in logging sistemine gider.

**Vercel Logs'a Erişim:**
1. Vercel Dashboard > Your Project > Logs
2. Gerçek zamanlı log akışı
3. Filtreleme ve arama

### Gelişmiş Kurulum (Opsiyonel)

#### 1. Sentry Entegrasyonu (Önerilen)

**Adımlar:**
```bash
# 1. Sentry paketini yükle
npm install @sentry/nextjs

# 2. Sentry wizard'ı çalıştır
npx @sentry/wizard@latest -i nextjs

# 3. .env.local dosyasına ekle
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-auth-token
```

**Özellikler:**
- Otomatik hata yakalama
- Performance monitoring
- Session replay
- Release tracking
- Source maps

**Maliyet:** Ücretsiz tier (5,000 errors/month)

#### 2. Vercel Analytics

**Adımlar:**
```bash
# 1. Paketi yükle
npm install @vercel/analytics

# 2. _app.tsx veya layout.tsx'e ekle
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Özellikler:**
- Sayfa görüntüleme istatistikleri
- Kullanıcı akışı
- Conversion tracking

**Maliyet:** Vercel Pro plan ile birlikte gelir

#### 3. Vercel Speed Insights

**Adımlar:**
```bash
# 1. Paketi yükle
npm install @vercel/speed-insights

# 2. Layout'a ekle
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Özellikler:**
- Core Web Vitals
- Real User Monitoring (RUM)
- Performance scoring

#### 4. Redis/Vercel KV (Cache)

**Adımlar:**
```bash
# 1. Vercel KV oluştur
# Vercel Dashboard > Storage > Create Database > KV

# 2. Environment variables otomatik eklenir:
# KV_URL
# KV_REST_API_URL
# KV_REST_API_TOKEN
# KV_REST_API_READ_ONLY_TOKEN

# 3. Paketi yükle
npm install @upstash/redis
```

**Kullanım:**
Cache sistemi otomatik olarak Redis'i algılar ve kullanır.

**Maliyet:** Ücretsiz tier (10,000 commands/day)

## 📈 Monitoring Endpoints

### Admin Dashboard
```
GET /api/admin/monitoring
Authorization: Admin user only (ADMIN_EMAIL env variable)

Response:
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "api": {
    "totalRequests": 1000,
    "recentRequests": 50,
    "errorRate": 2.5,
    "avgDuration": 150
  },
  "recentErrors": [...],
  "performance": {...},
  "database": {
    "totalUsers": 500,
    "totalGroups": 50,
    "activeGroups": 30
  },
  "system": {...}
}
```

## 🔍 Log Analizi

### Vercel Logs'ta Arama

**Hata logları:**
```
"statusCode":500
```

**Yavaş istekler:**
```
"duration">1000
```

**Belirli endpoint:**
```
"path":"/api/groups"
```

**Kullanıcı bazlı:**
```
"userId":"user_123"
```

## 🚨 Alerting (Opsiyonel)

### Vercel Monitoring Alerts

1. Vercel Dashboard > Settings > Monitoring
2. Alert kuralları oluştur:
   - Error rate > 5%
   - Response time > 2s
   - Deployment failures

### Sentry Alerts

1. Sentry Dashboard > Alerts
2. Alert kuralları:
   - New error types
   - Error spike (>100 in 1 hour)
   - Performance degradation

## 📊 Metrikler

### Takip Edilen Metrikler

**API Metrikleri:**
- Request count
- Response time (avg, p50, p95, p99)
- Error rate
- Status code distribution

**Database Metrikleri:**
- Total users/groups/posts
- Active groups
- Recent signups

**Performance Metrikleri:**
- Group stats calculation time
- Leaderboard update time
- Cache hit rate

**Error Metrikleri:**
- Error count by type
- Error rate trend
- Most common errors

## 🔧 Troubleshooting

### Loglar görünmüyor
- Vercel Dashboard > Logs bölümünü kontrol edin
- Production deployment'ın aktif olduğundan emin olun
- Console.log yerine console.error kullanın (önemli loglar için)

### Sentry çalışmıyor
- NEXT_PUBLIC_SENTRY_DSN doğru mu kontrol edin
- Sentry.init() çağrısının yapıldığından emin olun
- Browser console'da Sentry hatalarını kontrol edin

### Cache çalışmıyor
- Redis credentials'ları kontrol edin
- Memory cache fallback otomatik çalışır
- Cache key'leri doğru mu kontrol edin

## 📚 Kaynaklar

- [Vercel Logs Documentation](https://vercel.com/docs/observability/logs)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Upstash Redis](https://docs.upstash.com/redis)

## 🎯 Best Practices

1. **Development'ta verbose logging**
   - Tüm detayları console'a yazdır
   - Hata stack trace'lerini göster

2. **Production'da structured logging**
   - JSON formatında log
   - Sensitive data'yı filtrele
   - Error tracking service kullan

3. **Performance monitoring**
   - Kritik operasyonları ölç
   - Yavaş sorguları optimize et
   - Cache stratejisi uygula

4. **Error handling**
   - Tüm hataları yakala ve logla
   - User-friendly error messages
   - Retry mekanizması (gerekirse)

5. **Alerting**
   - Kritik hatalar için alert kur
   - Performance degradation için uyarı
   - Düzenli monitoring dashboard kontrolü

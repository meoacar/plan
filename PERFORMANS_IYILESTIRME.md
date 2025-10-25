# 🚀 Performans İyileştirme Rehberi

## 📊 Mevcut Durum (Lighthouse Sonuçları)

### Core Web Vitals
- **FCP (First Contentful Paint)**: 1.4s ✅ İyi
- **LCP (Largest Contentful Paint)**: 2.7s ⚠️ Orta (hedef: <2.5s)
- **Speed Index**: 2.6s ✅ İyi
- **TBT (Total Blocking Time)**: İzleniyor
- **CLS (Cumulative Layout Shift)**: İzleniyor

## 🎯 Yapılan İyileştirmeler

### 1. Web Vitals Tracking Sistemi ✅

Gerçek kullanıcı verilerini toplamak için Web Vitals tracking sistemi kuruldu:

**Dosyalar:**
- `src/lib/web-vitals.ts` - Web Vitals izleme utility
- `src/components/web-vitals-reporter.tsx` - Client-side reporter
- `src/app/api/analytics/web-vitals/route.ts` - API endpoint
- `prisma/schema.prisma` - WebVitals model eklendi

**Özellikler:**
- FCP, LCP, FID, CLS, TTFB, INP metriklerini otomatik izler
- Veritabanına kaydeder (gerçek kullanıcı verileri)
- Production'da otomatik çalışır
- Navigator.sendBeacon ile güvenilir veri gönderimi

### 2. Kurulum Adımları

```bash
# 1. Web Vitals paketini yükle
cd zayiflamaplanim
npm install web-vitals

# 2. Veritabanı migration'ını çalıştır
npx prisma migrate dev --name add_web_vitals

# 3. Prisma client'ı güncelle
npx prisma generate
```

### 3. Lighthouse CI Kurulumu (Opsiyonel)

GitHub Actions ile otomatik performans testleri:

```bash
# Lighthouse CI yükle
npm install -D @lhci/cli

# .github/workflows/lighthouse.yml dosyası oluştur
```

**lighthouse.yml örneği:**
```yaml
name: Lighthouse CI
on: [push, pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npx @lhci/cli@0.12.x autorun
```

## 📈 Performans İzleme Dashboard'u

Web Vitals verilerini görmek için admin paneline eklenebilir:

```typescript
// src/app/admin/analytics/web-vitals/page.tsx
import { prisma } from '@/lib/prisma';

export default async function WebVitalsPage() {
  const metrics = await prisma.webVitals.groupBy({
    by: ['metricName', 'rating'],
    _avg: { value: true },
    _count: true,
    orderBy: { _count: { _all: 'desc' } }
  });

  return (
    <div>
      <h1>Web Vitals Metrikleri</h1>
      {/* Grafik ve tablo gösterimi */}
    </div>
  );
}
```

## 🎨 Önerilen İyileştirmeler

### Kısa Vadeli (Hemen Uygulanabilir)

1. **Image Optimization**
   - Next.js Image component kullanımını artır
   - WebP formatına geç
   - Lazy loading ekle

2. **Font Optimization**
   - Font display: swap kullan
   - Preload kritik fontları
   - Font subsetting

3. **Code Splitting**
   - Dynamic imports kullan
   - Route-based splitting
   - Component-level splitting

### Orta Vadeli

1. **Caching Strategy**
   - Service Worker ekle
   - Static asset caching
   - API response caching

2. **Bundle Optimization**
   - Unused code elimination
   - Tree shaking
   - Minification

3. **CDN Integration**
   - Static assets için CDN
   - Image CDN (Cloudinary, ImageKit)

### Uzun Vadeli

1. **Server-Side Rendering Optimization**
   - Incremental Static Regeneration (ISR)
   - Edge rendering
   - Streaming SSR

2. **Database Optimization**
   - Query optimization
   - Connection pooling
   - Caching layer (Redis)

## 📊 Metrik Hedefleri

| Metrik | Mevcut | Hedef | Öncelik |
|--------|--------|-------|---------|
| FCP | 1.4s | <1.8s | ✅ İyi |
| LCP | 2.7s | <2.5s | 🔴 Yüksek |
| TBT | - | <200ms | 🟡 Orta |
| CLS | - | <0.1 | 🟡 Orta |
| TTI | - | <3.8s | 🟡 Orta |

## 🔍 Test Komutları

```bash
# Lighthouse testi (local)
npx lighthouse http://localhost:3000 --view

# Lighthouse testi (production)
npx lighthouse https://zayiflamaplanim.com --view

# Mobil test
npx lighthouse https://zayiflamaplanim.com --preset=perf --view

# Sadece performans
npx lighthouse https://zayiflamaplanim.com --only-categories=performance --view
```

## 📝 Notlar

- Web Vitals tracking sadece production'da çalışır
- Veriler `WebVitals` tablosunda saklanır
- Her metrik için rating (good/needs-improvement/poor) kaydedilir
- User agent ve URL bilgisi ile detaylı analiz yapılabilir

## 🚀 Sonraki Adımlar

1. ✅ Web Vitals tracking kuruldu
2. ⏳ Veritabanı migration'ı çalıştırılacak
3. ⏳ Production'da test edilecek
4. ⏳ Admin dashboard'a metrik görüntüleme eklenecek
5. ⏳ Lighthouse CI GitHub Actions'a eklenecek
6. ⏳ Image optimization uygulanacak

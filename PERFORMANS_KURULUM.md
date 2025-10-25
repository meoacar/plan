# 🚀 Performans İzleme Sistemi - Kurulum Rehberi

## 📦 Kurulum Adımları

### 1. Bağımlılıkları Yükle

```bash
cd zayiflamaplanim
npm install
```

Bu komut `web-vitals` paketini ve diğer bağımlılıkları yükleyecek.

### 2. Veritabanı Tablosunu Oluştur

**Seçenek 1: SQL Dosyası ile (Önerilen)**

1. `create-web-vitals-table.sql` dosyasını açın
2. Veritabanı yönetim aracınızda (pgAdmin, DBeaver, Neon Console vb.) SQL komutlarını çalıştırın
3. Tablo ve indeksler otomatik oluşturulacak

**Seçenek 2: Prisma Migrate ile**

```bash
npx prisma migrate dev --name add_web_vitals
```

Not: Bu seçenek migration history'yi güncelleyecektir.

### 3. Prisma Client'ı Güncelle

```bash
npx prisma generate
```

### 4. Uygulamayı Başlat

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## 📊 Web Vitals Dashboard'a Erişim

Admin panelinden Web Vitals metriklerini görüntüleyebilirsiniz:

```
http://localhost:3000/admin/analytics/web-vitals
```

## 🧪 Lighthouse Testleri

### Manuel Test

```bash
# Production sitesini test et
npm run lighthouse

# Mobil performans testi
npm run lighthouse:mobile

# Local test (önce build alın)
npm run build
npm start
# Başka bir terminalde:
npx lighthouse http://localhost:3000 --view
```

### Otomatik CI/CD Testleri

GitHub'a push yaptığınızda otomatik olarak Lighthouse testleri çalışacak:

1. `.github/workflows/lighthouse.yml` dosyası eklendi
2. Her push ve PR'da otomatik test
3. Sonuçlar GitHub Actions'da görüntülenebilir

## 📈 Metrik Eşikleri

`lighthouserc.json` dosyasında tanımlı eşikler:

- **Performance Score**: ≥80%
- **Accessibility**: ≥90%
- **Best Practices**: ≥90%
- **SEO**: ≥90%
- **FCP**: ≤2000ms
- **LCP**: ≤2500ms
- **CLS**: ≤0.1
- **TBT**: ≤300ms

## 🔧 Yapılandırma

### Web Vitals Tracking

`src/lib/web-vitals.ts` dosyasında tracking yapılandırması bulunur.

**Özelleştirme:**
```typescript
// Sadece belirli metrikleri izle
export function reportWebVitals() {
  onLCP(sendToAnalytics);  // Sadece LCP
  onFCP(sendToAnalytics);  // Sadece FCP
}
```

### Lighthouse CI

`lighthouserc.json` dosyasında CI yapılandırması bulunur.

**Test edilecek sayfaları değiştir:**
```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/yeni-sayfa"
      ]
    }
  }
}
```

## 📊 Veri Analizi

### SQL Sorguları

```sql
-- Son 24 saatin metrik ortalamaları
SELECT 
  "metricName",
  AVG(value) as avg_value,
  COUNT(*) as count
FROM "WebVitals"
WHERE "createdAt" > NOW() - INTERVAL '24 hours'
GROUP BY "metricName";

-- Rating dağılımı
SELECT 
  "metricName",
  "rating",
  COUNT(*) as count
FROM "WebVitals"
GROUP BY "metricName", "rating"
ORDER BY "metricName", "rating";

-- En yavaş sayfalar
SELECT 
  url,
  AVG(value) as avg_lcp
FROM "WebVitals"
WHERE "metricName" = 'LCP'
GROUP BY url
ORDER BY avg_lcp DESC
LIMIT 10;
```

### Prisma Sorguları

```typescript
// Son 7 günün LCP ortalaması
const avgLCP = await prisma.webVitals.aggregate({
  _avg: { value: true },
  where: {
    metricName: 'LCP',
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  },
});

// Kötü performans gösteren sayfalar
const poorPages = await prisma.webVitals.groupBy({
  by: ['url'],
  _count: true,
  where: {
    rating: 'poor',
  },
  orderBy: {
    _count: {
      _all: 'desc',
    },
  },
  take: 10,
});
```

## 🎯 Performans İyileştirme Önerileri

### Hızlı Kazançlar

1. **Image Optimization**
   ```tsx
   // ❌ Kötü
   <img src="/image.jpg" />
   
   // ✅ İyi
   <Image 
     src="/image.jpg" 
     width={800} 
     height={600}
     alt="Description"
     loading="lazy"
   />
   ```

2. **Font Optimization**
   ```tsx
   // layout.tsx
   const inter = Inter({ 
     subsets: ["latin"],
     display: 'swap', // ✅ Font yüklenene kadar fallback göster
   });
   ```

3. **Dynamic Imports**
   ```tsx
   // ❌ Kötü
   import HeavyComponent from './HeavyComponent';
   
   // ✅ İyi
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <Skeleton />,
   });
   ```

### Orta Seviye İyileştirmeler

1. **API Route Caching**
   ```typescript
   export const revalidate = 3600; // 1 saat cache
   ```

2. **Database Query Optimization**
   ```typescript
   // ❌ N+1 problem
   const plans = await prisma.plan.findMany();
   for (const plan of plans) {
     const user = await prisma.user.findUnique({ where: { id: plan.userId } });
   }
   
   // ✅ Include ile tek sorguda
   const plans = await prisma.plan.findMany({
     include: { user: true },
   });
   ```

3. **Incremental Static Regeneration**
   ```typescript
   export const revalidate = 60; // 60 saniyede bir yenile
   ```

## 🐛 Sorun Giderme

### Web Vitals Verisi Gelmiyor

1. Production'da mı çalışıyor? (Development'da çalışmaz)
2. API endpoint çalışıyor mu? `/api/analytics/web-vitals`
3. Veritabanı bağlantısı var mı?
4. Browser console'da hata var mı?

### Lighthouse CI Başarısız

1. Build başarılı mı? `npm run build`
2. Environment variables tanımlı mı?
3. Database erişilebilir mi?
4. Port 3000 kullanılabilir mi?

### Dashboard Boş Görünüyor

1. Veri toplandı mı? (Production'da en az birkaç sayfa ziyareti gerekli)
2. Migration çalıştırıldı mı?
3. Admin yetkisi var mı?

## 📚 Kaynaklar

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Core Web Vitals](https://web.dev/articles/vitals)

## 🎉 Tamamlandı!

Performans izleme sistemi başarıyla kuruldu. Artık:

✅ Gerçek kullanıcı verilerini topluyorsunuz
✅ Web Vitals metriklerini izliyorsunuz  
✅ Lighthouse testleri otomatik çalışıyor
✅ Admin dashboard'da metrikleri görüntüleyebiliyorsunuz

Sorularınız için: [GitHub Issues](https://github.com/your-repo/issues)

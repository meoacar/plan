# Production Hata Düzeltme Rehberi

## Tespit Edilen Hatalar

1. **500 Internal Server Error** - `/api/analytics/web-vitals`
2. **500 Internal Server Error** - `/api/notifications/unread-count`
3. **Server Components render hatası**
4. **Service Worker cache hatası**

## Çözüm Adımları

### 1. Prisma Client'ı Güncelle

Production sunucusunda şu komutları çalıştırın:

```bash
# Prisma Client'ı yeniden generate et
npx prisma generate

# Database migration'ları uygula (eğer varsa)
npx prisma migrate deploy
```

### 2. Environment Değişkenlerini Kontrol Et

Production `.env` dosyasında şunların olduğundan emin olun:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://zayiflamaplanim.com"
NEXTAUTH_SECRET="..."
```

### 3. Build ve Deploy

```bash
# Yeni build oluştur
npm run build

# Production'ı başlat
npm start
```

### 4. Database Connection Pooling

Neon database kullanıyorsanız, connection pooling için `-pooler` endpoint'ini kullandığınızdan emin olun:

```env
DATABASE_URL="postgresql://neondb_owner:...@ep-icy-pond-a4mxlej0-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 5. Hata Loglarını Kontrol Et

Production sunucusunda:

```bash
# Next.js loglarını kontrol et
pm2 logs

# veya
journalctl -u your-app-name -f
```

## Özel Hatalar ve Çözümleri

### WebVitals API Hatası

WebVitals modeli Prisma şemasında mevcut. Eğer hata devam ediyorsa:

1. Prisma Client'ın güncel olduğundan emin olun
2. Database'de `WebVitals` tablosunun oluşturulduğunu kontrol edin:

```sql
SELECT * FROM "WebVitals" LIMIT 1;
```

### Notification API Hatası

Notification servisi `getUnreadNotificationCount` fonksiyonunu kullanıyor. Kontrol edilecekler:

1. `Notification` tablosu var mı?
2. User session doğru çalışıyor mu?
3. Database bağlantısı aktif mi?

### Service Worker Cache Hatası

`sw.js` dosyasında cache stratejisi hatası var. Düzeltme:

```javascript
// public/sw.js içinde
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      // Sadece kritik dosyaları cache'le
      return cache.addAll([
        '/',
        '/offline',
        '/manifest.json'
      ]).catch(err => {
        console.error('Cache addAll failed:', err);
        // Hata olsa bile install'ı tamamla
        return Promise.resolve();
      });
    })
  );
});
```

## Hızlı Test

Production'da API'leri test etmek için:

```bash
# WebVitals API
curl -X POST https://zayiflamaplanim.com/api/analytics/web-vitals \
  -H "Content-Type: application/json" \
  -d '{"name":"CLS","value":0.1,"rating":"good","delta":0.1,"id":"test","navigationType":"navigate"}'

# Notifications API (authentication gerekli)
curl https://zayiflamaplanim.com/api/notifications/unread-count \
  -H "Cookie: next-auth.session-token=..."
```

## Önleyici Tedbirler

1. **Error Monitoring**: Sentry veya benzeri bir tool ekleyin
2. **Health Check**: `/api/health` endpoint'i oluşturun
3. **Database Connection Pool**: Connection limit'lerini ayarlayın
4. **Graceful Degradation**: API hataları için fallback'ler ekleyin

## Acil Durum

Eğer sorun devam ediyorsa, geçici çözüm:

1. WebVitals tracking'i devre dışı bırakın (client-side)
2. Notification count'u localStorage'dan gösterin
3. Service Worker'ı devre dışı bırakın

```javascript
// layout.tsx içinde
if (typeof window !== 'undefined') {
  // WebVitals'ı geçici olarak devre dışı bırak
  // reportWebVitals fonksiyonunu comment out edin
}
```

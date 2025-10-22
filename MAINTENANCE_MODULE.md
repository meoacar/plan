# Yedekleme ve Bakım Modülü

Bu modül, admin kullanıcılarının sistem yedeklemesi, cache yönetimi ve sağlık kontrolü yapmasını sağlar.

## Özellikler

### 1. Veritabanı Yedekleme
- **Manuel Yedekleme**: Admin panelinden tek tıkla yedek oluşturma
- **Otomatik Yedekleme**: Her gün saat 02:00'de otomatik yedek (Vercel Cron)
- **Yedek İndirme**: Oluşturulan yedekleri JSON formatında indirme
- **Yedek Geçmişi**: Son 10 yedeği listeleme

### 2. Cache Yönetimi
- Tüm Next.js cache'ini temizleme
- Önemli path'leri revalidate etme
- Activity log kaydı

### 3. Sistem Sağlık Kontrolü
- Veritabanı bağlantı kontrolü ve latency ölçümü
- Bellek kullanımı (RSS, Heap, External)
- Sistem uptime bilgisi

### 4. Sistem Bilgileri
- Veritabanı boyutu (PostgreSQL)
- Toplam kayıt sayıları (kullanıcı, plan, yorum, vb.)
- Son yedekleme tarihi

## API Endpoints

### Backup API
```
GET  /api/admin/maintenance/backup
POST /api/admin/maintenance/backup
GET  /api/admin/maintenance/backup/download/[filename]
```

### Cache API
```
DELETE /api/admin/maintenance/cache
```

### Health API
```
GET /api/admin/maintenance/health
```

### Cron Job
```
POST /api/cron/auto-backup
```

## Kullanım

### Admin Panelinden
1. `/admin/maintenance` sayfasına gidin
2. "Yedek Oluştur" butonuna tıklayın
3. Oluşturulan yedeği "İndir" linkinden indirin
4. "Cache Temizle" ile cache'i temizleyin
5. "Sağlık Kontrolü" ile sistem durumunu kontrol edin

### Otomatik Yedekleme
Vercel Cron Job her gün saat 02:00'de otomatik yedek oluşturur.

`vercel.json` dosyasında tanımlı:
```json
{
  "crons": [
    {
      "path": "/api/cron/auto-backup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## Environment Variables

```env
# Cron job güvenliği için (opsiyonel)
CRON_SECRET="your-secret-key"
```

## Dosya Yapısı

```
src/
├── lib/
│   └── backup.ts                    # Backup utility fonksiyonları
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── maintenance/
│   │   │       ├── backup/
│   │   │       │   ├── route.ts     # Backup API
│   │   │       │   └── download/
│   │   │       │       └── [filename]/
│   │   │       │           └── route.ts
│   │   │       ├── cache/
│   │   │       │   └── route.ts     # Cache API
│   │   │       └── health/
│   │   │           └── route.ts     # Health API
│   │   └── cron/
│   │       └── auto-backup/
│   │           └── route.ts         # Cron job
│   └── admin/
│       └── maintenance/
│           └── page.tsx             # Admin sayfası
└── components/
    └── admin/
        └── maintenance-panel.tsx    # UI component

backups/                             # Yedek dosyaları (gitignore'da)
```

## Yedek Formatı

Yedekler JSON formatında saklanır:

```json
{
  "version": "1.0",
  "timestamp": "2025-01-15T02:00:00.000Z",
  "data": {
    "users": [...],
    "plans": [...],
    "comments": [...],
    "likes": [...],
    "categories": [...],
    "tags": [...],
    "planTags": [...],
    "bannedWords": [...],
    "activityLogs": [...],
    "emailCampaigns": [...],
    "siteSettings": [...],
    "backups": [...]
  }
}
```

## Güvenlik

- Tüm endpoint'ler admin yetkisi gerektirir
- Cron job için CRON_SECRET kontrolü
- Yedek indirme için dosya adı validasyonu
- Activity log ile tüm işlemler kaydedilir

## Activity Log

Tüm bakım işlemleri activity log'a kaydedilir:
- `BACKUP_CREATED`: Yedek oluşturuldu
- `CACHE_CLEARED`: Cache temizlendi

## Notlar

- Yedekler `backups/` klasöründe saklanır
- Büyük veritabanları için yedekleme süresi uzayabilir
- Activity log ve email kampanyaları sınırlı sayıda yedeklenir (son 1000/100)
- PostgreSQL veritabanı boyutu hesaplaması için `pg_database_size` kullanılır

## Requirements

Bu modül aşağıdaki requirement'ları karşılar:
- 11.1: Yedekleme ve bakım sayfası
- 11.2: Sistem bilgileri gösterimi
- 11.3: Manuel yedekleme
- 11.4: Cache temizleme
- 11.5: Yedek indirme
- 11.6: Sağlık kontrolü
- 11.7: Sistem durumu gösterimi
- 11.8: Otomatik yedekleme ayarları
- 11.9: Otomatik yedekleme (cron)
- 11.10: Yedek geçmişi

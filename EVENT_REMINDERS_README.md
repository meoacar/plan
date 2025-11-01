# Etkinlik Hatırlatma Sistemi

## Genel Bakış

Etkinlik hatırlatma sistemi, grup etkinliklerine katılacak kullanıcılara otomatik hatırlatma bildirimleri gönderen bir cron job'dur. Sistem her gün sabah 09:00'da çalışır ve gelecek 24 saat içinde başlayacak etkinlikler için katılımcılara bildirim gönderir.

## Özellikler

- ✅ 24 saat içinde başlayacak etkinlikleri otomatik tespit eder
- ✅ Sadece "GOING" (Katılacak) durumundaki katılımcılara bildirim gönderir
- ✅ Etkinlik detaylarını (tarih, saat, konum) içeren zengin bildirimler
- ✅ Grup bildirim şablonlarını kullanır
- ✅ Hata yönetimi ve loglama
- ✅ Güvenli cron job authentication

## Teknik Detaylar

### Cron Job Yapılandırması

**Dosya:** `/src/app/api/cron/event-reminders/route.ts`

**Çalışma Zamanı:** Her gün 09:00 (Vercel Cron)

**Vercel Cron Yapılandırması:**
```json
{
  "path": "/api/cron/event-reminders",
  "schedule": "0 9 * * *"
}
```

### Çalışma Mantığı

1. **Etkinlik Sorgulama:**
   - Şu andan itibaren gelecek 24 saat içinde başlayacak etkinlikleri bulur
   - `startDate >= now AND startDate <= now + 24 hours`

2. **Katılımcı Filtreleme:**
   - Sadece `status = 'GOING'` olan katılımcıları seçer
   - Diğer durumlar (`MAYBE`, `NOT_GOING`) için bildirim gönderilmez

3. **Bildirim Gönderimi:**
   - Her katılımcı için ayrı bildirim oluşturur
   - Bildirim içeriği:
     - Etkinlik başlığı
     - Kalan saat sayısı
     - Etkinlik tarihi ve saati (Türkçe format)
     - Etkinlik konumu
   - Bildirim tipi: `GROUP_EVENT_REMINDER`

4. **Metadata:**
   - `groupId`: Grup ID'si
   - `groupName`: Grup adı
   - `eventId`: Etkinlik ID'si
   - `eventTitle`: Etkinlik başlığı
   - `eventStartDate`: Etkinlik başlangıç tarihi (ISO format)
   - `hoursUntil`: Etkinliğe kalan saat

### Güvenlik

Cron job, `CRON_SECRET` environment variable ile korunur:

```typescript
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Kurulum

### 1. Environment Variables

`.env` dosyanıza aşağıdaki değişkeni ekleyin:

```env
CRON_SECRET=your-secure-random-secret-here
```

### 2. Vercel Deployment

Vercel'de deploy ettiğinizde, cron job otomatik olarak yapılandırılır. `vercel.json` dosyasında tanımlıdır.

### 3. Local Test

Local ortamda test etmek için:

```bash
# Test script'ini çalıştır
node test-event-reminders.js
```

veya

```bash
# Manuel API çağrısı
curl -X GET http://localhost:3000/api/cron/event-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## API Response

### Başarılı Response

```json
{
  "success": true,
  "eventsProcessed": 3,
  "notificationsSent": 15,
  "failedNotifications": 0,
  "processedEventIds": [
    "clx1234567890",
    "clx0987654321",
    "clx5555555555"
  ],
  "timestamp": "2024-01-15T09:00:00.000Z"
}
```

### Hata Response

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Database connection failed",
  "timestamp": "2024-01-15T09:00:00.000Z"
}
```

## Bildirim Örneği

**Başlık:** Etkinlik Hatırlatması

**Mesaj:**
```
"Haftalık Kilo Verme Challenge" etkinliği 18 saat sonra başlayacak
📅 15 Ocak 2024, 15:00
📍 Online - Zoom
```

**Action URL:** `/groups/kilo-verme-grubu/events/clx1234567890`

## Monitoring ve Logging

### Console Logs

Cron job çalıştığında aşağıdaki loglar üretilir:

```
Event reminders cron completed: {
  success: true,
  eventsProcessed: 3,
  notificationsSent: 15,
  failedNotifications: 0,
  processedEventIds: [...],
  timestamp: "2024-01-15T09:00:00.000Z"
}
```

### Hata Logları

Bildirim gönderiminde hata oluşursa:

```
Bildirim gönderilemedi (eventId: clx123, userId: user456): Error message
```

## Veritabanı Modelleri

### GroupEvent

```prisma
model GroupEvent {
  id              String                  @id @default(cuid())
  groupId         String
  title           String
  description     String?
  eventType       GroupEventType
  startDate       DateTime
  endDate         DateTime?
  location        String?
  maxParticipants Int?
  createdBy       String
  createdAt       DateTime                @default(now())
  updatedAt       DateTime                @updatedAt
  creator         User                    @relation("GroupEvents", fields: [createdBy], references: [id])
  group           Group                   @relation(fields: [groupId], references: [id], onDelete: Cascade)
  participants    GroupEventParticipant[]
}
```

### GroupEventParticipant

```prisma
model GroupEventParticipant {
  id       String            @id @default(cuid())
  eventId  String
  userId   String
  status   ParticipantStatus @default(GOING)
  joinedAt DateTime          @default(now())
  event    GroupEvent        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user     User              @relation("GroupEventParticipants", fields: [userId], references: [id], onDelete: Cascade)
}
```

### ParticipantStatus Enum

```prisma
enum ParticipantStatus {
  GOING
  MAYBE
  NOT_GOING
}
```

## Geliştirme Notları

### Gelecek İyileştirmeler

1. **Özelleştirilebilir Hatırlatma Zamanı:**
   - Kullanıcıların hatırlatma zamanını seçebilmesi (24h, 12h, 1h önce)

2. **Çoklu Hatırlatmalar:**
   - 24 saat, 1 saat ve 15 dakika öncesi hatırlatmalar

3. **Email Bildirimleri:**
   - Push bildirimlerine ek olarak email hatırlatmaları

4. **Bildirim Tercihleri:**
   - Kullanıcıların etkinlik hatırlatmalarını kapatabilmesi

5. **Batch Processing:**
   - Çok sayıda katılımcı için performans optimizasyonu

### Bilinen Sınırlamalar

- Şu anda sadece 24 saat öncesi hatırlatma destekleniyor
- Timezone desteği yok (UTC kullanılıyor)
- Email bildirimleri henüz entegre değil

## Troubleshooting

### Bildirimler Gönderilmiyor

1. **CRON_SECRET kontrolü:**
   ```bash
   echo $CRON_SECRET
   ```

2. **Veritabanı bağlantısı:**
   - Prisma client'ın doğru yapılandırıldığından emin olun

3. **Etkinlik verisi:**
   - Gelecek 24 saat içinde etkinlik olup olmadığını kontrol edin
   - Katılımcıların `status = 'GOING'` olduğundan emin olun

### Cron Job Çalışmıyor

1. **Vercel Logs:**
   ```bash
   vercel logs
   ```

2. **Local test:**
   ```bash
   node test-event-reminders.js
   ```

3. **Vercel Cron Dashboard:**
   - Vercel dashboard'da cron job'un aktif olduğunu kontrol edin

## İlgili Dosyalar

- `/src/app/api/cron/event-reminders/route.ts` - Cron job implementasyonu
- `/src/lib/group-notifications.ts` - Bildirim helper fonksiyonları
- `/vercel.json` - Vercel cron yapılandırması
- `/test-event-reminders.js` - Test scripti
- `/prisma/schema.prisma` - Veritabanı şeması

## Destek

Sorularınız veya sorunlarınız için:
- GitHub Issues
- Geliştirici Dokümantasyonu
- Teknik Destek Ekibi

---

**Son Güncelleme:** 2024-01-15
**Versiyon:** 1.0.0
**Geliştirici:** Grup Geliştirme Ekibi

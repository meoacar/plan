# Bildirim Sistemi

Kapsamlı bildirim sistemi: Web Push, Email, In-app bildirimleri ve kullanıcı tercihleri.

## Özellikler

### 1. Web Push Notifications
- Tarayıcı push bildirimleri
- Service Worker ile offline destek
- Bildirim izni yönetimi
- Push subscription yönetimi

### 2. Email Bildirimleri
- Yeni takipçi bildirimi
- Yorum bildirimi
- Beğeni bildirimi
- Partner istekleri
- Rozet kazanımları
- Haftalık özet

### 3. In-App Bildirim Merkezi
- Gerçek zamanlı bildirimler
- Okunmamış sayacı
- Bildirim geçmişi
- Toplu işlemler (tümünü okundu işaretle, sil)

### 4. Bildirim Tercihleri
- Hangi bildirimleri almak istediğini seçme
- Email/Push/In-app için ayrı tercihler
- Sessiz saatler
- Bildirim sıklığı kontrolü

## Kurulum

### 1. Veritabanı Migration

```bash
cd zayiflamaplanim
npx prisma migrate dev --name add_notifications
```

### 2. Environment Variables

`.env` dosyanıza ekleyin:

```env
# Web Push (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key"
VAPID_PRIVATE_KEY="your-private-key"
VAPID_SUBJECT="mailto:your-email@example.com"
```

VAPID keys oluşturmak için:

```bash
npx web-push generate-vapid-keys
```

### 3. Service Worker

Service worker otomatik olarak `/public/sw.js` konumuna yerleştirilmiştir.

## Kullanım

### Bildirim Gönderme

```typescript
import { createNotification } from '@/lib/notifications';

// Yeni takipçi bildirimi
await createNotification({
  userId: targetUserId,
  type: 'NEW_FOLLOWER',
  title: 'Yeni Takipçi',
  message: `${followerName} seni takip etmeye başladı`,
  actionUrl: `/profil/${followerUsername}`,
  actorId: followerId,
});

// Yorum bildirimi
await createNotification({
  userId: planOwnerId,
  type: 'COMMENT',
  title: 'Yeni Yorum',
  message: `${commenterName} planına yorum yaptı`,
  actionUrl: `/plan/${planSlug}#comments`,
  actorId: commenterId,
  relatedId: commentId,
});
```

### Bildirim Merkezi

Kullanıcı arayüzünde bildirim merkezi otomatik olarak header'da görünür.

### Bildirim Tercihleri

Kullanıcılar `/ayarlar/bildirimler` sayfasından tercihlerini yönetebilir.

## API Endpoints

- `GET /api/notifications` - Bildirimleri listele
- `POST /api/notifications/:id/read` - Bildirimi okundu işaretle
- `POST /api/notifications/read-all` - Tümünü okundu işaretle
- `DELETE /api/notifications/:id` - Bildirimi sil
- `GET /api/notifications/preferences` - Tercihleri getir
- `PUT /api/notifications/preferences` - Tercihleri güncelle
- `POST /api/notifications/subscribe` - Push subscription kaydet
- `DELETE /api/notifications/unsubscribe` - Push subscription sil

## Bildirim Tipleri

- `NEW_FOLLOWER` - Yeni takipçi
- `COMMENT` - Yorum
- `LIKE` - Beğeni
- `BADGE_EARNED` - Rozet kazanımı
- `PARTNER_REQUEST` - Partner isteği
- `PARTNER_ACCEPTED` - Partner kabul edildi
- `RECIPE_APPROVED` - Tarif onaylandı
- `PLAN_APPROVED` - Plan onaylandı
- `GROUP_INVITE` - Grup daveti
- `CHALLENGE_INVITE` - Challenge daveti
- `WALL_POST` - Duvar yazısı
- `MENTION` - Bahsetme

## Otomatik Bildirimler

Aşağıdaki olaylar otomatik olarak bildirim oluşturur:

1. **Takip Sistemi**: Yeni takipçi
2. **Etkileşimler**: Beğeni, yorum, yorum reaksiyonu
3. **Partner Sistemi**: İstek, kabul, mesaj
4. **Gamification**: Rozet kazanımı, seviye atlama
5. **İçerik Onayı**: Plan/tarif onayı veya reddi
6. **Sosyal**: Duvar yazısı, bahsetme

## Email Şablonları

Email şablonları `src/emails/` klasöründe bulunur:
- `notification-email.tsx` - Genel bildirim şablonu
- `weekly-digest.tsx` - Haftalık özet

## Performans

- Bildirimler sayfalandırılmıştır (20 bildirim/sayfa)
- Okunmamış sayısı cache'lenir
- Push bildirimleri batch olarak gönderilir
- Email bildirimleri kuyruğa alınır

## Güvenlik

- Push subscriptions şifrelenir
- Email adresleri doğrulanır
- Rate limiting uygulanır
- Spam koruması vardır

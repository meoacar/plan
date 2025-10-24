# Bildirim Sistemi - Hızlı Başlangıç

## 1. Kurulum (5 dakika)

### Windows:
```powershell
cd zayiflamaplanim
.\scripts\setup-notifications.ps1
```

### Linux/Mac:
```bash
cd zayiflamaplanim
chmod +x scripts/setup-notifications.sh
./scripts/setup-notifications.sh
```

### Manuel Kurulum:

```bash
# 1. VAPID keys oluştur
npx web-push generate-vapid-keys

# 2. Dependencies yükle
npm install

# 3. Migration çalıştır
npx prisma migrate dev --name add_notifications

# 4. Prisma client güncelle
npx prisma generate
```

## 2. Environment Variables

`.env` dosyanıza ekleyin:

```env
# Web Push (Zorunlu)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BNxxx..."
VAPID_PRIVATE_KEY="xxx..."
VAPID_SUBJECT="mailto:admin@zayiflamaplanim.com"

# Email (Opsiyonel - email bildirimleri için)
RESEND_API_KEY="re_xxx..."
EMAIL_FROM="Zayıflama Planım <noreply@zayiflamaplanim.com>"
```

## 3. Header'a Bildirim Zili Ekle

```tsx
// src/components/layout/header.tsx veya navbar.tsx
import { NotificationBell } from '@/components/notifications/notification-bell';

export function Header() {
  return (
    <header>
      {/* ... diğer header içeriği ... */}
      <NotificationBell />
    </header>
  );
}
```

## 4. İlk Bildirimi Gönder

```typescript
import { createNotification } from '@/lib/notifications';

// Örnek: Yeni takipçi bildirimi
await createNotification({
  userId: 'user-id',
  type: 'NEW_FOLLOWER',
  title: 'Yeni Takipçi',
  message: 'Ali seni takip etmeye başladı',
  actionUrl: '/profil/ali',
  actorId: 'ali-user-id',
});
```

## 5. Test Et

1. Uygulamayı başlat: `npm run dev`
2. Giriş yap
3. `/ayarlar/bildirimler` sayfasına git
4. "Push Bildirimlerini Etkinleştir" butonuna tıkla
5. Tarayıcı izni ver
6. Test bildirimi gönder

## Özellikler

✅ **Web Push Notifications** - Tarayıcı bildirimleri  
✅ **Email Notifications** - Email bildirimleri  
✅ **In-App Notifications** - Uygulama içi bildirim merkezi  
✅ **Notification Preferences** - Kullanıcı tercihleri  
✅ **Quiet Hours** - Sessiz saatler  
✅ **Unread Counter** - Okunmamış sayacı  
✅ **Mark as Read** - Okundu işaretle  
✅ **Delete Notifications** - Bildirim silme  

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
- `LEVEL_UP` - Seviye atlama
- `COMMENT_REACTION` - Yorum reaksiyonu

## API Endpoints

```
GET    /api/notifications              - Bildirimleri listele
GET    /api/notifications/unread-count - Okunmamış sayısı
POST   /api/notifications/:id/read     - Okundu işaretle
POST   /api/notifications/read-all     - Tümünü okundu işaretle
DELETE /api/notifications/:id          - Sil
GET    /api/notifications/preferences  - Tercihleri getir
PUT    /api/notifications/preferences  - Tercihleri güncelle
POST   /api/notifications/subscribe    - Push'a abone ol
POST   /api/notifications/unsubscribe  - Push'tan çık
```

## Sayfalar

- `/bildirimler` - Tüm bildirimler
- `/ayarlar/bildirimler` - Bildirim tercihleri

## Daha Fazla Bilgi

- `BILDIRIM_SISTEMI.md` - Detaylı dokümantasyon
- `BILDIRIM_KULLANIM_ORNEKLERI.md` - Kod örnekleri

## Sorun Giderme

### Push bildirimleri çalışmıyor
1. VAPID keys doğru mu kontrol edin
2. HTTPS kullanıyor musunuz? (localhost hariç)
3. Tarayıcı izni verildi mi?
4. Service Worker kayıtlı mı? (DevTools > Application > Service Workers)

### Email bildirimleri gitmiyor
1. RESEND_API_KEY doğru mu?
2. EMAIL_FROM adresi doğru mu?
3. Kullanıcı email tercihini açtı mı?

### Bildirimler görünmüyor
1. Kullanıcı giriş yapmış mı?
2. NotificationBell component header'da mı?
3. API endpoint'leri çalışıyor mu?

## Destek

Sorun yaşarsanız:
1. Console'da hata var mı kontrol edin
2. Network tab'de API isteklerini kontrol edin
3. Prisma Studio'da veritabanını kontrol edin: `npx prisma studio`

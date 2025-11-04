# Streak Bileşenleri

Bu klasör, kullanıcıların ardışık giriş günlerini (streak) görselleştirmek ve yönetmek için kullanılan React bileşenlerini içerir.

## Bileşenler

### StreakDisplay

Kullanıcının mevcut streak'ini, sonraki milestone'u ve alınabilir bonusları görüntüler.

**Özellikler:**
- Mevcut streak sayısını büyük ve dikkat çekici şekilde gösterir
- Sonraki milestone'a kadar olan ilerlemeyi progress bar ile gösterir
- Kazanılacak ödülleri (coin, XP, rozet) önizler
- Alınabilir bonusları listeler ve talep etme butonu sağlar
- Motivasyon mesajları gösterir (streak seviyesine göre)

**Kullanım:**
```tsx
import { StreakDisplay } from "@/components/streak";

<StreakDisplay
  streak={15}
  nextMilestone={30}
  nextReward={{
    days: 30,
    coinReward: 500,
    xpReward: 200,
    badgeType: "ACTIVE_30_DAYS",
    description: "30 gün ardışık giriş bonusu"
  }}
  availableMilestones={[
    {
      days: 7,
      coinReward: 100,
      xpReward: 50,
      badgeType: "ACTIVE_7_DAYS",
      description: "7 gün ardışık giriş bonusu"
    }
  ]}
  onClaimBonus={async (streakDays) => {
    // Bonus talep etme işlemi
    await fetch("/api/streak/claim-bonus", {
      method: "POST",
      body: JSON.stringify({ streakDays })
    });
  }}
/>
```

### StreakCalendar

Kullanıcının aylık aktivite takvimini gösterir. Hangi günlerde aktif olduğunu görsel olarak sunar.

**Özellikler:**
- Aylık takvim görünümü
- Aktif günleri yeşil renkte vurgular
- Bugünü mavi çerçeve ile işaretler
- Ay navigasyonu (önceki/sonraki ay)
- Bu aydaki aktif gün sayısını gösterir
- Mevcut streak bilgisini gösterir

**Kullanım:**
```tsx
import { StreakCalendar } from "@/components/streak";

<StreakCalendar
  userId="user-id"
  activeDays={[
    "2024-01-01",
    "2024-01-02",
    "2024-01-03",
    "2024-01-05"
  ]}
  currentStreak={15}
  month={new Date(2024, 0, 1)} // Opsiyonel, varsayılan: şu anki ay
/>
```

## Veri Yapıları

### StreakMilestone
```typescript
interface StreakMilestone {
  days: number;           // Milestone gün sayısı (7, 30, 100)
  coinReward: number;     // Verilecek coin miktarı
  xpReward: number;       // Verilecek XP miktarı
  badgeType?: string;     // Verilecek rozet tipi (opsiyonel)
  description: string;    // Milestone açıklaması
}
```

## API Entegrasyonu

Bu bileşenler aşağıdaki API endpoint'leri ile çalışır:

### GET /api/streak/status
Kullanıcının streak durumunu getirir.

**Response:**
```json
{
  "currentStreak": 15,
  "lastActiveDate": "2024-01-15T10:00:00Z",
  "nextMilestone": {
    "days": 30,
    "coinReward": 500,
    "xpReward": 200,
    "badgeType": "ACTIVE_30_DAYS",
    "description": "30 gün ardışık giriş bonusu"
  },
  "availableMilestones": [
    {
      "days": 7,
      "coinReward": 100,
      "xpReward": 50,
      "badgeType": "ACTIVE_7_DAYS",
      "description": "7 gün ardışık giriş bonusu"
    }
  ],
  "history": [
    "2024-01-01",
    "2024-01-02",
    "2024-01-03"
  ]
}
```

### POST /api/streak/claim-bonus
Streak bonusu talep eder.

**Request:**
```json
{
  "streakDays": 7
}
```

**Response:**
```json
{
  "success": true,
  "coins": 1100,
  "xp": 550,
  "level": 6,
  "leveledUp": false,
  "badge": {
    "id": "badge-id",
    "type": "ACTIVE_7_DAYS",
    "name": "7 Gün Aktif",
    "description": "7 gün üst üste aktif oldun"
  },
  "coinReward": 100,
  "xpReward": 50
}
```

## Stil ve Tasarım

Bileşenler Tailwind CSS kullanır ve şu renk paletini takip eder:

- **Streak (Ateş)**: Orange/Red gradient
- **Milestone (Hedef)**: Purple/Pink gradient
- **Alınabilir Bonus**: Green/Emerald gradient
- **Takvim**: Blue/Indigo gradient
- **Aktif Günler**: Green/Emerald
- **Bugün**: Blue ring

## Animasyonlar

- Progress bar animasyonlu güncellenir
- Bonus talep butonu loading state gösterir
- Hover efektleri smooth transition ile
- Takvim günleri hover'da büyür

## Responsive Tasarım

Tüm bileşenler mobil uyumludur:
- Küçük ekranlarda grid layout'lar ayarlanır
- Butonlar touch-friendly boyutlarda
- Metinler okunabilir kalır
- Kartlar ekran genişliğine uyum sağlar

## Geliştirme Notları

1. **Performans**: Takvim günleri useMemo ile optimize edilmiştir
2. **Erişilebilirlik**: Tüm interaktif elementler keyboard accessible
3. **Hata Yönetimi**: API hataları console'a loglanır
4. **Loading States**: Async işlemler için loading göstergeleri var
5. **Optimistic Updates**: Bonus talep ederken UI hemen güncellenir

## Gelecek Geliştirmeler

- [ ] Streak kırılma uyarısı (son gün)
- [ ] Streak kurtarma özelliği (1 günlük grace period)
- [ ] Haftalık/aylık streak istatistikleri
- [ ] Arkadaşlarla streak karşılaştırması
- [ ] Streak başarı bildirimleri
- [ ] Özel streak rozetleri showcase

# Gamification Bildirim Entegrasyonu

## Genel Bakış

Bu doküman, gamification özellikleri için bildirim sisteminin entegrasyonunu açıklar. Görev tamamlama, seviye atlama, coin kazanma, ödül satın alma ve streak milestone bildirimleri eklenmiştir.

## Yapılan Değişiklikler

### 1. Veritabanı Şeması Güncellemeleri

**Dosya:** `prisma/schema.prisma`

`NotificationType` enum'ına yeni bildirim tipleri eklendi:

```prisma
enum NotificationType {
  // ... mevcut tipler
  QUEST_COMPLETED      // Görev tamamlandığında
  QUEST_AVAILABLE      // Yeni görevler atandığında
  REWARD_PURCHASED     // Ödül satın alındığında
  COIN_EARNED          // Önemli coin kazanımlarında
  STREAK_MILESTONE     // Streak milestone'larında
}
```

### 2. Bildirim Servisi

**Dosya:** `src/lib/notification-service.ts`

Yeni bildirim fonksiyonları oluşturuldu:

#### `notifyQuestCompleted()`
Görev tamamlandığında bildirim gönderir.

```typescript
await notifyQuestCompleted(
  userId,
  questTitle,
  coinReward,
  xpReward,
  questId
);
```

#### `notifyNewQuests()`
Yeni görevler atandığında bildirim gönderir.

```typescript
await notifyNewQuests(userId, questCount);
```

#### `notifyLevelUp()`
Kullanıcı seviye atladığında bildirim gönderir.

```typescript
await notifyLevelUp(userId, newLevel, bonusCoins);
```

#### `notifyCoinEarned()`
Önemli coin kazanımlarında bildirim gönderir (50+ coin).

```typescript
await notifyCoinEarned(userId, amount, source, sourceTitle);
```

#### `notifyRewardPurchased()`
Ödül satın alındığında bildirim gönderir.

```typescript
await notifyRewardPurchased(userId, rewardName, coinsPaid, rewardId);
```

#### `notifyStreakMilestone()`
Streak milestone'larında bildirim gönderir.

```typescript
await notifyStreakMilestone(
  userId,
  streakDays,
  coinReward,
  xpReward,
  badgeName
);
```

### 3. API Endpoints

#### GET /api/notifications
Kullanıcının bildirimlerini getirir.

**Query Parameters:**
- `limit` (number, default: 20): Sayfa başına bildirim sayısı
- `offset` (number, default: 0): Başlangıç noktası
- `unreadOnly` (boolean): Sadece okunmamış bildirimleri getir

**Response:**
```json
{
  "notifications": [...],
  "total": 100,
  "unreadCount": 5,
  "hasMore": true
}
```

#### POST /api/notifications/mark-read
Bildirimi veya tüm bildirimleri okundu olarak işaretler.

**Request Body:**
```json
{
  "notificationId": "notif_123", // Tek bildirim için
  "markAll": true                // Tüm bildirimler için
}
```

#### GET /api/notifications/unread-count
Okunmamış bildirim sayısını getirir.

**Response:**
```json
{
  "count": 5
}
```

### 4. Sistem Entegrasyonları

#### Quest System (`src/lib/quest-system.ts`)

**Görev Atama:**
- `assignDailyQuests()`: Günlük görevler atandığında bildirim gönderir
- `assignWeeklyQuests()`: Haftalık görevler atandığında bildirim gönderir

**Görev Tamamlama:**
- `updateQuestProgress()`: Görev tamamlandığında bildirim gönderir

#### Coin System (`src/lib/coin-system.ts`)

**Bonus Coin:**
- `grantBonusCoins()`: 50+ coin bonuslarında bildirim gönderir

#### Reward System (`src/lib/reward-system.ts`)

**Ödül Satın Alma:**
- `purchaseReward()`: Ödül satın alındığında bildirim gönderir

#### Streak Bonus System (`src/lib/streak-bonus.ts`)

**Streak Milestone:**
- `grantStreakBonus()`: Streak milestone'larında bildirim gönderir
- Seviye atlama durumunda da bildirim gönderir

## Bildirim Mesajları

### Görev Tamamlama
```
🎉 Görev Tamamlandı!
"[Görev Adı]" görevini tamamladın! [X] coin ve [Y] XP kazandın.
```

### Yeni Görevler
```
📋 Yeni Görevler!
[X] yeni görev seni bekliyor. Hemen tamamla ve ödülleri kazan!
```

### Seviye Atlama
```
🎊 Seviye Atladın!
Tebrikler! [X]. seviyeye ulaştın ve [Y] bonus coin kazandın!
```

### Coin Kazanma
```
💰 Coin Kazandın!
[X] coin [kaynak]'dan kazandın!
```

### Ödül Satın Alma
```
🎁 Ödül Satın Alındı!
"[Ödül Adı]" ödülünü [X] coin karşılığında satın aldın. Ödüllerim sayfasından kullanabilirsin.
```

### Streak Milestone
```
🔥 Streak Milestone!
[X] streak yaptın! [Y] coin ve [Z] XP kazandın. [Rozet varsa: Ayrıca "[Rozet Adı]" rozetini kazandın!]
```

## Hata Yönetimi

Tüm bildirim fonksiyonları try-catch bloklarıyla sarılmıştır. Bildirim gönderme hatası, ana işlemi (görev tamamlama, ödül satın alma vb.) etkilemez. Hatalar console'a loglanır ancak işlem devam eder.

```typescript
try {
  await notifyQuestCompleted(...);
} catch (notifError) {
  console.error('Görev tamamlama bildirimi gönderme hatası:', notifError);
  // Bildirim hatası görev tamamlamasını etkilemez
}
```

## Kullanım Örnekleri

### Frontend'de Bildirimleri Gösterme

```typescript
// Bildirimleri getir
const response = await fetch('/api/notifications?limit=10&offset=0');
const { notifications, unreadCount } = await response.json();

// Okunmamış sayıyı göster
const countResponse = await fetch('/api/notifications/unread-count');
const { count } = await countResponse.json();

// Bildirimi okundu olarak işaretle
await fetch('/api/notifications/mark-read', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ notificationId: 'notif_123' })
});

// Tüm bildirimleri okundu olarak işaretle
await fetch('/api/notifications/mark-read', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ markAll: true })
});
```

## Sonraki Adımlar

1. **Frontend Bileşenleri:**
   - Bildirim dropdown bileşeni
   - Bildirim listesi sayfası
   - Bildirim badge (okunmamış sayı)
   - Toast bildirimleri

2. **Gerçek Zamanlı Bildirimler:**
   - WebSocket veya Server-Sent Events entegrasyonu
   - Push notification desteği

3. **Bildirim Tercihleri:**
   - Kullanıcıların hangi bildirimleri almak istediğini seçmesi
   - Email bildirimleri
   - Sessiz saatler

4. **Bildirim Gruplandırma:**
   - Benzer bildirimleri grupla
   - Özet bildirimler (günlük/haftalık)

## Test Senaryoları

1. ✅ Görev tamamlandığında bildirim oluşturulur
2. ✅ Yeni görevler atandığında bildirim oluşturulur
3. ✅ Seviye atlandığında bildirim oluşturulur
4. ✅ Büyük coin bonuslarında bildirim oluşturulur
5. ✅ Ödül satın alındığında bildirim oluşturulur
6. ✅ Streak milestone'larında bildirim oluşturulur
7. ✅ Bildirim hatası ana işlemi etkilemez
8. ✅ API endpoint'leri doğru çalışır

## Notlar

- Bildirim sistemi mevcut `Notification` modelini kullanır
- Tüm bildirimler veritabanına kaydedilir
- Bildirim metadata'sı JSON formatında saklanır
- Action URL'ler ilgili sayfalara yönlendirir
- Bildirim gönderme hataları loglanır ancak işlemi durdurmaz

# Quest Integration - Mevcut Sistemle Entegrasyon

Bu doküman, gamification görev sisteminin mevcut platform aktiviteleri ile nasıl entegre edildiğini açıklar.

## Genel Bakış

Görev sistemi, kullanıcıların platform üzerinde yaptıkları aktiviteleri otomatik olarak takip eder ve ilgili görevlerin ilerlemesini günceller. Ayrıca seviye atlama gibi önemli olaylarda bonus coin ödülleri verir.

## Entegrasyon Noktaları

### 1. Plan Oluşturma
**Dosya:** `src/app/api/plans/route.ts`
**Fonksiyon:** `onPlanCreated(userId)`
**Görev Tipi:** `CREATE_PLAN`

Kullanıcı yeni bir plan oluşturduğunda:
- Plan oluşturma görevi ilerleme kaydeder
- XP kazanır (mevcut sistem)
- Rozetler kontrol edilir (mevcut sistem)

### 2. Plan Onaylama
**Dosya:** `src/app/api/admin/plans/[id]/approve/route.ts`
**Fonksiyon:** `onPlanApproved(userId)`
**Görev Tipi:** `APPROVE_PLAN`

Admin bir planı onayladığında:
- Plan sahibinin onaylama görevi ilerleme kaydeder
- Ek XP kazanır (mevcut sistem)

### 3. Tarif Oluşturma
**Dosya:** `src/app/api/recipes/route.ts`
**Fonksiyon:** `onRecipeCreated(userId)`
**Görev Tipi:** `CREATE_RECIPE`

Kullanıcı yeni bir tarif oluşturduğunda:
- Tarif oluşturma görevi ilerleme kaydeder
- XP kazanır (mevcut sistem)

### 4. Tarif Onaylama
**Dosya:** `src/app/api/admin/recipes/[id]/approve/route.ts`
**Fonksiyon:** `onRecipeApproved(userId)`

Admin bir tarifi onayladığında:
- Tarif sahibi bilgilendirilir
- Ek XP kazanır (mevcut sistem)
- Rozet kontrolü yapılır (mevcut sistem)

### 5. Beğeni (Plan & Tarif)
**Dosyalar:** 
- `src/app/api/plans/[slug]/like/route.ts`
- `src/app/api/recipes/[slug]/like/route.ts`

**Fonksiyon:** `onLikeGiven(likerId, ownerId)`
**Görev Tipi:** `LIKE_COUNT`

Kullanıcı bir plan veya tarif beğendiğinde:
- Beğeni yapan kullanıcının görevi ilerleme kaydeder
- Beğeni alan kullanıcının görevi ilerleme kaydeder (farklı kullanıcıysa)
- Her iki kullanıcı da XP kazanır (mevcut sistem)

### 6. Yorum (Plan & Tarif)
**Dosyalar:**
- `src/app/api/comments/route.ts`
- `src/app/api/recipes/[slug]/comment/route.ts`

**Fonksiyon:** `onCommentGiven(commenterId, ownerId)`
**Görev Tipi:** `COMMENT_COUNT`

Kullanıcı yorum yaptığında:
- Yorum yapan kullanıcının görevi ilerleme kaydeder
- Yorum alan kullanıcının görevi ilerleme kaydeder (farklı kullanıcıysa)
- Her iki kullanıcı da XP kazanır (mevcut sistem)
- Bildirim gönderilir (mevcut sistem)

### 7. Günlük Giriş
**Dosya:** `src/lib/gamification.ts`
**Fonksiyon:** `onDailyLogin(userId)`
**Görev Tipi:** `DAILY_LOGIN`

Kullanıcı günlük giriş yaptığında (streak güncelleme):
- Günlük giriş görevi ilerleme kaydeder
- Streak sayacı güncellenir (mevcut sistem)
- XP kazanır (mevcut sistem)
- Streak rozetleri kontrol edilir (mevcut sistem)

### 8. Streak Milestone
**Dosyalar:**
- `src/lib/gamification.ts` (updateStreak fonksiyonu)
- `src/lib/streak-bonus.ts` (grantStreakBonus fonksiyonu)

**Fonksiyon:** `onStreakMilestone(userId, streakDays)`
**Görev Tipi:** `DAILY_LOGIN`

Kullanıcı streak milestone'a ulaştığında (7, 30, 100 gün):
- Streak görevi ilerleme kaydeder
- Bonus coin ve XP verilir (streak-bonus sistemi)
- Özel rozet verilir (mevcut sistem)
- Bildirim gönderilir

### 9. Seviye Atlama
**Dosya:** `src/lib/gamification.ts`
**Fonksiyon:** `onLevelUp(userId, newLevel, oldLevel)`
**Coin Kaynağı:** `LEVEL_UP`

Kullanıcı seviye atladığında:
- Her seviye için 50 coin bonus verilir
- Coin transaction kaydı oluşturulur
- Bildirim gönderilir (opsiyonel)

## Ek Entegrasyon Fonksiyonları

Aşağıdaki fonksiyonlar hazır ancak henüz API'lere entegre edilmemiştir:

### onWeightLogged(userId)
Kilo kaydı yapıldığında çağrılmalı
**Görev Tipi:** `WEIGHT_LOG`

### onCheckIn(userId)
Check-in yapıldığında çağrılmalı
**Görev Tipi:** `CHECK_IN`

### onUserFollowed(followerId)
Kullanıcı takip edildiğinde çağrılmalı
**Görev Tipi:** `FOLLOW_USER`

### onPlanViewed(userId)
Plan görüntülendiğinde çağrılmalı
**Görev Tipi:** `VIEW_PLANS`

## Hata Yönetimi

Tüm entegrasyon fonksiyonları try-catch bloğu ile korunmuştur. Görev sistemi hatası, ana aktiviteyi (plan oluşturma, yorum yapma vb.) etkilemez. Hatalar console'a loglanır ancak kullanıcı deneyimini bozmaz.

## Örnek Kullanım

```typescript
// Plan oluşturma API'sinde
import { onPlanCreated } from '@/lib/quest-integration';

// Plan oluşturulduktan sonra
await onPlanCreated(session.user.id);
```

```typescript
// Beğeni API'sinde
import { onLikeGiven } from '@/lib/quest-integration';

// Beğeni eklendikten sonra
await onLikeGiven(session.user.id, plan.userId);
```

## Test Senaryoları

1. **Plan Oluşturma Testi:**
   - Kullanıcı yeni plan oluşturur
   - Görev listesinde "Plan Oluştur" görevi ilerleme gösterir
   - Görev tamamlandığında ödül alınabilir

2. **Beğeni Testi:**
   - Kullanıcı A, Kullanıcı B'nin planını beğenir
   - Her iki kullanıcının da "Beğeni" görevi ilerleme kaydeder
   - XP kazanımları gerçekleşir

3. **Seviye Atlama Testi:**
   - Kullanıcı yeterli XP kazanır ve seviye atlar
   - Otomatik olarak 50 coin bonus alır
   - Coin transaction geçmişinde görünür

4. **Streak Testi:**
   - Kullanıcı 7 gün ardışık giriş yapar
   - Günlük giriş görevi her gün ilerleme kaydeder
   - 7. günde streak bonus alır (100 coin + 50 XP + rozet)

## Performans Notları

- Tüm görev güncellemeleri asenkron çalışır
- Ana aktivite akışını bloklamaz
- Hata durumunda sessizce loglanır
- Transaction kullanımı ile veri tutarlılığı sağlanır

## Gelecek Geliştirmeler

1. Kilo kaydı entegrasyonu
2. Check-in entegrasyonu
3. Takip sistemi entegrasyonu
4. Plan görüntüleme entegrasyonu
5. Toplu görev tamamlama bildirimleri
6. Görev zinciri (quest chain) desteği

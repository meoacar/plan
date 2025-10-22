# 🚀 Gamification Hızlı Başlangıç

## ✅ Kurulum Tamamlandı!

Gamification sistemi başarıyla kuruldu. Aşağıdaki adımlar zaten tamamlandı:

### 1. ✅ Veritabanı Migration
```bash
npx prisma migrate dev --name add_gamification
```

### 2. ✅ Seed Data (Rozetler ve Hedefler)
```bash
npm run db:seed:gamification
```

### 3. ✅ Eklenen Özellikler

#### Veritabanı
- ✅ User tablosuna: `xp`, `level`, `streak`, `lastActiveDate` alanları
- ✅ Badge tablosu (18 rozet tanımı)
- ✅ UserBadge tablosu (kullanıcı rozetleri)
- ✅ Goal tablosu (5 hedef tanımı)
- ✅ UserGoal tablosu (kullanıcı hedefleri)

#### API Endpoints
- ✅ `/api/gamification/stats` - Kullanıcı istatistikleri
- ✅ `/api/gamification/badges` - Rozetler
- ✅ `/api/gamification/leaderboard` - Liderlik tablosu
- ✅ `/api/gamification/streak` - Streak güncelleme

#### UI Bileşenleri
- ✅ `LevelProgress` - Seviye göstergesi
- ✅ `StreakCounter` - Streak sayacı
- ✅ `BadgeCard` - Rozet kartı
- ✅ `LeaderboardTable` - Liderlik tablosu
- ✅ `GamificationWidget` - Mini widget
- ✅ `BadgeNotification` - Rozet bildirimi
- ✅ `StreakTracker` - Otomatik streak takibi

#### Sayfalar
- ✅ `/gamification` - Ana gamification sayfası

#### Entegrasyonlar
- ✅ Plan oluşturma → XP kazanma
- ✅ Plan onaylanma → XP ve rozet kontrolü
- ✅ Beğeni sistemi → XP kazanma
- ✅ Yorum sistemi → XP kazanma
- ✅ Günlük giriş → Streak ve XP
- ✅ Navbar'a gamification linki

## 🎮 Nasıl Kullanılır?

### Kullanıcı Perspektifi

1. **Giriş Yap**: Her gün giriş yaparak streak'i artır (+10 XP)
2. **Plan Oluştur**: Yeni plan ekle (+50 XP, onaylanınca +100 XP)
3. **Etkileşim**: Beğen ve yorum yap (her biri XP kazandırır)
4. **Rozetler**: Aktivitelerle rozetler kazan
5. **Liderlik**: Liderlik tablosunda yüksel
6. **Seviye**: XP biriktirerek seviye atla

### Geliştirici Perspektifi

#### XP Ekleme
```typescript
import { addXP, XP_REWARDS } from "@/lib/gamification";

await addXP(userId, XP_REWARDS.PLAN_CREATED, "Plan oluşturuldu");
```

#### Rozet Kontrolü
```typescript
import { checkBadges } from "@/lib/gamification";

const newBadges = await checkBadges(userId);
```

#### Streak Güncelleme
```typescript
import { updateStreak } from "@/lib/gamification";

const result = await updateStreak(userId);
```

#### Liderlik Tablosu
```typescript
import { getLeaderboard } from "@/lib/gamification";

const leaders = await getLeaderboard("xp", 10);
```

## 📊 XP Ödülleri

| Aktivite | XP |
|----------|-----|
| Plan Oluşturma | 50 |
| Plan Onaylanma | 100 |
| Beğeni Alma | 5 |
| Yorum Alma | 10 |
| Yorum Yapma | 5 |
| Beğeni Verme | 2 |
| Günlük Giriş | 10 |

## 🏅 Rozetler

### Plan Rozetleri
- 🎯 İlk Adım (1 plan) - 50 XP
- 📝 Plan Ustası (5 plan) - 100 XP
- ⭐ Plan Kahramanı (10 plan) - 200 XP
- 👑 Plan Efsanesi (25 plan) - 500 XP

### Beğeni Rozetleri
- ❤️ Beğenilen (10 beğeni) - 75 XP
- 💖 Popüler (50 beğeni) - 150 XP
- 🌟 Süperstar (100 beğeni) - 300 XP

### Görüntülenme Rozetleri
- 👀 İlgi Çekici (100 görüntülenme) - 50 XP
- 🔥 Trend (500 görüntülenme) - 100 XP
- 💥 Viral (1000 görüntülenme) - 250 XP

### Yorum Rozetleri
- 💬 Konuşkan (10 yorum) - 50 XP
- 🗣️ Topluluk Dostu (50 yorum) - 150 XP

### Streak Rozetleri
- 📅 Haftalık Aktif (7 gün) - 100 XP
- 🗓️ Aylık Aktif (30 gün) - 300 XP
- 🏆 Sadık Kullanıcı (100 gün) - 1000 XP

## 🔄 Sonraki Adımlar

### Geliştirme Sunucusunu Başlat
```bash
npm run dev
```

### Test Et
1. Giriş yap
2. `/gamification` sayfasını ziyaret et
3. Plan oluştur ve XP kazan
4. Rozetleri kontrol et
5. Liderlik tablosunu incele

### Özelleştirme
- `src/lib/gamification.ts` - XP ödüllerini değiştir
- `prisma/seed-gamification.ts` - Rozet ve hedefleri düzenle
- `src/components/gamification/*` - UI bileşenlerini özelleştir

## 🐛 Sorun Giderme

### Prisma Client Hatası
```bash
npx prisma generate
```

### Migration Hatası
```bash
npx prisma migrate reset
npx prisma migrate dev
npm run db:seed:gamification
```

### TypeScript Hatası
```bash
npm run build
```

## 📚 Daha Fazla Bilgi

Detaylı dokümantasyon için `GAMIFICATION.md` dosyasına bakın.

## 🎉 Tebrikler!

Gamification sistemi kullanıma hazır! Kullanıcılarınız artık:
- ✅ XP kazanabilir
- ✅ Seviye atlayabilir
- ✅ Rozet toplayabilir
- ✅ Streak oluşturabilir
- ✅ Liderlik tablosunda yarışabilir

Başarılar! 🚀

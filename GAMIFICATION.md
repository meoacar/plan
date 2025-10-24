# 🎮 Gamification Sistemi

Bu dokümantasyon, Zayıflama Planım platformuna eklenen gamification (oyunlaştırma) sistemini açıklar.

## 📋 Özellikler

### 1. XP (Deneyim Puanı) Sistemi
Kullanıcılar çeşitli aktivitelerle XP kazanır:

#### Plan Aktiviteleri
- **Plan Oluşturma**: 50 XP
- **Plan Onaylanma**: 100 XP
- **Beğeni Alma**: 5 XP
- **Yorum Alma**: 10 XP
- **Yorum Yapma**: 5 XP
- **Beğeni Verme**: 2 XP

#### Tarif Aktiviteleri
- **Tarif Oluşturma**: 30 XP
- **Tarif Onaylanma**: 75 XP
- **Tarif Beğeni Alma**: 3 XP
- **Tarif Yorum Alma**: 8 XP
- **Tarif Yorum Yapma**: 3 XP

#### Diğer
- **Günlük Giriş**: 10 XP
- **Profil Tamamlama**: 25 XP
- **%100 Profil Tamamlama**: 100 XP

### 2. Seviye Sistemi
- XP biriktirerek seviye atlama
- Her seviye için gereken XP: `seviye² × 100`
- Örnek: Seviye 2 için 400 XP, Seviye 3 için 900 XP gerekir

### 3. Rozetler (Badges)
36 farklı rozet kategorisi:

#### Plan Rozetleri
- 🎯 **İlk Adım**: İlk planını oluştur (50 XP)
- 📝 **Plan Ustası**: 5 plan oluştur (100 XP)
- ⭐ **Plan Kahramanı**: 10 plan oluştur (200 XP)
- 👑 **Plan Efsanesi**: 25 plan oluştur (500 XP)

#### Beğeni Rozetleri
- ❤️ **Beğenilen**: 10 beğeni al (75 XP)
- 💖 **Popüler**: 50 beğeni al (150 XP)
- 🌟 **Süperstar**: 100 beğeni al (300 XP)

#### Görüntülenme Rozetleri
- 👀 **İlgi Çekici**: 100 görüntülenme (50 XP)
- 🔥 **Trend**: 500 görüntülenme (100 XP)
- 💥 **Viral**: 1000 görüntülenme (250 XP)

#### Yorum Rozetleri
- 💬 **Konuşkan**: 10 yorum yap (50 XP)
- 🗣️ **Topluluk Dostu**: 50 yorum yap (150 XP)

#### Aktivite Rozetleri
- 📅 **Haftalık Aktif**: 7 gün üst üste giriş (100 XP)
- 🗓️ **Aylık Aktif**: 30 gün üst üste giriş (300 XP)
- 🏆 **Sadık Kullanıcı**: 100 gün üst üste giriş (1000 XP)

#### Partner Rozetleri
- 🤝 **İlk Partner**: İlk partnerini edindin (100 XP)
- 💬 **Destekleyici Partner**: 50 destek notu ekledin (200 XP)
- 🎯 **Hedef Avcısı**: 10 ortak hedef tamamladın (300 XP)
- ⏳ **Uzun Soluklu Partner**: 90 gün aktif partnerlik (500 XP)
- ✨ **Motivasyon Kaynağı**: 100 motivasyon mesajı gönderdin (250 XP)

#### Tarif Rozetleri
- 🍽️ **İlk Tarif**: İlk tarifini paylaştın (30 XP)
- 👨‍🍳 **Aşçı Çırağı**: 5 tarif paylaştın (75 XP)
- 👨‍🍳 **Aşçıbaşı**: 10 tarif paylaştın (150 XP)
- 👨‍🍳 **Şef**: 25 tarif paylaştın (400 XP)
- 😋 **Lezzetli**: Tariflerin 10 beğeni aldı (50 XP)
- 🤤 **Nefis**: Tariflerin 50 beğeni aldı (125 XP)
- ⭐ **Muhteşem Lezzet**: Tariflerin 100 beğeni aldı (250 XP)
- 🏆 **Tarif Ustası**: 10+ tarif ve 50+ beğeni (300 XP)
- 👀 **Merak Uyandıran**: Tariflerin 100 görüntülenme aldı (40 XP)
- 🔥 **Popüler Tarif**: Tariflerin 500 görüntülenme aldı (80 XP)
- 💬 **Tartışılan Tarif**: Tariflerin 10 yorum aldı (60 XP)
- 🗣️ **Konuşulan Tarif**: Tariflerin 25 yorum aldı (120 XP)

#### Özel Rozetler
- 🚀 **Öncü**: İlk kullanıcılar (200 XP)
- 🤝 **Yardımsever**: Toplulukta aktif yardım (150 XP)
- 💪 **Zayıflama Kahramanı**: Hedefe ulaşma (500 XP)
- ✅ **Profil Tamamlandı**: Profilini %100 tamamladın (100 XP)

### 4. Streak (Ardışık Giriş) Sistemi
- Her gün giriş yaparak streak'i artır
- Streak kırılırsa 1'den başlar
- Günlük giriş bonusu: 10 XP
- Streak rozetleri: 7, 30, 100 gün

### 5. Liderlik Tablosu
Üç farklı kategori:
- ⭐ **En Yüksek XP**: En çok XP'ye sahip kullanıcılar
- ❤️ **En Çok Beğenilen**: En çok beğeni alan planlar
- 👀 **En Çok Görüntülenen**: En çok görüntülenen planlar

### 6. Hedefler (Goals)
Günlük, haftalık ve aylık hedefler:

#### Plan Hedefleri
- **Günlük Giriş**: Her gün giriş yap (10 XP)
- **Haftalık Plan**: Haftada 1 plan oluştur (50 XP)
- **Haftalık Yorum**: Haftada 3 yorum yap (30 XP)
- **Haftalık Beğeni**: Haftada 5 plan beğen (20 XP)
- **Aylık Aktif**: Ayda 15 gün aktif ol (100 XP)

#### Tarif Hedefleri
- **Haftalık Tarif**: Haftada 1 tarif paylaş (40 XP)
- **Aylık Tarif**: Ayda 3 tarif paylaş (120 XP)
- **Haftalık Tarif Yorumu**: Haftada tariflere 3 yorum yap (25 XP)
- **Aylık Tarif Paylaşımı**: Ayda 5 tarif paylaş (200 XP)

## 🗄️ Veritabanı Şeması

### Yeni Tablolar
- `Badge`: Rozet tanımları
- `UserBadge`: Kullanıcı rozetleri
- `Goal`: Hedef tanımları
- `UserGoal`: Kullanıcı hedefleri

### User Tablosuna Eklenenler
- `xp`: Toplam deneyim puanı
- `level`: Seviye
- `streak`: Ardışık giriş sayısı
- `lastActiveDate`: Son aktif olma tarihi

## 🚀 Kurulum

### 1. Veritabanı Migration
```bash
cd zayiflamaplanim
npx prisma migrate dev --name add_gamification
```

### 2. Seed Data (Rozetler ve Hedefler)
```bash
npx tsx prisma/seed-gamification.ts
```

### 3. Prisma Client Güncelleme
```bash
npx prisma generate
```

## 📡 API Endpoints

### Gamification Stats
```
GET /api/gamification/stats
```
Kullanıcının XP, seviye, streak ve rozet bilgilerini döner.

### Rozetler
```
GET /api/gamification/badges
```
Kullanıcının kazandığı ve tüm rozetleri döner.

### Liderlik Tablosu
```
GET /api/gamification/leaderboard?type=xp&limit=10
```
Parametreler:
- `type`: "xp" | "likes" | "views"
- `limit`: Sonuç sayısı (varsayılan: 10)

### Streak Güncelleme
```
POST /api/gamification/streak
```
Kullanıcının streak'ini günceller (otomatik çağrılır).

## 🎨 UI Bileşenleri

### LevelProgress
Kullanıcının seviye ve XP ilerlemesini gösterir.

### StreakCounter
Ardışık giriş sayısını gösterir.

### BadgeCard
Rozet kartı (kazanılmış veya kazanılmamış).

### LeaderboardTable
Liderlik tablosu (3 kategori).

### StreakTracker
Arka planda streak güncellemesi yapar (görünmez).

## 📄 Sayfalar

### /gamification
Ana gamification sayfası:
- Seviye ve XP gösterimi
- Streak sayacı
- Liderlik tablosu
- Kazanılan rozetler
- Tüm rozetler

## 🔄 Otomatik Entegrasyonlar

### Plan Oluşturma
- Plan oluşturulduğunda: +50 XP
- Plan onaylandığında: +100 XP
- Rozet kontrolü yapılır

### Beğeni Sistemi
- Beğeni veren: +2 XP
- Beğeni alan: +5 XP
- Rozet kontrolü yapılır

### Yorum Sistemi
- Yorum yapan: +5 XP
- Yorum alan: +10 XP
- Rozet kontrolü yapılır

### Günlük Giriş
- Her sayfa yüklendiğinde streak kontrolü
- Ardışık giriş: +10 XP
- Streak rozetleri otomatik verilir

## 🎯 Gelecek Geliştirmeler

1. **Hedef Sistemi**: Günlük/haftalık hedefler ve takibi
2. **Bildirimler**: Rozet kazanma ve seviye atlama bildirimleri
3. **Profil Rozetleri**: Profilde rozet gösterimi
4. **Rozet Paylaşımı**: Sosyal medyada rozet paylaşımı
5. **Özel Rozetler**: Sezonluk veya etkinlik rozetleri
6. **Liderlik Ödülleri**: Haftalık/aylık liderlik ödülleri

## 📊 İstatistikler

Gamification sistemi aşağıdaki metrikleri takip eder:
- Toplam XP kazanımı
- Seviye dağılımı
- Rozet kazanma oranları
- Ortalama streak süresi
- Liderlik tablosu değişimleri

## 🔧 Bakım

### Rozet Kontrolü
Rozetler otomatik olarak kontrol edilir, ancak manuel kontrol için:
```typescript
import { checkBadges } from "@/lib/gamification";
await checkBadges(userId);
```

### XP Ekleme
```typescript
import { addXP } from "@/lib/gamification";
await addXP(userId, amount, "Sebep");
```

### Streak Güncelleme
```typescript
import { updateStreak } from "@/lib/gamification";
await updateStreak(userId);
```

## 🎮 Kullanım İpuçları

1. **Düzenli Giriş**: Her gün giriş yaparak streak'i koru
2. **Aktif Katılım**: Yorum yap, beğen, plan paylaş
3. **Kaliteli İçerik**: Beğeni ve görüntülenme için kaliteli planlar oluştur
4. **Topluluk**: Diğer kullanıcılarla etkileşim kur
5. **Hedefler**: Günlük ve haftalık hedefleri takip et

---

**Not**: Gamification sistemi kullanıcı deneyimini artırmak ve platformda aktif katılımı teşvik etmek için tasarlanmıştır.

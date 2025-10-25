# Sosyal Grup Sistemi Migration Rehberi

## ✅ Migration Durumu: TAMAMLANDI

**Tarih:** 25 Ekim 2025  
**Durum:** Database şeması güncel, Prisma Client güncellendi

## 🚀 Kurulum Adımları

### 1. Database Migration ✅ TAMAMLANDI

Migration'lar database'de zaten çalıştırılmış durumda. Prisma Client güncellemesi yapıldı:

```bash
cd zayiflamaplanim
npx prisma db pull      # ✅ Tamamlandı
npx prisma generate     # ✅ Tamamlandı
```

### 2. Rozet Ekleme (Opsiyonel)

Database'e yeni rozetleri ekleyin:

```sql
-- PostgreSQL için
INSERT INTO "Badge" (id, type, name, description, icon, "xpReward", "createdAt")
VALUES
  (gen_random_uuid(), 'GROUP_CREATOR', 'Grup Kurucusu', 'İlk grubunu oluştur', '👥', 50, NOW()),
  (gen_random_uuid(), 'GROUP_ADMIN', 'Grup Yöneticisi', 'Bir grubun admini ol', '⭐', 30, NOW()),
  (gen_random_uuid(), 'CHALLENGE_WINNER', 'Challenge Şampiyonu', 'Bir challenge''ı kazan', '🏆', 100, NOW()),
  (gen_random_uuid(), 'CHALLENGE_PARTICIPANT', 'Challenge Katılımcısı', 'İlk challenge''a katıl', '🎯', 20, NOW()),
  (gen_random_uuid(), 'SOCIAL_BUTTERFLY', 'Sosyal Kelebek', '10 kişiyi takip et', '🦋', 40, NOW());
```

### 3. Test Verisi Ekleme (Opsiyonel)

Test için örnek grup oluşturun:

```sql
-- Örnek grup
INSERT INTO "Group" (id, name, slug, description, "goalType", "isPrivate", status, "createdBy", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Kilo Verme Grubu', 'kilo-verme-grubu', 'Birlikte kilo verelim!', 'weight-loss', false, 'APPROVED', 'USER_ID_BURAYA', NOW(), NOW());

-- Örnek challenge
INSERT INTO "Challenge" (id, title, description, type, target, unit, "startDate", "endDate", "isActive", "createdBy", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Haftalık Kilo Challenge', '1 haftada en çok kilo veren kazanır!', 'WEIGHT_LOSS', 2, 'kg', NOW(), NOW() + INTERVAL '7 days', true, 'USER_ID_BURAYA', NOW(), NOW());
```

## 📝 Kontrol Listesi

- [x] Database migration çalıştırıldı ✅
- [x] Prisma client güncellendi ✅
- [ ] Rozetler eklendi (opsiyonel)
- [ ] Admin panelde "Gruplar" menüsü görünüyor
- [ ] Admin panelde "Challenge'lar" menüsü görünüyor
- [ ] Kullanıcı tarafında "/groups" sayfası çalışıyor
- [ ] Kullanıcı tarafında "/challenges" sayfası çalışıyor
- [ ] Kullanıcı tarafında "/friend-suggestions" sayfası çalışıyor
- [ ] Grup oluşturma formu çalışıyor
- [ ] Admin grup onaylama/reddetme çalışıyor

## 🧪 Test Senaryoları

### 1. Grup Oluşturma Testi
1. Kullanıcı olarak giriş yapın
2. "/groups/create" sayfasına gidin
3. Formu doldurun ve gönderin
4. Grup PENDING durumunda oluşturulmalı

### 2. Admin Onay Testi
1. Admin olarak giriş yapın
2. "/admin/groups" sayfasına gidin
3. Bekleyen grupları görün
4. Bir grubu onaylayın veya reddedin

### 3. Challenge Katılım Testi
1. Kullanıcı olarak giriş yapın
2. "/challenges" sayfasına gidin
3. Aktif bir challenge'a katılın
4. Katılım başarılı olmalı

### 4. Arkadaş Önerisi Testi
1. Kullanıcı olarak giriş yapın
2. "/friend-suggestions" sayfasına gidin
3. Benzer kullanıcıları görün
4. Birini takip edin

## 🔧 Sorun Giderme

### Migration Hatası
```bash
# Migration'ı sıfırla
npx prisma migrate reset

# Yeniden çalıştır
npx prisma migrate dev --name add_social_groups
```

### Prisma Client Hatası
```bash
# Client'ı yeniden oluştur
npx prisma generate
```

### Type Hatası
```bash
# TypeScript cache'i temizle
rm -rf .next
npm run build
```

## 📊 Veritabanı İndeksleri

Performans için önemli indeksler:

```sql
-- Grup indeksleri
CREATE INDEX IF NOT EXISTS "Group_status_createdAt_idx" ON "Group"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Group_goalType_idx" ON "Group"("goalType");

-- Challenge indeksleri
CREATE INDEX IF NOT EXISTS "Challenge_isActive_idx" ON "Challenge"("isActive");
CREATE INDEX IF NOT EXISTS "Challenge_startDate_endDate_idx" ON "Challenge"("startDate", "endDate");

-- Leaderboard indeksleri
CREATE INDEX IF NOT EXISTS "ChallengeLeaderboard_challengeId_rank_idx" ON "ChallengeLeaderboard"("challengeId", "rank");
```

## 🎯 Sonraki Adımlar

1. Grup içi mesajlaşma sistemi
2. Challenge ödül sistemi
3. Grup istatistikleri dashboard'u
4. Otomatik leaderboard güncelleme
5. Grup moderasyon araçları
6. Challenge şablonları
7. Grup rozetleri
8. Grup etkinlikleri

## 📞 Destek

Sorun yaşarsanız:
1. Console loglarını kontrol edin
2. Database bağlantısını kontrol edin
3. Prisma schema'yı kontrol edin
4. Migration geçmişini kontrol edin: `npx prisma migrate status`

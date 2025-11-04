# Gamification Seed Dosyaları

Bu klasörde gelişmiş gamification sistemi için seed (başlangıç) verileri bulunmaktadır.

## 📁 Dosyalar

### 1. `seed-gamification-quests.ts`
Görev sistemi için başlangıç verileri:
- **Günlük Görevler**: 7 farklı günlük görev (giriş, plan oluşturma, beğeni, yorum, vb.)
- **Haftalık Görevler**: 7 farklı haftalık görev (çoklu plan, aktif günler, vb.)
- **Özel Görevler**: 8 farklı özel görev (milestone'lar, başarılar)

**Toplam**: 22 görev

### 2. `seed-gamification-rewards.ts`
Mağaza ödülleri için başlangıç verileri:
- **Dijital Ödüller**:
  - 4 rozet (Altın Yıldız, Elmas, Ateş, Gökkuşağı)
  - 3 profil teması (Karanlık Mod, Okyanus, Gün Batımı)
  - 2 avatar çerçevesi (Altın, Gökkuşağı)
- **Fiziksel Ödüller**:
  - 3 indirim kodu (%10, %20, %50)
  - 2 hediye çeki (50 TL, 100 TL)
- **Premium Özellikler**:
  - 2 reklamsız paket (7 gün, 30 gün)
  - 1 premium istatistik paketi (30 gün)
  - 1 özel profil paketi (30 gün)

**Toplam**: 18 ödül

### 3. `seed-gamification-games.ts`
Mini oyunlar için başlangıç verileri:
- **Kalori Tahmin Oyunu**: 10 soruluk kalori tahmin oyunu
- **Hafıza Kartları**: 4x4 grid hafıza kartları oyunu
- **Hızlı Tıklama Challenge**: 30 saniyelik hızlı tıklama oyunu

**Toplam**: 3 oyun

Her oyun için:
- Oyun ayarları (süre, puan sistemi, vb.)
- Ödül katmanları (bronze, silver, gold)
- Günlük limit (5 oyun/gün)

### 4. `seed-gamification-streak-bonuses.ts`
Streak (ardışık giriş) bonusları için başlangıç verileri:
- 7 gün: 100 coin + 50 XP + rozet
- 14 gün: 250 coin + 100 XP
- 30 gün: 500 coin + 250 XP + rozet
- 60 gün: 1000 coin + 500 XP
- 100 gün: 2000 coin + 1000 XP + rozet
- 180 gün: 3500 coin + 1500 XP
- 365 gün: 10000 coin + 5000 XP

**Toplam**: 7 milestone

### 5. `seed-gamification-all.ts`
Tüm gamification seed dosyalarını tek seferde çalıştıran master script.

## 🚀 Kullanım

### Tüm Gamification Verilerini Ekle
```bash
npm run db:seed:gamification-all
```

### Sadece Görevleri Ekle
```bash
npm run db:seed:gamification-quests
```

### Sadece Ödülleri Ekle
```bash
npm run db:seed:gamification-rewards
```

### Sadece Oyunları Ekle
```bash
npm run db:seed:gamification-games
```

### Sadece Streak Bonuslarını Ekle
```bash
npm run db:seed:gamification-streak-bonuses
```

## ⚠️ Önemli Notlar

1. **Veritabanı Modelleri**: Bu seed dosyalarını çalıştırmadan önce, aşağıdaki modellerin Prisma schema'da tanımlı olması gerekir:
   - `Quest`
   - `UserQuest`
   - `Reward`
   - `UserReward`
   - `MiniGame`
   - `GameSession`
   - `StreakBonus`
   - `CoinTransaction`

2. **Migration**: Modeller eklendikten sonra migration çalıştırılmalıdır:
   ```bash
   npx prisma migrate dev
   ```

3. **Upsert Kullanımı**: Tüm seed dosyaları `upsert` kullanır, bu sayede:
   - İlk çalıştırmada veriler eklenir
   - Sonraki çalıştırmalarda veriler güncellenir
   - Veri kaybı olmaz

4. **ID'ler**: Tüm kayıtlar sabit ID'lerle oluşturulur, bu sayede:
   - Referans kolaylığı
   - Test edilebilirlik
   - Tutarlılık

## 📊 Veri Yapısı

### Görev Kategorileri
- `ACTIVITY`: Genel aktivite görevleri (giriş, görüntüleme)
- `PLAN`: Plan oluşturma görevleri
- `SOCIAL`: Sosyal etkileşim görevleri (beğeni, yorum)
- `RECIPE`: Tarif ile ilgili görevler

### Görev Tipleri
- `DAILY`: Günlük görevler (her gün sıfırlanır)
- `WEEKLY`: Haftalık görevler (her Pazartesi sıfırlanır)
- `SPECIAL`: Özel görevler (bir kez tamamlanır)

### Ödül Kategorileri
- `DIGITAL`: Dijital ödüller (rozet, tema, çerçeve)
- `PHYSICAL`: Fiziksel ödüller (indirim kodu, hediye çeki)
- `PREMIUM`: Premium özellikler (reklamsız, özel istatistikler)

### Ödül Tipleri
- `BADGE`: Rozet
- `THEME`: Profil teması
- `FRAME`: Avatar çerçevesi
- `AVATAR`: Avatar
- `DISCOUNT_CODE`: İndirim kodu
- `GIFT_CARD`: Hediye çeki
- `AD_FREE`: Reklamsız deneyim
- `PREMIUM_STATS`: Premium istatistikler
- `CUSTOM_PROFILE`: Özel profil

## 🔄 Güncelleme

Seed verilerini güncellemek için:

1. İlgili seed dosyasını düzenle
2. Script'i tekrar çalıştır (upsert sayesinde güvenli)
3. Değişiklikler otomatik olarak uygulanır

## 🧪 Test

Seed verilerinin doğru eklendiğini kontrol etmek için:

```bash
# Prisma Studio'yu aç
npx prisma studio

# Veya veritabanını sorgula
npx prisma db pull
```

## 📝 Özelleştirme

Kendi verilerinizi eklemek için:

1. İlgili seed dosyasını kopyalayın
2. Verileri düzenleyin
3. Yeni bir script ekleyin (package.json)
4. Çalıştırın

Örnek:
```typescript
const customQuests = [
  {
    id: "custom-quest-1",
    type: "DAILY",
    category: "CUSTOM",
    title: "Özel Görev",
    // ... diğer alanlar
  },
];
```

## 🎯 Sonraki Adımlar

Seed verileri eklendikten sonra:

1. API endpoint'lerini test edin
2. Frontend bileşenlerini test edin
3. Görev atama sistemini test edin
4. Ödül satın alma sistemini test edin
5. Oyun sistemini test edin

## 📚 Daha Fazla Bilgi

- [Tasarım Dokümanı](../../.kiro/specs/gamification-extended/design.md)
- [Gereksinimler](../../.kiro/specs/gamification-extended/requirements.md)
- [Görev Listesi](../../.kiro/specs/gamification-extended/tasks.md)

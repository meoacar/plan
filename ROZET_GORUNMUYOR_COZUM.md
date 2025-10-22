# 🔧 Rozet Görünmüyor - Çözüm

## Sorun
`http://localhost:3000/gamification` sayfasında "Profil Tamamlandı" rozeti görünmüyor.

## Neden?
Database'de rozet tanımları eksik olabilir. Seed dosyası çalıştırılmamış olabilir.

## ✅ Çözüm Adımları

### 1. Seed Dosyasını Çalıştır

Terminal'de şu komutu çalıştır:

```bash
npm run db:seed:gamification
```

Bu komut tüm rozetleri database'e ekleyecek.

### 2. Beklenen Çıktı

```
🎮 Gamification verileri ekleniyor...
✅ 24 rozet eklendi
✅ 5 hedef eklendi
🎮 Gamification verileri başarıyla eklendi!
```

### 3. Sayfayı Yenile

Tarayıcıda `http://localhost:3000/gamification` sayfasını yenile (F5).

### 4. Kontrol Et

"🎯 Tüm Rozetler" bölümünde şu rozeti görmelisin:

```
✅ Profil Tamamlandı
Profilini %100 tamamladın
+100 XP
```

## 🎯 Rozeti Kazanmak İçin

### Adım 1: Profil Ayarlarına Git
`http://localhost:3000/profile/edit`

### Adım 2: Tüm Alanları Doldur

Sol tarafta "Profil Tamamlama" kartını göreceksin. Şu 7 alanı doldur:

1. ✅ **İsim Soyisim** - Dolu olmalı
2. ✅ **Hakkında** - Birkaç cümle yaz
3. ✅ **Profil Resmi** - Resim yükle veya avatar seç
4. ✅ **Şehir** - Şehir adı gir (örn: İstanbul)
5. ✅ **Başlangıç Kilosu** - Sayı gir (örn: 85)
6. ✅ **Hedef Kilo** - Sayı gir (örn: 70)
7. ✅ **Sosyal Medya** - En az 1 tane ekle (Instagram, Twitter, vb.)

### Adım 3: Kaydet

"Değişiklikleri Kaydet" butonuna tıkla.

### Adım 4: Rozet Popup'ı

%100 tamamlandığında:
- 🎉 Animasyonlu popup açılır
- ✅ "Profil Tamamlandı" rozeti gösterilir
- ⭐ "+100 XP" yazısı görünür
- 5 saniye sonra otomatik kapanır

### Adım 5: Gamification Sayfasını Kontrol Et

`http://localhost:3000/gamification` sayfasına git.

"🏅 Rozetlerim" bölümünde rozeti göreceksin!

## 🔍 Sorun Devam Ediyorsa

### Database'i Kontrol Et

Prisma Studio'yu aç:

```bash
npx prisma studio
```

1. **Badge** tablosuna git
2. `type = "PROFILE_COMPLETE"` olan kaydı ara
3. Yoksa seed'i tekrar çalıştır

### User Badge Kontrolü

1. **UserBadge** tablosuna git
2. Kendi `userId` ile filtreleme yap
3. `PROFILE_COMPLETE` rozeti var mı kontrol et

### API Kontrolü

Browser console'u aç (F12) ve profil güncellerken şu response'u kontrol et:

```json
{
  "profileCompletion": {
    "completed": true,
    "percentage": 100,
    "newBadge": {
      "badge": {
        "name": "Profil Tamamlandı",
        "xpReward": 100
      }
    }
  }
}
```

## 📊 Tüm Rozetler Listesi

Seed dosyasında toplam **24 rozet** var:

### Plan Rozetleri
- 🎯 İlk Adım (İlk plan)
- 📝 Plan Ustası (5 plan)
- ⭐ Plan Kahramanı (10 plan)
- 👑 Plan Efsanesi (25 plan)

### Beğeni Rozetleri
- ❤️ Beğenilen (10 beğeni)
- 💖 Popüler (50 beğeni)
- 🌟 Süperstar (100 beğeni)

### Görüntülenme Rozetleri
- 👀 İlgi Çekici (100 görüntülenme)
- 🔥 Trend (500 görüntülenme)
- 💥 Viral (1000 görüntülenme)

### Yorum Rozetleri
- 💬 Konuşkan (10 yorum)
- 🗣️ Topluluk Dostu (50 yorum)

### Aktiflik Rozetleri
- 📅 Haftalık Aktif (7 gün streak)
- 🗓️ Aylık Aktif (30 gün streak)
- 🏆 Sadık Kullanıcı (100 gün streak)

### Özel Rozetler
- 🚀 Öncü (İlk kullanıcılar)
- 🤝 Yardımsever (Topluluk yardımı)
- 💪 Zayıflama Kahramanı (Hedefe ulaşma)

### Partner Rozetleri
- 🤝 İlk Partner
- 💬 Destekleyici Partner (50 destek notu)
- 🎯 Hedef Avcısı (10 ortak hedef)
- ⏳ Uzun Soluklu Partner (90 gün)
- ✨ Motivasyon Kaynağı (100 mesaj)

### Profil Rozeti
- ✅ **Profil Tamamlandı** (Profil %100)

## 🚀 Hızlı Test

Tüm adımları tek seferde test et:

```bash
# 1. Seed çalıştır
npm run db:seed:gamification

# 2. Dev server'ı başlat (zaten çalışıyorsa gerek yok)
npm run dev

# 3. Tarayıcıda aç
# http://localhost:3000/profile/edit

# 4. Tüm alanları doldur ve kaydet

# 5. Gamification sayfasını kontrol et
# http://localhost:3000/gamification
```

## ✅ Başarı Kriterleri

- [ ] Seed başarıyla çalıştı
- [ ] 24 rozet database'de
- [ ] Profil %100 tamamlandı
- [ ] Popup göründü
- [ ] +100 XP alındı
- [ ] Rozet gamification sayfasında görünüyor

---

**Not**: Sorun devam ederse, terminal'deki hata mesajlarını kontrol et veya browser console'da network tab'ı incele.

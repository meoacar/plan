# 🎬 Tanıtım Sistemi

Zayıflama Planım için admin panelinden yönetilebilir tanıtım sistemi.

## 📋 Özellikler

### 1. **Tanıtım Bölümleri** (Promo Sections)
- Hero bölümleri
- Video tanıtımları
- Özellik kartları
- Nasıl çalışır bölümleri
- Referanslar
- CTA (Call-to-Action) bölümleri
- İstatistikler

### 2. **Özellikler** (Features)
Site özelliklerini kartlar halinde gösterir:
- 🎯 Gerçek Planlar
- 💬 Günah Duvarı
- 🍲 Tarif Alanı
- 🔥 XP Sistemi

### 3. **Mikro Kopyalar** (Micro Copy)
Sitedeki küçük, motive edici mesajlar:
- "Planın kaydedildi. Şimdi harekete geçme zamanı 💪"
- "Tatlı da seni haklı buldu 🍰"
- "Hoş geldin! Bugün biraz daha hafif hissedeceksin."

### 4. **Kullanıcı Hikayeleri** (User Stories)
Başarı hikayeleri:
- Önce/Sonra fotoğrafları
- Kilo kaybı bilgisi
- Süre bilgisi
- Hikaye metni
- Alıntılar

### 5. **Referanslar** (Testimonials)
Kullanıcı yorumları ve değerlendirmeleri

## 🚀 Kullanım

### Admin Paneli

1. **Admin Paneline Giriş**
   ```
   /admin/promo
   ```

2. **Yeni Özellik Ekleme**
   - Admin Panel > Tanıtım > Özellikler
   - "Yeni Özellik" butonuna tıkla
   - Form doldur ve kaydet

3. **Mikro Kopy Ekleme**
   - Admin Panel > Tanıtım > Mikro Kopyalar
   - Key, location ve text bilgilerini gir
   - Kaydet

4. **Kullanıcı Hikayesi Ekleme**
   - Admin Panel > Tanıtım > Kullanıcı Hikayeleri
   - Hikaye detaylarını gir
   - "Öne Çıkan" olarak işaretle (isteğe bağlı)
   - Kaydet

### Frontend Kullanımı

#### Keşfet Sayfası
```
/kesfet
```
Tüm tanıtım bileşenlerini içeren özel sayfa.

#### Bileşenleri Kullanma

```tsx
import FeaturesSection from "@/components/promo/FeaturesSection";
import UserStoriesSection from "@/components/promo/UserStoriesSection";
import GamificationInfo from "@/components/promo/GamificationInfo";

export default function MyPage() {
  return (
    <>
      <FeaturesSection />
      <UserStoriesSection />
      <GamificationInfo />
    </>
  );
}
```

#### Mikro Kopy Kullanma

```tsx
// API'den mikro kopy çekme
const response = await fetch('/api/promo/microcopy/plan_saved');
const microcopy = await response.json();
console.log(microcopy.text); // "Planın kaydedildi. Şimdi harekete geçme zamanı 💪"
```

## 📊 Veritabanı Modelleri

### PromoSection
```prisma
model PromoSection {
  id          String            @id @default(cuid())
  type        PromoSectionType  // HERO, VIDEO, FEATURES, etc.
  title       String
  subtitle    String?
  content     String?
  imageUrl    String?
  videoUrl    String?
  buttonText  String?
  buttonUrl   String?
  order       Int               @default(0)
  isActive    Boolean           @default(true)
}
```

### PromoFeature
```prisma
model PromoFeature {
  id          String   @id @default(cuid())
  icon        String   // Icon adı (target, message, utensils, zap)
  title       String
  description String
  color       String   @default("#10b981")
  order       Int      @default(0)
  isActive    Boolean  @default(true)
}
```

### MicroCopy
```prisma
model MicroCopy {
  id        String   @id @default(cuid())
  key       String   @unique
  location  String   // plan_form, confession_wall, login, etc.
  text      String
  isActive  Boolean  @default(true)
}
```

### UserStory
```prisma
model UserStory {
  id           String   @id @default(cuid())
  name         String
  beforeImage  String?
  afterImage   String?
  beforeWeight Int?
  afterWeight  Int?
  duration     String?
  story        String
  quote        String?
  isActive     Boolean  @default(true)
  isFeatured   Boolean  @default(false)
  order        Int      @default(0)
}
```

## 🎨 Tasarım Felsefesi

### Hikâyeleştirme
Madde madde değil, hikâye anlatımı:
> "Kendine ait bir plan oluştur. Takipçilerin seni alkışlasın. Birkaç emojiyle duygunu paylaş."

### Esprili Mikro Kopyalar
Her yerde şakacı ama motive eden yazılar:
- Plan kaydederken: "Planın kaydedildi. Şimdi harekete geçme zamanı 💪"
- Yeme günahı paylaşırken: "Tatlı da seni haklı buldu 🍰"

### Oyunlaştırma Tanıtımı
Görsel infografiklerle XP sistemi:
- Beğeni = +2 XP
- Yorum = +5 XP
- Plan paylaş = Yeni Rozet 🎖️

## 🔧 API Endpoints

### Admin API (Yetki Gerekli)
- `GET /api/admin/promo/sections` - Tüm bölümleri listele
- `POST /api/admin/promo/sections` - Yeni bölüm ekle
- `GET /api/admin/promo/features` - Tüm özellikleri listele
- `POST /api/admin/promo/features` - Yeni özellik ekle
- `GET /api/admin/promo/microcopy` - Tüm mikro kopyları listele
- `POST /api/admin/promo/microcopy` - Yeni mikro kopy ekle
- `GET /api/admin/promo/stories` - Tüm hikayeleri listele
- `POST /api/admin/promo/stories` - Yeni hikaye ekle
- `GET /api/admin/promo/testimonials` - Tüm referansları listele
- `POST /api/admin/promo/testimonials` - Yeni referans ekle

### Public API
- `GET /api/promo/features` - Aktif özellikleri listele
- `GET /api/promo/stories?featured=true` - Öne çıkan hikayeleri listele
- `GET /api/promo/microcopy/[key]` - Belirli bir mikro kopyayı getir

## 📝 Örnek Veriler

Sistem örnek verilerle gelir. Seed dosyasını çalıştırmak için:

```bash
npx tsx prisma/seed-promo.ts
```

Bu şunları ekler:
- 4 özellik kartı
- 5 mikro kopy
- 3 kullanıcı hikayesi
- 3 referans
- 2 tanıtım bölümü

## 🎯 Gelecek Özellikler

- [ ] Video yükleme desteği
- [ ] A/B testing
- [ ] Analitik entegrasyonu
- [ ] Çoklu dil desteği
- [ ] Drag & drop sıralama
- [ ] Önizleme modu
- [ ] Zamanlı yayınlama

## 💡 İpuçları

1. **Mikro Kopylar**: Her önemli aksiyonda kullanıcıyı motive eden mesajlar ekleyin
2. **Hikayeler**: Gerçek kullanıcı hikayelerini düzenli olarak güncelleyin
3. **Özellikler**: Yeni özellikler eklediğinizde buradan tanıtın
4. **Sıralama**: `order` alanını kullanarak görünüm sırasını kontrol edin
5. **Aktiflik**: `isActive` ile içerikleri yayından kaldırmadan gizleyebilirsiniz

## 🤝 Katkıda Bulunma

Yeni tanıtım bileşenleri veya özellikler eklemek için:
1. Yeni bileşeni `src/components/promo/` altında oluştur
2. Gerekirse yeni API endpoint'i ekle
3. Admin paneline yönetim sayfası ekle
4. Bu README'yi güncelle

---

**Slogan**: "Plan değil, Yol Arkadaşı" 🚀
